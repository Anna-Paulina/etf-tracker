// src/components/ETFCard.jsx
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import { TrendingUp, TrendingDown, Trash2, RefreshCw } from 'lucide-react'
import { fmt, fmtCurrency, fmtLarge } from '../utils/storage'

const styles = {
  card: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--card-radius)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    transition: 'border-color 0.2s',
    position: 'relative',
    overflow: 'hidden',
  },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  symbol: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' },
  name: { fontSize: 12, color: 'var(--text2)', marginTop: 2, lineHeight: 1.4 },
  price: { fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em' },
  changeBadge: (pos) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 99, fontSize: 13, fontWeight: 600,
    background: pos ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
    color: pos ? 'var(--green)' : 'var(--red)',
  }),
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 },
  stat: {
    background: 'var(--bg3)', borderRadius: 10, padding: '10px 12px',
  },
  statLabel: { fontSize: 10, color: 'var(--text2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-mono)' },
  annualBadge: (n) => ({
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)',
    color: n >= 0 ? 'var(--green)' : 'var(--red)',
  }),
  alloc: {
    display: 'flex', alignItems: 'center', gap: 10, marginTop: 2,
  },
  allocInput: {
    background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8,
    color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600,
    padding: '4px 10px', width: 72, textAlign: 'right',
  },
  actions: { display: 'flex', gap: 8, alignItems: 'center' },
  btn: (variant) => ({
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: variant === 'danger' ? 'var(--red)' : 'var(--text2)',
    padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center',
    transition: 'color 0.15s, background 0.15s',
  }),
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
      {fmtCurrency(payload[0].value)}
    </div>
  )
}

export default function ETFCard({ etf, allocation, onAllocChange, onRemove, onRefresh, loading }) {
  if (!etf || etf.error) {
    return (
      <div style={{ ...styles.card, borderColor: 'rgba(248,113,113,0.3)' }}>
        <div style={styles.header}>
          <div>
            <div style={styles.symbol}>{etf?.symbol}</div>
            <div style={{ ...styles.name, color: 'var(--red)' }}>Erreur : {etf?.error || 'Symbole introuvable'}</div>
          </div>
          <button style={styles.btn('danger')} onClick={onRemove} title="Supprimer"><Trash2 size={16} /></button>
        </div>
      </div>
    )
  }

  const pos = etf.changePct >= 0
  const annualPos = (etf.annualReturn ?? 0) >= 0

  return (
    <div style={{ ...styles.card, ...(loading ? { opacity: 0.6 } : {}) }}>
      {/* Subtle accent line top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: pos ? 'var(--green)' : 'var(--red)', opacity: 0.5 }} />

      <div style={styles.header}>
        <div>
          <div style={styles.symbol}>{etf.symbol}</div>
          <div style={styles.name}>{etf.name}</div>
        </div>
        <div style={styles.actions}>
          <button style={styles.btn()} onClick={onRefresh} title="Rafraîchir" disabled={loading}>
            <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          </button>
          <button style={styles.btn('danger')} onClick={onRemove} title="Supprimer">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Price + day change */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={styles.price}>{fmtCurrency(etf.price, etf.currency)}</span>
        <span style={styles.changeBadge(pos)}>
          {pos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {pos ? '+' : ''}{fmt(etf.changePct)}%
        </span>
      </div>

      {/* Mini chart */}
      {etf.chartData?.length > 0 && (
        <div style={{ height: 70, margin: '0 -4px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={etf.chartData}>
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="price" dot={false} strokeWidth={2}
                stroke={annualPos ? 'var(--green)' : 'var(--red)'}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Rendement 1A</div>
          <div style={styles.annualBadge(annualPos)}>
            {annualPos ? '+' : ''}{fmt(etf.annualReturn)}%
          </div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Plus haut 52s</div>
          <div style={styles.statValue}>{fmtCurrency(etf.high52, etf.currency)}</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Plus bas 52s</div>
          <div style={styles.statValue}>{fmtCurrency(etf.low52, etf.currency)}</div>
        </div>
        {etf.expenseRatio != null && (
          <div style={styles.stat}>
            <div style={styles.statLabel}>Frais (TER)</div>
            <div style={styles.statValue}>{fmt(etf.expenseRatio * 100)}%</div>
          </div>
        )}
        {etf.totalAssets != null && (
          <div style={styles.stat}>
            <div style={styles.statLabel}>Actifs</div>
            <div style={styles.statValue}>{fmtLarge(etf.totalAssets)}</div>
          </div>
        )}
        <div style={styles.stat}>
          <div style={styles.statLabel}>Clôture veille</div>
          <div style={styles.statValue}>{fmtCurrency(etf.prevClose, etf.currency)}</div>
        </div>
      </div>

      {/* Allocation input */}
      <div style={styles.alloc}>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>Allocation portefeuille :</span>
        <input
          type="number" min={0} max={100} step={1}
          value={allocation ?? ''}
          onChange={e => onAllocChange(Number(e.target.value))}
          style={styles.allocInput}
          placeholder="0"
        />
        <span style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>%</span>
      </div>
    </div>
  )
}
