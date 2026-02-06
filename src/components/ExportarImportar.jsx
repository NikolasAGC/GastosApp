import { useState } from 'react'

function ExportarImportar({ gastos, onImportar }) {
  const [mostrarImport, setMostrarImport] = useState(false)
  const [arquivo, setArquivo] = useState(null)

  // EXPORTAR PARA CSV (Excel)
  const exportarCSV = () => {
    // Cabeçalho do CSV
    const cabecalho = 'Data,Categoria,Valor,Pagamento,Essencial,Tipo\n'
    
    // Converter gastos para CSV
    const linhas = gastos.map(gasto => {
      return `${gasto.data},"${gasto.categoria}","${gasto.valor}","${gasto.pagamento}","${gasto.essencial}","${gasto.tipo}"`
    }).join('\n')
    
    const csv = cabecalho + linhas
    
    // Criar arquivo para download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `gastos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    alert('✅ Gastos exportados para CSV!')
  }

  // EXPORTAR PARA JSON
  const exportarJSON = () => {
    const json = JSON.stringify(gastos, null, 2)
    
    const blob = new Blob([json], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `gastos_${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    alert('✅ Gastos exportados para JSON!')
  }

  // IMPORTAR DE CSV
  const importarCSV = (conteudo) => {
    try {
      const linhas = conteudo.split('\n').filter(linha => linha.trim())
      
      // Pular cabeçalho
      const gastosImportados = []
      
      for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i]
        
        // Parsear CSV (considerando aspas)
        const valores = linha.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)
        
        if (!valores || valores.length < 6) continue
        
        // Remover aspas
        const limpar = (str) => str.replace(/^"|"$/g, '').trim()
        
        const gasto = {
          data: limpar(valores[0]),
          categoria: limpar(valores[1]),
          valor: limpar(valores[2]),
          pagamento: limpar(valores[3]),
          essencial: limpar(valores[4]),
          tipo: limpar(valores[5]),
          timestamp: Date.now() + i
        }
        
        // Criar dataOriginal
        if (gasto.data.includes('/')) {
          const [mes, dia, ano] = gasto.data.split('/')
          gasto.dataOriginal = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
        }
        
        gastosImportados.push(gasto)
      }
      
      if (gastosImportados.length > 0) {
        onImportar(gastosImportados)
        alert(`✅ ${gastosImportados.length} gastos importados com sucesso!`)
      } else {
        alert('⚠️ Nenhum gasto válido encontrado no arquivo')
      }
      
    } catch (error) {
      console.error('Erro ao importar CSV:', error)
      alert('❌ Erro ao importar arquivo CSV. Verifique o formato.')
    }
  }

  // IMPORTAR DE JSON
  const importarJSON = (conteudo) => {
    try {
      const gastosImportados = JSON.parse(conteudo)
      
      if (!Array.isArray(gastosImportados)) {
        alert('❌ Formato JSON inválido. Esperado um array de gastos.')
        return
      }
      
      // Validar estrutura básica
      const gastosValidos = gastosImportados.filter(g => 
        g.data && g.categoria && g.valor
      )
      
      if (gastosValidos.length > 0) {
        onImportar(gastosValidos)
        alert(`✅ ${gastosValidos.length} gastos importados com sucesso!`)
      } else {
        alert('⚠️ Nenhum gasto válido encontrado no arquivo')
      }
      
    } catch (error) {
      console.error('Erro ao importar JSON:', error)
      alert('❌ Erro ao importar arquivo JSON. Verifique o formato.')
    }
  }

  // PROCESSAR ARQUIVO SELECIONADO
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setArquivo(file)
    
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const conteudo = event.target.result
      
      if (file.name.endsWith('.csv')) {
        importarCSV(conteudo)
      } else if (file.name.endsWith('.json')) {
        importarJSON(conteudo)
      } else {
        alert('❌ Formato não suportado. Use .csv ou .json')
      }
      
      // Limpar input
      e.target.value = ''
      setArquivo(null)
      setMostrarImport(false)
    }
    
    reader.readAsText(file, 'UTF-8')
  }

  // GERAR LINK DE COMPARTILHAMENTO
  const compartilhar = () => {
    const dados = btoa(JSON.stringify(gastos)) // Codificar em base64
    const url = `${window.location.origin}${window.location.pathname}?import=${dados}`
    
    navigator.clipboard.writeText(url).then(() => {
      alert('🔗 Link de compartilhamento copiado!\n\nCole em outro dispositivo para importar os gastos.')
    }).catch(() => {
      prompt('📋 Copie este link:', url)
    })
  }

  return (
    <div className="exportar-importar-container">
      <h3>📁 Exportar / Importar Gastos</h3>
      
      {/* EXPORTAR */}
      <div className="export-section">
        <h4>📤 Exportar</h4>
        <div className="export-buttons">
          <button onClick={exportarCSV} className="btn-export btn-csv">
            <span className="btn-icon">📊</span>
            <div className="btn-text">
              <strong>Exportar CSV</strong>
              <small>Abrir no Excel / Sheets</small>
            </div>
          </button>
          
          <button onClick={exportarJSON} className="btn-export btn-json">
            <span className="btn-icon">📋</span>
            <div className="btn-text">
              <strong>Exportar JSON</strong>
              <small>Backup completo</small>
            </div>
          </button>
          
          <button onClick={compartilhar} className="btn-export btn-share">
            <span className="btn-icon">🔗</span>
            <div className="btn-text">
              <strong>Compartilhar</strong>
              <small>Gerar link</small>
            </div>
          </button>
        </div>
      </div>

      {/* IMPORTAR */}
      <div className="import-section">
        <h4>📥 Importar</h4>
        
        {!mostrarImport ? (
          <button 
            onClick={() => setMostrarImport(true)} 
            className="btn-show-import"
          >
            ➕ Importar Gastos
          </button>
        ) : (
          <div className="import-form">
            <div className="import-info">
              <p>💡 <strong>Formatos aceitos:</strong></p>
              <ul>
                <li>📊 <strong>CSV:</strong> Arquivo exportado do Excel ou Sheets</li>
                <li>📋 <strong>JSON:</strong> Backup do app</li>
              </ul>
            </div>
            
            <label htmlFor="file-upload" className="file-upload-label">
              <span className="file-icon">📁</span>
              <span>Selecionar Arquivo</span>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="file-input"
              />
            </label>
            
            <button 
              onClick={() => setMostrarImport(false)} 
              className="btn-cancel-import"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* ESTATÍSTICAS */}
      <div className="export-stats">
        <div className="stat-item">
          <span className="stat-icon">📝</span>
          <div>
            <strong>{gastos.length}</strong>
            <small>gastos registrados</small>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">💾</span>
          <div>
            <strong>{(JSON.stringify(gastos).length / 1024).toFixed(1)} KB</strong>
            <small>tamanho dos dados</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportarImportar
