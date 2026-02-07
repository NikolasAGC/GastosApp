import { useState, useEffect } from 'react'
import GraficoGastos from './GraficoGastos'
import PeriodoSelector from './PeriodoSelector'
import OrcamentoAlert from './OrcamentoAlert'
import ListaGastos from './ListaGastos'
import ModalEditarGasto from './ModalEditarGasto'
import MetasOrcamento from './MetasOrcamento'
import CalendarioGastos from './CalendarioGastos'
import Lembretes from './Lembretes'
import ExportarImportar from './ExportarImportar'
import ConfiguracaoOrcamento from './ConfiguracaoOrcamento'
import { editarGasto, deletarGasto } from '../services/gastoService'

function Dashboard({ apiUrl }) {
  const [gastos, setGastos] = useState([])
  const [periodo, setPeriodo] = useState('mes')
  const [abaDashboard, setAbaDashboard] = useState('visao-geral')
  const [gastoEditando, setGastoEditando] = useState(null)
  const [indexEditando, setIndexEditando] = useState(null)
  const [orcamentoMensal, setOrcamentoMensal] = useState(6440)

  useEffect(() => {
    carregarDados()
    carregarOrcamento()
    
    // Atualizar quando houver mudanças
    const interval = setInterval(() => {
      carregarDados()
      carregarOrcamento()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const carregarOrcamento = () => {
    const saved = localStorage.getItem('orcamento-mensal')
    if (saved) {
      setOrcamentoMensal(parseFloat(saved))
    }
  }

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
      const novosGastos = [...gastos]
      novosGastos[indexEditando] = gastoAtualizado
      localStorage.setItem('gastos-historico', JSON.stringify(novosGastos))
      setGastos(novosGastos)

      await editarGasto(apiUrl, indexEditando, {
        pin: '1234',
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
      const novosGastos = gastos.filter((_, i) => i !== index)
      localStorage.setItem('gastos-historico', JSON.stringify(novosGastos))
      setGastos(novosGastos)

      await deletarGasto(apiUrl, index, '1234')

      alert('✅ Gasto deletado com sucesso!')
    } catch (error) {
      console.error('Erro ao deletar:', error)
      alert('❌ Erro ao deletar gasto')
    }
  }

  const handleImportar = (gastosImportados) => {
    try {
      const gastosAtualizados = [...gastos, ...gastosImportados]
      
      const gastosUnicos = gastosAtualizados.filter((gasto, index, self) =>
        index === self.findIndex(g => g.timestamp === gasto.timestamp)
      )
      
      localStorage.setItem('gastos-historico', JSON.stringify(gastosUnicos))
      setGastos(gastosUnicos)
      
      console.log(`✅ ${gastosImportados.length} gastos importados`)
    } catch (error) {
      console.error('Erro ao importar gastos:', error)
      alert('❌ Erro ao importar gastos')
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
        <button 
          className={`dashboard-tab ${abaDashboard === 'exportar' ? 'active' : ''}`}
          onClick={() => setAbaDashboard('exportar')}
        >
          📁 Exportar/Importar
        </button>
        <button 
          className={`dashboard-tab ${abaDashboard === 'config' ? 'active' : ''}`}
          onClick={() => setAbaDashboard('config')}
        >
          ⚙️ Configurações
        </button>
      </nav>

      {/* Conteúdo das sub-abas */}
      {abaDashboard === 'visao-geral' && (
        <>
          <OrcamentoAlert totalGasto={totalGasto} limite={orcamentoMensal} />

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

          {gastos.length > 0 && <GraficoGastos gastos={gastosFiltrados} />}
          
          {gastos.length === 0 && (
            <div className="dashboard-empty-hint">
              <span className="hint-icon">📊</span>
              <h3>Adicione gastos para ver gráficos</h3>
              <p>Vá em "Adicionar Gasto" ou "Exportar/Importar"</p>
            </div>
          )}
        </>
      )}

      {abaDashboard === 'lista' && (
        gastos.length === 0 ? (
          <div className="dashboard-empty">
            <span className="empty-icon">📋</span>
            <h3>Nenhum gasto registrado ainda</h3>
            <p>Adicione gastos para visualizar a lista</p>
          </div>
        ) : (
          <ListaGastos 
            gastos={gastos} 
            onEditar={handleEditar}
            onDeletar={handleDeletar}
          />
        )
      )}

      {abaDashboard === 'calendario' && (
        gastos.length === 0 ? (
          <div className="dashboard-empty">
            <span className="empty-icon">📅</span>
            <h3>Nenhum gasto registrado ainda</h3>
            <p>Adicione gastos para visualizar o calendário</p>
          </div>
        ) : (
          <CalendarioGastos gastos={gastos} />
        )
      )}

      {abaDashboard === 'metas' && (
        <MetasOrcamento totalGasto={totalGasto} />
      )}

      {abaDashboard === 'lembretes' && (
        <Lembretes />
      )}

      {abaDashboard === 'exportar' && (
        <ExportarImportar 
          gastos={gastos}
          onImportar={handleImportar}
        />
      )}

      {abaDashboard === 'config' && (
        <ConfiguracaoOrcamento />
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
