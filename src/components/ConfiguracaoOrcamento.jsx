import { useState, useEffect } from 'react'

function ConfiguracaoOrcamento() {
  const [orcamento, setOrcamento] = useState(() => {
    const saved = localStorage.getItem('orcamento-mensal')
    return saved ? parseFloat(saved) : 6440
  })

  const [editando, setEditando] = useState(false)
  const [valorTemp, setValorTemp] = useState(orcamento)

  const salvarOrcamento = () => {
    const valor = parseFloat(valorTemp)
    if (isNaN(valor) || valor <= 0) {
      alert('⚠️ Digite um valor válido')
      return
    }
    
    setOrcamento(valor)
    localStorage.setItem('orcamento-mensal', valor.toString())
    setEditando(false)
    alert('✅ Orçamento atualizado com sucesso!')
  }

  const cancelar = () => {
    setValorTemp(orcamento)
    setEditando(false)
  }

  const formatarValor = (valor) => {
    return valor.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }

  return (
    <div className="config-orcamento">
      <div className="config-header">
        <div className="config-info">
          <span className="config-icon">💰</span>
          <div>
            <h4>Orçamento Mensal</h4>
            <p className="config-desc">Defina quanto você tem disponível por mês</p>
          </div>
        </div>
        
        {!editando && (
          <button onClick={() => setEditando(true)} className="btn-editar-orcamento">
            ✏️ Editar
          </button>
        )}
      </div>

      {!editando ? (
        <div className="orcamento-display">
          <span className="orcamento-label">Valor atual:</span>
          <span className="orcamento-valor">R$ {formatarValor(orcamento)}</span>
        </div>
      ) : (
        <div className="orcamento-edit">
          <div className="edit-input-group">
            <span className="edit-prefix">R$</span>
            <input
              type="number"
              value={valorTemp}
              onChange={(e) => setValorTemp(e.target.value)}
              placeholder="0,00"
              className="edit-input"
              step="0.01"
              min="0"
              autoFocus
            />
          </div>
          
          <div className="edit-actions">
            <button onClick={cancelar} className="btn-cancelar-edit">
              Cancelar
            </button>
            <button onClick={salvarOrcamento} className="btn-salvar-edit">
              💾 Salvar
            </button>
          </div>
        </div>
      )}

      <div className="config-sugestoes">
        <p className="sugestoes-titulo">💡 Sugestões rápidas:</p>
        <div className="sugestoes-buttons">
          {[3000, 5000, 6440, 8000, 10000].map(valor => (
            <button
              key={valor}
              onClick={() => {
                setValorTemp(valor)
                if (!editando) setEditando(true)
              }}
              className="btn-sugestao"
            >
              R$ {formatarValor(valor)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ConfiguracaoOrcamento
