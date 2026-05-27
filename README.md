# ETF Tracker

App React/Vite pour suivre tes ETF en temps réel via l'API Finnhub, déployée sur GitHub Pages.

## Features

- 🔍 Ajout d'ETF par ticker (IWDA, EMIM, SPY, etc.)
- 📈 Prix en temps réel + variation du jour
- 📊 Graphique 1 an (données hebdomadaires)
- 🎯 Rendement annuel calculé automatiquement
- 🥧 Répartition portefeuille (pie chart)
- 💾 Persistance localStorage (ETF + allocations + clé API)
- 🔄 Rafraîchissement individuel ou global

## Setup

### 1. Clone & install

```bash
git clone https://github.com/TON_USERNAME/etf-tracker.git
cd etf-tracker
npm install
```

### 2. Configure le repo name dans vite.config.js

```js
base: '/etf-tracker/', // doit correspondre au nom de ton repo GitHub
```

### 3. Dev local

```bash
npm run dev
```

### 4. Deploy sur GitHub Pages

```bash
npm run deploy
```

Puis dans les settings GitHub du repo → Pages → Source: `gh-pages` branch.

### 5. Clé API Finnhub

- Crée un compte gratuit sur [finnhub.io](https://finnhub.io)
- Copie ta clé API
- Dans l'app, clique sur "API Key" et colle-la

La clé est stockée uniquement dans ton localStorage (jamais envoyée ailleurs).

## Tickers Finnhub pour tes ETF

| ETF | Ticker Finnhub |
|-----|---------------|
| iShares Core MSCI World | `IWDA` |
| iShares Core MSCI EM IMI | `EMIM` |
| S&P 500 | `SPY` ou `VOO` |
| Nasdaq 100 | `QQQ` |

> Note: Finnhub peut avoir des tickers légèrement différents pour les ETF listés sur Euronext/LSE.
> Si un ticker ne fonctionne pas, essaie avec le suffix de la bourse (ex: `IWDA.L` pour LSE).

## Stack

- React 18 + Vite
- Recharts (graphiques)
- Lucide React (icônes)
- Finnhub API (données marché)
- GitHub Pages (hébergement)
