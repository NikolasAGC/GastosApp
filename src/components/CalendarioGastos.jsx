import { useState } from 'react'

function CalendarioGastos({ gastos }) {
  const [mesAtual, setMesAtual] = useState(new Date())

  const getDiasDoMes = () => {
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)
    
    const dias = []
    const diaSemanaInicio = primeiroDia.getDay()
    
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null)
    }
    
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(dia)
    }
    
    return dias
  }

  const getGastosDoDia = (dia) => {
    if (!dia) return []
    
    const dataStr = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    
    return gastos.filter(g => g.dataOriginal === dataStr)
  }

  const getTotalDia = (dia) => {
    const gastosDia = getGastosDoDia(dia)
    return gastosDia.reduce((acc, g) => {
      const valor = parseFloat(g.valor.replace('R$', '').replace(/\./g, '').replace(',', '.'))
      return acc + (isNaN(valor) ? 0 : valor)
    }, 0)
  }

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1))
  }

  const mesSeguinte = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1))
  }

  const nomeMes = mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="calendario-container">
      <div className="calendario-header">
        <button onClick={mesAnterior} className="btn-mes">◀</button>
        <h3>📅 {nomeMes}</h3>
        <button onClick={mesSeguinte} className="btn-mes">▶</button>
      </div>

      <div className="calendario-grid">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
          <div key={dia} className="calendario-dia-semana">{dia}</div>
        ))}
        
        {getDiasDoMes().map((dia, index) => {
          const gastosDia = getGastosDoDia(dia)
          const totalDia = getTotalDia(dia)
          const temGastos = gastosDia.length > 0
          
          return (
            <div 
              key={index} 
              className={`calendario-dia ${!dia ? 'vazio' : ''} ${temGastos ? 'com-gastos' : ''}`}
            >
              {dia && (
                <>
                  <span className="dia-numero">{dia}</span>
                  {temGastos && (
                    <div className="dia-info">
                      <span className="dia-total">
                        R$ {totalDia.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                      <span className="dia-qtd">{gastosDia.length} gasto{gastosDia.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarioGastos
