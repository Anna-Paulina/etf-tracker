// src/utils/storage.js

const KEYS = {
  API_KEY: 'etf_api_key',
  ETF_LIST: 'etf_list',
  ALLOCATIONS: 'etf_allocations',
}

export const storage = {
  getApiKey: () => localStorage.getItem(KEYS.API_KEY) || '',
  setApiKey: (key) => localStorage.setItem(KEYS.API_KEY, key),

  getETFs: () => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.ETF_LIST) || '[]')
    } catch { return [] }
  },
  setETFs: (list) => localStorage.setItem(KEYS.ETF_LIST, JSON.stringify(list)),

  getAllocations: () => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.ALLOCATIONS) || '{}')
    } catch { return {} }
  },
  setAllocations: (obj) => localStorage.setItem(KEYS.ALLOCATIONS, JSON.stringify(obj)),
}

export function fmt(n, decimals = 2) {
  if (n == null || isNaN(n)) return '—'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

export function fmtCurrency(n, currency = 'USD') {
  if (n == null || isNaN(n)) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n)
}

export function fmtLarge(n) {
  if (!n) return '—'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' M'
  return n.toString()
}
