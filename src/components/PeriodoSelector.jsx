function PeriodoSelector({ periodo, onChange }) {
  return (
    <div className="periodo-selector">
      <button
        className={`periodo-btn ${periodo === 'semana' ? 'active' : ''}`}
        onClick={() => onChange('semana')}
      >
        📅 Semana
      </button>
      <button
        className={`periodo-btn ${periodo === 'mes' ? 'active' : ''}`}
        onClick={() => onChange('mes')}
      >
        📆 Mês
      </button>
      <button
        className={`periodo-btn ${periodo === 'ano' ? 'active' : ''}`}
        onClick={() => onChange('ano')}
      >
        📊 Ano
      </button>
    </div>
  )
}

export default PeriodoSelector
