import { useState } from 'react'
import { salvarGasto } from '../services/gastoService'

const categorias = {
  "🏠 Casa / Contas": ["Aluguel", "Água", "Luz", "Internet", "Gás"],
  "🍽️ Alimentação": ["Mercado", "Lanche", "Restaurante / Ifood"],
  "🚗 Transporte": ["Uber / 99", "Ônibus / Metrô", "Gasolina", "Manutenção (carro/moto)", "Van", "Prestação do carro"],
  "💳 Financeiro": ["Cartão de crédito", "Empréstimo", "Juros / taxas", "Banco"],
  "🧠 Saúde": ["Remédio", "Consulta", "Academia", "Terapia"],
  "🎮 Lazer": ["Rolê", "Cinema", "Jogos", "Streaming"],
  "📚 Estudos / Trabalho": ["Curso", "Material", "Livro", "Ferramentas / software", "Faculdade", "Curso JC"],
  "👕 Pessoal": ["Roupa", "Cabelo", "Higiene", "Perfume", "Unhas", "Cilios"],
  "🐶 Pets": ["Ração", "Veterinário"],
  "🛒 Outros": ["Imprevistos", "Aleatório"]
}

const formasPagamento = ["Pix", "Débito", "Crédito", "Dinheiro", "Boleto", "Transferência", "VA", "VR"]

function GastoForm({ apiUrl, onGastoSalvo }) {
  const [formData, setFormData] = useState({
    pin: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
    valor: '',
    pagamento: '',
    essencial: '',
    tipo: ''
  })
  const [feedback, setFeedback] = useState({ message: '', type: '' })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Formatar data de YYYY-MM-DD para M/D/YYYY (formato da planilha)
  const formatarData = (dataISO) => {
    const [ano, mes, dia] = dataISO.split('-')
    return `${parseInt(mes)}/${parseInt(dia)}/${ano}`
  }

  // Formatar valor para R$ 0.000,00
  const formatarValor = (valor) => {
    const numero = parseFloat(valor)
    return `R$ ${numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Verificar se a categoria é válida (não é um grupo)
  const validarCategoria = (categoria) => {
    // Verifica se a categoria tem emoji (grupos começam com emoji)
    if (categoria.includes('🏠') || categoria.includes('🍽️') || 
        categoria.includes('🚗') || categoria.includes('💳') || 
        categoria.includes('🧠') || categoria.includes('🎮') || 
        categoria.includes('📚') || categoria.includes('👕') || 
        categoria.includes('🐶') || categoria.includes('🛒')) {
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar PIN
    if (formData.pin.length < 4) {
      setFeedback({ message: '❌ PIN deve ter no mínimo 4 dígitos', type: 'error' })
      setTimeout(() => setFeedback({ message: '', type: '' }), 5000)
      return
    }

    // Validar categoria (não pode ser um grupo)
    if (!validarCategoria(formData.categoria)) {
      setFeedback({ message: '❌ Selecione uma categoria específica, não o grupo', type: 'error' })
      setTimeout(() => setFeedback({ message: '', type: '' }), 5000)
      return
    }

    // Validar valor
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      setFeedback({ message: '❌ Digite um valor válido maior que zero', type: 'error' })
      setTimeout(() => setFeedback({ message: '', type: '' }), 5000)
      return
    }

    try {
      setFeedback({ message: '⏳ Enviando...', type: 'success' })

      // Formatar dados para o formato da planilha
      const dadosFormatados = {
        pin: formData.pin,
        data: formatarData(formData.data),
        categoria: formData.categoria,
        valor: formatarValor(formData.valor),
        pagamento: formData.pagamento,
        essencial: formData.essencial,
        tipo: formData.tipo
      }

      // Salvar usando o serviço (online ou offline)
      const resultado = await salvarGasto(apiUrl, dadosFormatados)
      
      setFeedback({ message: resultado.mensagem, type: 'success' })
      
      // Salvar no histórico local para o dashboard
      const historico = JSON.parse(localStorage.getItem('gastos-historico') || '[]')
      historico.push({ 
        ...dadosFormatados, 
        timestamp: Date.now(),
        dataOriginal: formData.data // Guardar data no formato ISO para filtros
      })
      localStorage.setItem('gastos-historico', JSON.stringify(historico))
      
      // Notificar o App que um gasto foi salvo
      if (onGastoSalvo) {
        onGastoSalvo()
      }
      
      // Limpar formulário (exceto PIN e data)
      setFormData({
        ...formData,
        categoria: '',
        valor: '',
        pagamento: '',
        essencial: '',
        tipo: ''
      })

      setTimeout(() => setFeedback({ message: '', type: '' }), 5000)
    } catch (error) {
      console.error('Erro:', error)
      setFeedback({ message: '❌ Erro ao salvar. Verifique sua conexão.', type: 'error' })
      setTimeout(() => setFeedback({ message: '', type: '' }), 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="gasto-form">
      <div className="form-group">
        <label htmlFor="pin">🔐 PIN de Acesso</label>
        <input
          type="password"
          id="pin"
          name="pin"
          value={formData.pin}
          onChange={handleChange}
          placeholder="Digite seu PIN"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="data">📅 Data</label>
        <input
          type="date"
          id="data"
          name="data"
          value={formData.data}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="categoria">🏷️ Categoria</label>
        <select
          id="categoria"
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          required
        >
          <option value="">Selecione...</option>
          {Object.entries(categorias).map(([grupo, itens]) => (
            <optgroup key={grupo} label={grupo}>
              {itens.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {formData.categoria && !validarCategoria(formData.categoria) && (
          <small style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            ⚠️ Selecione um item específico
          </small>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="valor">💵 Valor (R$)</label>
        <input
          type="number"
          id="valor"
          name="valor"
          step="0.01"
          min="0.01"
          value={formData.valor}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="pagamento">💳 Forma de Pagamento</label>
        <select
          id="pagamento"
          name="pagamento"
          value={formData.pagamento}
          onChange={handleChange}
          required
        >
          <option value="">Selecione...</option>
          {formasPagamento.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="essencial">⭐ Essencial?</label>
        <select
          id="essencial"
          name="essencial"
          value={formData.essencial}
          onChange={handleChange}
          required
        >
          <option value="">Selecione...</option>
          <option value="Sim">Sim</option>
          <option value="Não">Não</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="tipo">📊 Fixo/Variável</label>
        <select
          id="tipo"
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          required
        >
          <option value="">Selecione...</option>
          <option value="Fixo">Fixo</option>
          <option value="Variável">Variável</option>
        </select>
      </div>

      <button type="submit" className="btn-submit">
        💾 Salvar Gasto
      </button>

      {feedback.message && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}
    </form>
  )
}

export default GastoForm
