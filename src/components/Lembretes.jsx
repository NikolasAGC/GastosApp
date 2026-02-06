import { useState, useEffect } from 'react'

function Lembretes() {
  const [lembretes, setLembretes] = useState(() => {
    const saved = localStorage.getItem('lembretes')
    return saved ? JSON.parse(saved) : [
      { id: 1, titulo: 'Pagar Aluguel', dia: 10, icon: '🏠', ativo: true },
      { id: 2, titulo: 'Pagar Internet', dia: 7, icon: '📡', ativo: true },
      { id: 3, titulo: 'Pagar Academia', dia: 10, icon: '💪', ativo: true }
    ]
  })

  const [novoLembrete, setNovoLembrete] = useState({ titulo: '', dia: 1, icon: '📌' })
  const [mostrarForm, setMostrarForm] = useState(false)

  useEffect(() => {
    localStorage.setItem('lembretes', JSON.stringify(lembretes))
    verificarLembretes()
  }, [lembretes])

  const verificarLembretes = () => {
    const diaHoje = new Date().getDate()
    
    lembretes.forEach(lembrete => {
      if (lembrete.ativo && lembrete.dia === diaHoje) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`🔔 Lembrete: ${lembrete.titulo}`, {
            body: `Não esqueça de ${lembrete.titulo.toLowerCase()} hoje!`,
            icon: '/icons/icon-192.png'
          })
        }
      }
    })
  }

  const adicionarLembrete = () => {
    if (!novoLembrete.titulo) return
    
    setLembretes([...lembretes, {
      id: Date.now(),
      ...novoLembrete,
      ativo: true
    }])
    
    setNovoLembrete({ titulo: '', dia: 1, icon: '📌' })
    setMostrarForm(false)
  }

  const toggleLembrete = (id) => {
    setLembretes(lembretes.map(l => 
      l.id === id ? { ...l, ativo: !l.ativo } : l
    ))
  }

  const deletarLembrete = (id) => {
    setLembretes(lembretes.filter(l => l.id !== id))
  }

  const getDiasRestantes = (dia) => {
    const hoje = new Date().getDate()
    if (dia >= hoje) return dia - hoje
    const ultimoDia = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    return (ultimoDia - hoje) + dia
  }

  return (
    <div className="lembretes-container">
      <div className="lembretes-header">
        <h3>🔔 Lembretes</h3>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="btn-add-lembrete">
          {mostrarForm ? '✕' : '➕'}
        </button>
      </div>

      {mostrarForm && (
        <div className="lembrete-form">
          <input
            type="text"
            placeholder="Título do lembrete..."
            value={novoLembrete.titulo}
            onChange={(e) => setNovoLembrete({ ...novoLembrete, titulo: e.target.value })}
            className="lembrete-input"
          />
          <select
            value={novoLembrete.dia}
            onChange={(e) => setNovoLembrete({ ...novoLembrete, dia: parseInt(e.target.value) })}
            className="lembrete-select"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
              <option key={dia} value={dia}>Dia {dia}</option>
            ))}
          </select>
          <button onClick={adicionarLembrete} className="btn-salvar-lembrete">
            Adicionar
          </button>
        </div>
      )}

      <div className="lembretes-lista">
        {lembretes.map(lembrete => {
          const diasRestantes = getDiasRestantes(lembrete.dia)
          
          return (
            <div key={lembrete.id} className={`lembrete-card ${!lembrete.ativo ? 'inativo' : ''}`}>
              <span className="lembrete-icon">{lembrete.icon}</span>
              <div className="lembrete-info">
                <span className="lembrete-titulo">{lembrete.titulo}</span>
                <span className="lembrete-data">
                  Todo dia {lembrete.dia} • {diasRestantes === 0 ? 'Hoje!' : `${diasRestantes} dias`}
                </span>
              </div>
              <div className="lembrete-acoes">
                <button 
                  onClick={() => toggleLembrete(lembrete.id)}
                  className="btn-toggle"
                  title={lembrete.ativo ? 'Desativar' : 'Ativar'}
                >
                  {lembrete.ativo ? '🔔' : '🔕'}
                </button>
                <button 
                  onClick={() => deletarLembrete(lembrete.id)}
                  className="btn-delete-lembrete"
                  title="Deletar"
                >
                  🗑️
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Lembretes
