import { useState, useEffect } from 'react'

function MetasOrcamento({ totalGasto }) {
  const [metas, setMetas] = useState(() => {
    const saved = localStorage.getItem('metas-orcamento')
    return saved ? JSON.parse(saved) : {
      orcamentoTotal: 6440,
      metas: [
        { nome: 'Essenciais', limite: 4000, icon: '⭐' },
        { nome: 'Lazer', limite: 500, icon: '🎮' },
        { nome: 'Economia', alvo: 1000, icon: '💰' }
      ]
    }
  })

  useEffect(() => {
    localStorage.setItem('metas-orcamento', JSON.stringify(metas))
  }, [metas])

  const calcularProgresso = (limite) => {
    return Math.min((totalGasto / limite) * 100, 100)
  }

  return (
    <div className="metas-container">
      <h3>🏆 Metas de Economia</h3>
      
      <div className="meta-card meta-principal">
        <div className="meta-header">
          <span className="meta-nome">💰 Orçamento Mensal</span>
          <span className="meta-valor">
            R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / 
            R$ {metas.orcamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${calcularProgresso(metas.orcamentoTotal)}%`,
              background: calcularProgresso(metas.orcamentoTotal) > 80 ? '#f44336' : '#4CAF50'
            }}
          ></div>
        </div>
        <span className="meta-percentual">
          {calcularProgresso(metas.orcamentoTotal).toFixed(1)}% utilizado
        </span>
      </div>

      {metas.metas.map((meta, index) => (
        <div key={index} className="meta-card">
          <div className="meta-header">
            <span className="meta-nome">{meta.icon} {meta.nome}</span>
            {meta.limite && (
              <span className="meta-valor">Limite: R$ {meta.limite.toLocaleString('pt-BR')}</span>
            )}
            {meta.alvo && (
              <span className="meta-valor">Meta: R$ {meta.alvo.toLocaleString('pt-BR')}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default MetasOrcamento
