import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const CORES = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0']

function GraficoGastos({ gastos }) {
  // Agrupar por categoria
  const porCategoria = gastos.reduce((acc, gasto) => {
    const valor = parseFloat(gasto.valor.replace('R$', '').replace('.', '').replace(',', '.'))
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + valor
    return acc
  }, {})

  const dadosPizza = Object.entries(porCategoria).map(([nome, valor]) => ({
    nome,
    valor: parseFloat(valor.toFixed(2))
  }))

  // Agrupar por forma de pagamento
  const porPagamento = gastos.reduce((acc, gasto) => {
    const valor = parseFloat(gasto.valor.replace('R$', '').replace('.', '').replace(',', '.'))
    acc[gasto.pagamento] = (acc[gasto.pagamento] || 0) + valor
    return acc
  }, {})

  const dadosBarra = Object.entries(porPagamento).map(([nome, valor]) => ({
    nome,
    valor: parseFloat(valor.toFixed(2))
  }))

  if (gastos.length === 0) {
    return (
      <div className="grafico-vazio">
        <span className="grafico-vazio-icon">📊</span>
        <p>Nenhum gasto neste período</p>
      </div>
    )
  }

  return (
    <div className="graficos-container">
      <div className="grafico-card">
        <h3>💰 Gastos por Categoria</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dadosPizza}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="valor"
            >
              {dadosPizza.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grafico-card">
        <h3>💳 Gastos por Forma de Pagamento</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dadosBarra}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            <Bar dataKey="valor" fill="#667eea" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default GraficoGastos
