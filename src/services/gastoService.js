import { salvarGastoOffline, sincronizarGastos } from './offlineSync'

export async function salvarGasto(apiUrl, dados) {
  if (!navigator.onLine) {
    await salvarGastoOffline(dados)
    return { 
      sucesso: true, 
      offline: true, 
      mensagem: '💾 Gasto salvo offline. Será sincronizado quando conectar.' 
    }
  }

  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...dados, action: 'add' }),
      mode: 'no-cors'
    })

    const resultado = await sincronizarGastos(apiUrl)
    
    let mensagem = '✅ Gasto salvo com sucesso!'
    if (resultado.sucesso > 0) {
      mensagem += ` (${resultado.sucesso} gastos offline sincronizados)`
    }

    return { sucesso: true, offline: false, mensagem }
  } catch (error) {
    await salvarGastoOffline(dados)
    return { 
      sucesso: true, 
      offline: true, 
      mensagem: '💾 Erro na conexão. Gasto salvo offline.' 
    }
  }
}

// NOVA: Editar gasto
export async function editarGasto(apiUrl, index, dados) {
  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'edit',
        index: index,
        pin: dados.pin || '1234', // Use o PIN do usuário
        ...dados
      }),
      mode: 'no-cors'
    })

    return { sucesso: true, mensagem: '✅ Gasto editado com sucesso!' }
  } catch (error) {
    console.error('Erro ao editar gasto:', error)
    return { sucesso: false, mensagem: '❌ Erro ao editar gasto' }
  }
}

// NOVA: Deletar gasto
export async function deletarGasto(apiUrl, index, pin = '1234') {
  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete',
        index: index,
        pin: pin
      }),
      mode: 'no-cors'
    })

    return { sucesso: true, mensagem: '✅ Gasto deletado com sucesso!' }
  } catch (error) {
    console.error('Erro ao deletar gasto:', error)
    return { sucesso: false, mensagem: '❌ Erro ao deletar gasto' }
  }
}

// Carregar gastos (já existe)
export async function carregarGastos(apiUrl) {
  try {
    const gastosLocal = JSON.parse(localStorage.getItem('gastos-historico') || '[]')
    return gastosLocal
  } catch (error) {
    console.error('Erro ao carregar gastos:', error)
    return []
  }
}
