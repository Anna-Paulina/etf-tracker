// src/App.jsx
import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Settings, X, TrendingUp } from 'lucide-react'
import ETFCard from './components/ETFCard'
import PortfolioSummary from './components/PortfolioSummary'
import { fetchMultipleETFs, fetchETFData } from './hooks/useFinnhub'
import { storage } from './utils/storage'

const s = {
  app: {
    minHeight: '100vh',
    background: 'var(--bg)',
    padding: '0 0 60px',
  },
  header: {
    borderBottom: '1px solid var(--border)',
    background: 'rgba(10,10,15,0.8)',
    backdropFilter: 'blur(12px)',
    position: 'sticky', top: 0, zIndex: 100,
    padding: '0 32px',
  },
  headerInner: {
    maxWidth: 1100, margin: '0 auto',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: 60, gap: 16,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em',
  },
  logoIcon: {
    width: 32, height: 32, background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 32px 0' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 16,
  },
  btn: (variant) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
    transition: 'all 0.15s',
    ...(variant === 'primary'
      ? { background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#fff' }
      : variant === 'ghost'
      ? { background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }
      : { background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' }),
  }),
  modal: {
    position: 'fixed', inset: 0, zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
  },
  modalBox: {
    background: 'var(--bg2)', border: '1px solid var(--border2)',
    borderRadius: 20, padding: '28px 32px', width: 400, maxWidth: '90vw',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  input: {
    background: 'var(--bg3)', border: '1px solid var(--border2)',
    borderRadius: 10, color: 'var(--text)', fontFamily: 'var(--font-mono)',
    fontSize: 14, padding: '10px 14px', width: '100%',
    outline: 'none', transition: 'border-color 0.15s',
  },
  empty: {
    textAlign: 'center', padding: '80px 32px',
    color: 'var(--text2)',
  },
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => storage.getApiKey())
  const [symbols, setSymbols] = useState(() => storage.getETFs())
  const [allocations, setAllocations] = useState(() => storage.getAllocations())
  const [etfData, setEtfData] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingSymbol, setLoadingSymbol] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newSymbol, setNewSymbol] = useState('')
  const [tempKey, setTempKey] = useState('')
  const [addError, setAddError] = useState('')
  const [lastRefresh, setLastRefresh] = useState(null)

  // Load all ETFs
  const loadAll = useCallback(async (syms, key) => {
    if (!syms.length || !key) return
    setLoading(true)
    const results = await fetchMultipleETFs(syms, key)
    setEtfData(results)
    setLastRefresh(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (apiKey && symbols.length) loadAll(symbols, apiKey)
  }, []) // only on mount

  // Add ETF
  const handleAdd = async () => {
    const sym = newSymbol.trim().toUpperCase()
    if (!sym) return
    if (symbols.includes(sym)) { setAddError('Symbole déjà ajouté'); return }
    if (!apiKey) { setAddError('Clé API manquante — configure-la dans les paramètres'); return }

    setAddError('')
    setLoadingSymbol(sym)
    try {
      const data = await fetchETFData(sym, apiKey)
      if (data.price == null || data.price === 0) {
        setAddError(`"${sym}" introuvable sur Finnhub`)
        setLoadingSymbol(null)
        return
      }
      const newSymbols = [...symbols, sym]
      setSymbols(newSymbols)
      storage.setETFs(newSymbols)
      setEtfData(prev => [...prev, { ...data, error: null }])
      setNewSymbol('')
      setShowAdd(false)
    } catch (e) {
      setAddError('Erreur : ' + e.message)
    }
    setLoadingSymbol(null)
  }

  // Remove ETF
  const handleRemove = (symbol) => {
    const newSymbols = symbols.filter(s => s !== symbol)
    setSymbols(newSymbols)
    storage.setETFs(newSymbols)
    setEtfData(prev => prev.filter(e => e.symbol !== symbol))
    const newAlloc = { ...allocations }
    delete newAlloc[symbol]
    setAllocations(newAlloc)
    storage.setAllocations(newAlloc)
  }

  // Refresh single ETF
  const handleRefresh = async (symbol) => {
    if (!apiKey) return
    setLoadingSymbol(symbol)
    try {
      const data = await fetchETFData(symbol, apiKey)
      setEtfData(prev => prev.map(e => e.symbol === symbol ? { ...data, error: null } : e))
    } catch (e) {
      setEtfData(prev => prev.map(e => e.symbol === symbol ? { ...e, error: e.message } : e))
    }
    setLoadingSymbol(null)
  }

  // Update allocation
  const handleAllocChange = (symbol, value) => {
    const newAlloc = { ...allocations, [symbol]: value }
    setAllocations(newAlloc)
    storage.setAllocations(newAlloc)
  }

  // Save API key
  const handleSaveKey = () => {
    storage.setApiKey(tempKey)
    setApiKey(tempKey)
    setShowSettings(false)
    if (symbols.length) loadAll(symbols, tempKey)
  }

  return (
    <div style={s.app}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <div style={s.logoIcon}><TrendingUp size={18} color="#fff" /></div>
            ETF Tracker
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {lastRefresh && (
              <span style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>
                Mis à jour {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button style={s.btn('ghost')} onClick={() => loadAll(symbols, apiKey)} disabled={loading || !apiKey}>
              <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
              Rafraîchir tout
            </button>
            <button style={s.btn()} onClick={() => { setTempKey(apiKey); setShowSettings(true) }}>
              <Settings size={14} /> API Key
            </button>
            <button style={s.btn('primary')} onClick={() => { setNewSymbol(''); setAddError(''); setShowAdd(true) }}>
              <Plus size={14} /> Ajouter ETF
            </button>
          </div>
        </div>
      </header>

      <main style={s.main}>
        {/* No API key warning */}
        {!apiKey && (
          <div style={{
            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: 12, padding: '16px 20px', marginBottom: 24, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ color: 'var(--yellow)' }}>🔑 Configure ta clé API Finnhub pour commencer.</span>
            <button style={s.btn()} onClick={() => { setTempKey(''); setShowSettings(true) }}>
              Configurer
            </button>
          </div>
        )}

        {/* Portfolio summary */}
        {etfData.filter(e => !e.error).length > 0 && (
          <PortfolioSummary etfs={etfData} allocations={allocations} />
        )}

        {/* ETF grid */}
        {symbols.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Aucun ETF ajouté</div>
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>
              Clique sur "Ajouter ETF" pour commencer (ex: IWDA, EMIM, SPY…)
            </div>
          </div>
        ) : (
          <div style={s.grid}>
            {symbols.map(sym => {
              const data = etfData.find(e => e.symbol === sym)
              return (
                <ETFCard
                  key={sym}
                  etf={data || { symbol: sym, error: null }}
                  allocation={allocations[sym] ?? ''}
                  onAllocChange={(v) => handleAllocChange(sym, v)}
                  onRemove={() => handleRemove(sym)}
                  onRefresh={() => handleRefresh(sym)}
                  loading={loadingSymbol === sym}
                />
              )
            })}
          </div>
        )}
      </main>

      {/* Add ETF modal */}
      {showAdd && (
        <div style={s.modal} onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div style={s.modalBox}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Ajouter un ETF</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }} onClick={() => setShowAdd(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
              Entre le ticker Finnhub (ex: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>IWDA</span>, <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>EMIM</span>, <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>SPY</span>)
            </div>
            <input
              style={s.input}
              placeholder="Ex: IWDA"
              value={newSymbol}
              onChange={e => { setNewSymbol(e.target.value.toUpperCase()); setAddError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
            {addError && <div style={{ fontSize: 13, color: 'var(--red)' }}>{addError}</div>}
            <button
              style={s.btn('primary')}
              onClick={handleAdd}
              disabled={!!loadingSymbol || !newSymbol.trim()}
            >
              {loadingSymbol ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
              {loadingSymbol ? 'Chargement...' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div style={s.modal} onClick={e => e.target === e.currentTarget && setShowSettings(false)}>
          <div style={s.modalBox}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Clé API Finnhub</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }} onClick={() => setShowSettings(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
              Récupère ta clé gratuite sur <a href="https://finnhub.io" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>finnhub.io</a>.
              Elle est stockée uniquement dans ton localStorage.
            </div>
            <input
              style={s.input}
              type="password"
              placeholder="ta_cle_api_finnhub"
              value={tempKey}
              onChange={e => setTempKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveKey()}
              autoFocus
            />
            <button style={s.btn('primary')} onClick={handleSaveKey} disabled={!tempKey.trim()}>
              Sauvegarder
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        button:hover { opacity: 0.85; }
        input:focus { border-color: var(--accent) !important; }
      `}</style>
    </div>
  )
}
