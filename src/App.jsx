import { useState, useEffect } from "react";
import "./App.css";
import GastoForm from "./components/GastoForm";
import StatusIndicator from "./components/StatusIndicator";
import ThemeToggle from "./components/ThemeToggle";
import InstallPrompt from "./components/InstallPrompt";
import Dashboard from "./components/Dashboard";
import { sincronizarGastos, obterGastosPendentes } from "./services/offlineSync";

const API_URL = "https://script.google.com/macros/s/AKfycbx3fyCP6ywDGOi8X3iybSl3fRSGaj1kppi_sPornjSEVulfv4cVvHM9VbeHPiRoQC68/exec";

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [abaAtiva, setAbaAtiva] = useState('gastos');
  const [gastosPendentes, setGastosPendentes] = useState(0);

  useEffect(() => {
    // Registrar Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/GastosApp/sw.js")
        .then((reg) => console.log("✅ Service Worker registrado!", reg))
        .catch((err) => console.error("❌ Erro no Service Worker:", err));
    }

    // Monitorar status de conexão
    const handleOnline = async () => {
      setIsOnline(true);
      
      // Sincronizar gastos pendentes quando voltar online
      const resultado = await sincronizarGastos(API_URL);
      if (resultado.sucesso > 0) {
        alert(`✅ ${resultado.sucesso} gastos offline foram sincronizados!`);
      }
      verificarGastosPendentes();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Verificar gastos pendentes ao carregar
    verificarGastosPendentes();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const verificarGastosPendentes = async () => {
    const pendentes = await obterGastosPendentes();
    setGastosPendentes(pendentes.length);
  };

  return (
    <div className="app-container">
      <div className="container">
        <header>
          <div className="header-content">
            <h1>💰 Controle de Gastos</h1>
            <div className="header-actions">
              <StatusIndicator isOnline={isOnline} />
              <ThemeToggle />
            </div>
          </div>
          
          {gastosPendentes > 0 && (
            <div className="sync-badge">
              📤 {gastosPendentes} gasto{gastosPendentes > 1 ? 's' : ''} aguardando sincronização
            </div>
          )}
        </header>

        <nav className="tabs">
          <button 
            className={`tab-btn ${abaAtiva === 'gastos' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('gastos')}
          >
            💵 Adicionar Gasto
          </button>
          <button 
            className={`tab-btn ${abaAtiva === 'dashboard' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('dashboard')}
          >
            📊 Dashboard
          </button>
        </nav>

        <div className="tab-content">
          {abaAtiva === 'gastos' ? (
            <GastoForm 
              apiUrl={API_URL} 
              onGastoSalvo={verificarGastosPendentes}
            />
          ) : (
            <Dashboard apiUrl={API_URL} />
          )}
        </div>
      </div>

      <InstallPrompt />
    </div>
  );
}

export default App;
