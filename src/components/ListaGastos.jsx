import { useState } from 'react'

function ListaGastos({ gastos, onEditar, onDeletar }) {
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroPagamento, setFiltroPagamento] = useState('todos')
  const [ordenacao, setOrdenacao] = useState('data-desc')

  const categorias = [...new Set(gastos.map(g => g.categoria))]
  const formasPagamento = [...new Set(gastos.map(g => g.pagamento))]

  const gastosFiltrados = gastos.filter(gasto => {
    const matchBusca = !busca || 
      gasto.categoria.toLowerCase().includes(busca.toLowerCase()) ||
      gasto.valor.includes(busca)
    
    const matchCategoria = filtroCategoria === 'todas' || gasto.categoria === filtroCategoria
    const matchPagamento = filtroPagamento === 'todos' || gasto.pagamento === filtroPagamento
    
    return matchBusca && matchCategoria && matchPagamento
  })

  const gastosOrdenados = [...gastosFiltrados].sort((a, b) => {
    switch (ordenacao) {
      case 'data-desc':
        return new Date(b.dataOriginal) - new Date(a.dataOriginal)
      case 'data-asc':
        return new Date(a.dataOriginal) - new Date(b.dataOriginal)
      case 'valor-desc':
        const valorA = parseFloat(a.valor.replace('R$', '').replace(/\./g, '').replace(',', '.'))
        const valorB = parseFloat(b.valor.replace('R$', '').replace(/\./g, '').replace(',', '.'))
        return valorB - valorA
      case 'valor-asc':
        const valorA2 = parseFloat(a.valor.replace('R$', '').replace(/\./g, '').replace(',', '.'))
        const valorB2 = parseFloat(b.valor.replace('R$', '').replace(/\./g, '').replace(',', '.'))
        return valorA2 - valorB2
      default:
        return 0
    }
  })

  const formatarData = (dataISO) => {
    if (!dataISO) return 'N/A'
    const date = new Date(dataISO)
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className="lista-gastos">
      <div className="filtros-container">
        <div className="busca-box">
          <span className="busca-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por categoria ou valor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="busca-input"
          />
        </div>

        <div className="filtros-row">
          <select 
            value={filtroCategoria} 
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="filtro-select"
          >
            <option value="todas">📁 Todas Categorias</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            value={filtroPagamento} 
            onChange={(e) => setFiltroPagamento(e.target.value)}
            className="filtro-select"
          >
            <option value="todos">💳 Todos Pagamentos</option>
            {formasPagamento.map(pag => (
              <option key={pag} value={pag}>{pag}</option>
            ))}
          </select>

          <select 
            value={ordenacao} 
            onChange={(e) => setOrdenacao(e.target.value)}
            className="filtro-select"
          >
            <option value="data-desc">📅 Mais Recente</option>
            <option value="data-asc">📅 Mais Antigo</option>
            <option value="valor-desc">💰 Maior Valor</option>
            <option value="valor-asc">💰 Menor Valor</option>
          </select>
        </div>
      </div>

      <div className="gastos-lista">
        {gastosOrdenados.length === 0 ? (
          <div className="lista-vazia">
            <span className="vazio-icon">🔍</span>
            <p>Nenhum gasto encontrado</p>
          </div>
        ) : (
          gastosOrdenados.map((gasto, index) => (
            <div key={index} className="gasto-card">
              <div className="gasto-info">
                <div className="gasto-header">
                  <span className="gasto-categoria">{gasto.categoria}</span>
                  <span className="gasto-valor">{gasto.valor}</span>
                </div>
                <div className="gasto-detalhes">
                  <span className="gasto-data">📅 {formatarData(gasto.dataOriginal)}</span>
                  <span className="gasto-pagamento">💳 {gasto.pagamento}</span>
                  <span className={`gasto-badge ${gasto.essencial === 'Sim' ? 'essencial' : 'nao-essencial'}`}>
                    {gasto.essencial === 'Sim' ? '⭐ Essencial' : '💡 Não Essencial'}
                  </span>
                  <span className={`gasto-badge ${gasto.tipo === 'Fixo' ? 'fixo' : 'variavel'}`}>
                    {gasto.tipo === 'Fixo' ? '📌 Fixo' : '📊 Variável'}
                  </span>
                </div>
              </div>
              <div className="gasto-acoes">
                <button 
                  onClick={() => onEditar(gastos.indexOf(gasto))}
                  className="btn-acao btn-editar"
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => onDeletar(gastos.indexOf(gasto))}
                  className="btn-acao btn-deletar"
                  title="Deletar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {gastosOrdenados.length > 0 && (
        <div className="lista-footer">
          <span>Mostrando {gastosOrdenados.length} de {gastos.length} gastos</span>
        </div>
      )}
    </div>
  )
}

export default ListaGastos
