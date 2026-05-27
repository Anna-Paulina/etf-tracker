// src/hooks/useFinnhub.js
// Fetches quote + profile + candles (1Y) for a given symbol

const BASE = 'https://finnhub.io/api/v1'

export async function fetchETFData(symbol, apiKey) {
  const headers = { 'X-Finnhub-Token': apiKey }

  // Current quote
  const quoteRes = await fetch(`${BASE}/quote?symbol=${symbol}`, { headers })
  const quote = await quoteRes.json()

  // Company/ETF profile
  const profileRes = await fetch(`${BASE}/etf/profile?symbol=${symbol}`, { headers })
  const profile = await profileRes.json()

  // 1-year candles (weekly) for chart
  const to = Math.floor(Date.now() / 1000)
  const from = to - 365 * 24 * 60 * 60
  const candleRes = await fetch(
    `${BASE}/stock/candle?symbol=${symbol}&resolution=W&from=${from}&to=${to}`,
    { headers }
  )
  const candles = await candleRes.json()

  // Annual return estimate from 1Y candle data
  let annualReturn = null
  if (candles.s === 'ok' && candles.c?.length >= 2) {
    const first = candles.c[0]
    const last = candles.c[candles.c.length - 1]
    annualReturn = ((last - first) / first) * 100
  }

  // Build weekly chart data
  const chartData = []
  if (candles.s === 'ok') {
    candles.t.forEach((ts, i) => {
      chartData.push({
        date: new Date(ts * 1000).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        price: candles.c[i],
      })
    })
  }

  return {
    symbol,
    name: profile?.name || symbol,
    currency: profile?.currency || 'USD',
    price: quote.c,
    change: quote.d,
    changePct: quote.dp,
    high52: quote.h,
    low52: quote.l,
    prevClose: quote.pc,
    annualReturn,
    chartData,
    expenseRatio: profile?.expenseRatio || null,
    totalAssets: profile?.totalAssets || null,
    profile,
  }
}

export async function fetchMultipleETFs(symbols, apiKey) {
  // Stagger requests to avoid rate limits (60/min on free plan)
  const results = []
  for (let i = 0; i < symbols.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 300))
    try {
      const data = await fetchETFData(symbols[i], apiKey)
      results.push({ ...data, error: null })
    } catch (e) {
      results.push({ symbol: symbols[i], error: e.message })
    }
  }
  return results
}
