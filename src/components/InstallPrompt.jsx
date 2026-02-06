import { useState, useEffect } from 'react'

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Mostrar prompt depois de 30 segundos (ou quando quiser)
      setTimeout(() => {
        const alreadyShown = localStorage.getItem('installPromptShown')
        if (!alreadyShown) {
          setShowPrompt(true)
        }
      }, 30000) // 30 segundos
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} instalar`)
    
    setDeferredPrompt(null)
    setShowPrompt(false)
    localStorage.setItem('installPromptShown', 'true')
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('installPromptShown', 'true')
  }

  if (!showPrompt) return null

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <span className="install-icon">📱</span>
        <div className="install-text">
          <strong>Instalar App</strong>
          <p>Adicione à tela inicial para acesso rápido!</p>
        </div>
        <div className="install-buttons">
          <button onClick={handleInstall} className="btn-install">
            Instalar
          </button>
          <button onClick={handleDismiss} className="btn-dismiss">
            Agora não
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstallPrompt
