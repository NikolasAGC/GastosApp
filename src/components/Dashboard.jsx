import { useState, useEffect } from 'react'
import GraficoGastos from './GraficoGastos'
import PeriodoSelector from './PeriodoSelector'
import OrcamentoAlert from './OrcamentoAlert'
import ListaGastos from './ListaGastos'
import ModalEditarGasto from './ModalEditarGasto'
import MetasOrcamento from './MetasOrcamento'
import CalendarioGastos from './CalendarioGastos'
import Lembretes from './Lembretes'
import { editarGasto, deletarGasto } from '../services/gastoService'

function Dashboard({ apiUrl }) {
  const [gastos, setGastos] = useState([])
  const [periodo, setPeriodo] = useState('mes')
  const [abaDashboard, setAbaDashboard] = useState('visao-geral') // 'visao-geral', 'lista', 'calendario', 'metas', 'lembretes'
  const [gastoEditando, setGastoEditando] = useState(null)
  const [indexEditando, setIndexEditando] = useState(null)

  useEffect(() => {
    carregarDados()
    
    // Atualizar quando houver mudanças
    const interval = setInterval(carregarDados, 3000)
    return () => clearInterval(interval)
  }, [])

  const carregarDados = () => {
    try {
      const gastosLocal = JSON.parse(localStorage.getItem('gastos-historico') || '[]')
      setGastos(gastosLocal)
    } catch (error) {
      console.error('Erro ao carregar gastos:', error)
    }
  }

  const handleEditar = (index) => {
    setGastoEditando(gastos[index])
    setIndexEditando(index)
  }

  const handleSalvarEdicao = async (gastoAtualizado) => {
    try {
      // Atualizar localStorage
      const novosGastos = [...gastos]
      novosGastos[indexEditando] = gastoAtualizado
      localStorage.setItem('gastos-historico', JSON.stringify(novosGastos))
      setGastos(novosGastos)

      // Atualizar na planilha
      await editarGasto(apiUrl, indexEditando, {
        pin: '1234', // Use o PIN real
        data: gastoAtualizado.data,
        categoria: gastoAtualizado.categoria,
        valor: gastoAtualizado.valor,
        pagamento: gastoAtualizado.pagamento,
        essencial: gastoAtualizado.essencial,
        tipo: gastoAtualizado.tipo
      })

      setGastoEditando(null)
      setIndexEditando(null)
      
      alert('✅ Gasto editado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar edição:', error)
      alert('❌ Erro ao editar gasto')
    }
  }

  const handleDeletar = async (index) => {
    if (!confirm('Tem certeza que deseja deletar este gasto?')) return

    try {
      // Remover do localStorage
      const novosGastos = gastos.filter((_, i) => i !== index)
      localStorage.setItem('gastos-historico', JSON.stringify(novosGastos))
      setGastos(novosGastos)

      // Deletar na planilha
      await deletarGasto(apiUrl, index, '1234')

      alert('✅ Gasto deletado com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('❌ Erro ao deletar gasto')
    }
  }

  const filtrarPorPeriodo = () => {
    const hoje = new Date()
    let dataInicio

    switch (periodo) {
      case 'semana':
        dataInicio = new Date()
        dataInicio.setDate(dataInicio.getDate() - 7)
        break
      case 'mes':
        dataInicio = new Date()
        dataInicio.setMonth(dataInicio.getMonth() - 1)
        break
      case 'ano':
        dataInicio = new Date()
        dataInicio.setFullYear(dataInicio.getFullYear() - 1)
        break
      default:
        dataInicio = new Date(0)
    }

    return gastos.filter(gasto => {
      if (!gasto.dataOriginal) return true
      const dataGasto = new Date(gasto.dataOriginal)
      return dataGasto >= dataInicio
    })
  }

  const gastosFiltrados = filtrarPorPeriodo()
  
  const totalGasto = gastosFiltrados.reduce((acc, g) => {
    let valorStr = g.valor
    if (typeof valorStr === 'string') {
      valorStr = valorStr.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
    }
    const valor = parseFloat(valorStr)
    return acc + (isNaN(valor) ? 0 : valor)
  }, 0)

  if (gastos.length === 0) {
    return (
      <div className="dashboard-empty">
        <span className="empty-icon">📊</span>
        <h3>Nenhum gasto registrado ainda</h3>
        <p>Adicione seu primeiro gasto na aba "Adicionar Gasto"</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Dashboard</h2>
        <PeriodoSelector periodo={periodo} onChange={setPeriodo} />
      </div>

      {/* Sub-abas do Dashboard */}
      <nav className="dashboard-tabs">
        <button 
          className={`dashboard-tab ${abaDashboard === 'visao-geral' ? 'active' : ''}`}
          onClick={() => setAbaDashboard('visao-geral')}
        >
          📊 Visão Geral
        </button>
        <button 
          className={`dashboard-tab ${abaDashboard === 'lista' ? 'active' : ''}`}
          onClick={() => setAbaDashboard('lista')}
        >
          📋 Lista
        </button>
        <button 
          className={`dashboard-tab ${abaDashboard === 'calendario' ? 'active' : ''}`}
          onClick={() => setAbaDashboard('calendario')}
        >
          📅 Calendário
        </button>
        <button 
          className={`dashboard-tab ${abaDashboard === 'metas' ? 'active' : ''}`}
          onClick={() => setAbaDashboard('metas')}
        >
          🏆 Metas
        </button>
        <button 
          className={`dashboard-tab ${abaDashboard === 'lembretes' ? 'active' : ''}`}
          onClick={() => setAbaDashboard('lembretes')}
        >
          🔔 Lembretes
        </button>
      </nav>

      {/* Conteúdo das sub-abas */}
      {abaDashboard === 'visao-geral' && (
        <>
          <OrcamentoAlert totalGasto={totalGasto} limite={6440} />

          <div className="dashboard-stats">
            <div className="stat-card">
              <span className="stat-icon">💰</span>
              <div className="stat-content">
                <span className="stat-label">Total Gasto</span>
                <span className="stat-value">
                  R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">📝</span>
              <div className="stat-content">
                <span className="stat-label">Gastos</span>
                <span className="stat-value">{gastosFiltrados.length}</span>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">📊</span>
              <div className="stat-content">
                <span className="stat-label">Média</span>
                <span className="stat-value">
                  R$ {gastosFiltrados.length > 0 
                    ? (totalGasto / gastosFiltrados.length).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '0,00'
                  }
                </span>
              </div>
            </div>
          </div>

          <GraficoGastos gastos={gastosFiltrados} />
        </>
      )}

      {abaDashboard === 'lista' && (
        <ListaGastos 
          gastos={gastos} 
          onEditar={handleEditar}
          onDeletar={handleDeletar}
        />
      )}

      {abaDashboard === 'calendario' && (
        <CalendarioGastos gastos={gastos} />
      )}

      {abaDashboard === 'metas' && (
        <MetasOrcamento totalGasto={totalGasto} />
      )}

      {abaDashboard === 'lembretes' && (
        <Lembretes />
      )}

      {/* Modal de Edição */}
      {gastoEditando && (
        <ModalEditarGasto
          gasto={gastoEditando}
          onSalvar={handleSalvarEdicao}
          onCancelar={() => {
            setGastoEditando(null)
            setIndexEditando(null)
          }}
        />
      )}
    </div>
  )
}

export default Dashboard
