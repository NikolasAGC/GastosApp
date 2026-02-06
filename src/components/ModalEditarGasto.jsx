import { useState, useEffect } from 'react'

function ModalEditarGasto({ gasto, onSalvar, onCancelar }) {
  const [formData, setFormData] = useState(gasto)

  useEffect(() => {
    setFormData(gasto)
  }, [gasto])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSalvar(formData)
  }

  const categorias = [
    "Aluguel", "Água", "Luz", "Internet", "Gás",
    "Mercado", "Lanche", "Restaurante / Ifood",
    "Uber / 99", "Ônibus / Metrô", "Gasolina", "Van", "Prestação do carro",
    "Cartão de crédito", "Empréstimo", "Banco",
    "Remédio", "Consulta", "Academia", "Terapia",
    "Rolê", "Cinema", "Jogos", "Streaming",
    "Curso", "Material", "Livro", "Faculdade", "Curso JC",
    "Roupa", "Cabelo", "Higiene", "Perfume",
    "Ração", "Veterinário",
    "Imprevistos", "Aleatório"
  ]

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Editar Gasto</h2>
          <button onClick={onCancelar} className="btn-close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>📅 Data</label>
            <input
              type="date"
              name="dataOriginal"
              value={formData.dataOriginal}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>🏷️ Categoria</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>💵 Valor (R$)</label>
            <input
              type="text"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div className="form-group">
            <label>💳 Forma de Pagamento</label>
            <select
              name="pagamento"
              value={formData.pagamento}
              onChange={handleChange}
              required
            >
              <option value="Pix">Pix</option>
              <option value="Débito">Débito</option>
              <option value="Crédito">Crédito</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Boleto">Boleto</option>
              <option value="VA">VA</option>
              <option value="VR">VR</option>
            </select>
          </div>

          <div className="form-group">
            <label>⭐ Essencial?</label>
            <select
              name="essencial"
              value={formData.essencial}
              onChange={handleChange}
              required
            >
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>

          <div className="form-group">
            <label>📊 Tipo</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="Fixo">Fixo</option>
              <option value="Variável">Variável</option>
            </select>
          </div>

          <div className="modal-acoes">
            <button type="button" onClick={onCancelar} className="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" className="btn-salvar">
              💾 Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalEditarGasto
