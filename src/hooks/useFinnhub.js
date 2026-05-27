const BASE = 'https://finnhub.io/api/v1'

function url(path, apiKey, params = {}) {
  const q = new URLSearchParams({ ...params, token: apiKey })
  return `${BASE}${path}?${q}`
}

export async function fetchETFData(symbol, apiKey) {
  const quoteRes = await fetch(url('/quote', apiKey, { symbol }))
  const quote = await quoteRes.json()

  let profile = {}
  try {
    const profileRes = await fetch(url('/etf/profile', apiKey, { symbol }))
    profile = await profileRes.json()
  } catch (_) {}

  if (!profile?.name) {
    try {
      const compRes = await fetch(url('/stock/profile2', apiKey, { symbol }))
      const comp = await compRes.json()
      if (comp?.name) profile = { ...profile, name: comp.name, currency: comp.currency }
    } catch (_) {}
  }

  const to = Math.floor(Date.now() / 1000)
  const from = to - 365 * 24 * 60 * 60
  const candleRes = await fetch(url('/stock/candle', apiKey, { symbol, resolution: 'W', from, to }))
  const candles = await candleRes.json()

  let annualReturn = null
  if (candles.s === 'ok' && candles.c?.length >= 2) {
    const first = candles.c[0]
    const last = candles.c[candles.c.length - 1]
    annualReturn = ((last - first) / first) * 100
  }

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
