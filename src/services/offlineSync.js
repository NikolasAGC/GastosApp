import localforage from 'localforage'

// Configurar armazenamento local
const offlineStore = localforage.createInstance({
  name: 'gastos-offline'
})

// Salvar gasto offline
export async function salvarGastoOffline(gasto) {
  const gastos = await offlineStore.getItem('gastos-pendentes') || []
  gastos.push({
    ...gasto,
    timestamp: Date.now(),
    synced: false
  })
  await offlineStore.setItem('gastos-pendentes', gastos)
  return gastos.length
}

// Obter gastos pendentes
export async function obterGastosPendentes() {
  return await offlineStore.getItem('gastos-pendentes') || []
}

// Sincronizar com servidor
export async function sincronizarGastos(apiUrl) {
  const gastosPendentes = await obterGastosPendentes()
  
  if (gastosPendentes.length === 0) {
    return { sucesso: 0, erro: 0 }
  }

  let sucesso = 0
  let erro = 0

  for (const gasto of gastosPendentes) {
    if (gasto.synced) continue

    try {
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gasto),
        mode: 'no-cors'
      })
      
      gasto.synced = true
      sucesso++
    } catch (err) {
      console.error('Erro ao sincronizar gasto:', err)
      erro++
    }
  }

  // Remover gastos sincronizados
  const gastosRestantes = gastosPendentes.filter(g => !g.synced)
  await offlineStore.setItem('gastos-pendentes', gastosRestantes)

  return { sucesso, erro, pendentes: gastosRestantes.length }
}

// Limpar gastos sincronizados
export async function limparGastosSincronizados() {
  await offlineStore.removeItem('gastos-pendentes')
}
