// src/components/PortfolioSummary.jsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { fmt } from '../utils/storage'

const COLORS = ['#6c8eff', '#a78bfa', '#4ade80', '#fbbf24', '#f87171', '#38bdf8', '#fb923c', '#e879f9']

export default function PortfolioSummary({ etfs, allocations }) {
  if (!etfs.length) return null

  const valid = etfs.filter(e => !e.error && e.annualReturn != null)
  if (!valid.length) return null

  // Weighted average annual return
  const totalAlloc = valid.reduce((s, e) => s + (allocations[e.symbol] ?? 0), 0)
  const weightedReturn = totalAlloc > 0
    ? valid.reduce((s, e) => {
        const w = (allocations[e.symbol] ?? 0) / totalAlloc
        return s + (e.annualReturn ?? 0) * w
      }, 0)
    : valid.reduce((s, e) => s + (e.annualReturn ?? 0), 0) / valid.length

  // Pie data
  const pieData = valid.map((e, i) => ({
    name: e.symbol,
    value: allocations[e.symbol] ?? Math.round(100 / valid.length),
    color: COLORS[i % COLORS.length],
  })).filter(d => d.value > 0)

  const allocSum = pieData.reduce((s, d) => s + d.value, 0)
  const allocOk = Math.abs(allocSum - 100) < 1

  const pos = weightedReturn >= 0

  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--card-radius)', padding: '24px', marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Résumé portefeuille</h2>
        {!allocOk && allocSum > 0 && (
          <div style={{
            background: 'rgba(251,191,36,0.12)', color: 'var(--yellow)',
            borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 600,
          }}>
            Total allocations : {allocSum}% (doit être 100%)
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
        {/* Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
              Rendement moyen pondéré 1A
            </div>
            <div style={{
              fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-mono)',
              color: pos ? 'var(--green)' : 'var(--red)',
              letterSpacing: '-0.04em',
            }}>
              {pos ? '+' : ''}{fmt(weightedReturn)}%
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {valid.map((e, i) => (
              <div key={e.symbol} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{e.symbol}</span>
                </div>
                <div style={{
                  fontSize: 16, fontFamily: 'var(--font-mono)', fontWeight: 600,
                  color: (e.annualReturn ?? 0) >= 0 ? 'var(--green)' : 'var(--red)',
                }}>
                  {(e.annualReturn ?? 0) >= 0 ? '+' : ''}{fmt(e.annualReturn)}%
                </div>
                {allocations[e.symbol] != null && (
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    {allocations[e.symbol]}% du portef.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pie chart */}
        {pieData.length > 1 && (
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`${v}%`, n]}
                  contentStyle={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 8, fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 12, color: 'var(--text2)' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
