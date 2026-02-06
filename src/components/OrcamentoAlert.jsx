import { useState, useEffect } from 'react'

function OrcamentoAlert({ totalGasto, limite = 6440 }) {
  const [mostrarNotificacao, setMostrarNotificacao] = useState(false)
  const percentual = (totalGasto / limite) * 100
  
  useEffect(() => {
    // Notificação quando ultrapassar 80%
    if (percentual >= 80 && percentual < 100 && !mostrarNotificacao) {
      setMostrarNotificacao(true)
      
      // Notificação do navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⚠️ Atenção ao Orçamento', {
          body: `Você já gastou ${percentual.toFixed(0)}% do seu orçamento!`,
          icon: '/icons/icon-192.png'
        })
      }
    }
    
    // Notificação quando ultrapassar 100%
    if (percentual >= 100 && !mostrarNotificacao) {
      setMostrarNotificacao(true)
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 Orçamento Ultrapassado!', {
          body: `Você ultrapassou seu orçamento em R$ ${(totalGasto - limite).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          icon: '/icons/icon-192.png'
        })
      }
    }
  }, [totalGasto, limite, percentual, mostrarNotificacao])

  const solicitarPermissaoNotificacao = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  useEffect(() => {
    solicitarPermissaoNotificacao()
  }, [])

  const getAlertClass = () => {
    if (percentual >= 100) return 'alert-danger'
    if (percentual >= 80) return 'alert-warning'
    return 'alert-success'
  }

  const getAlertIcon = () => {
    if (percentual >= 100) return '🚨'
    if (percentual >= 80) return '⚠️'
    return '✅'
  }

  const getAlertMessage = () => {
    if (percentual >= 100) {
      const excesso = totalGasto - limite
      return `Orçamento ultrapassado em R$ ${excesso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    }
    if (percentual >= 80) {
      return `Atenção! Você já gastou ${percentual.toFixed(0)}% do orçamento`
    }
    const restante = limite - totalGasto
    return `Você ainda tem R$ ${restante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} disponível`
  }

  return (
    <div className={`orcamento-alert ${getAlertClass()}`}>
      <div className="alert-content">
        <span className="alert-icon">{getAlertIcon()}</span>
        <div className="alert-text">
          <strong>{getAlertMessage()}</strong>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(percentual, 100)}%` }}
            ></div>
          </div>
          <span className="progress-text">
            R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / 
            R$ {limite.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default OrcamentoAlert
