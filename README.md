# Ledge Portfolio

A front-end portfolio dashboard built with React and TypeScript. It answers three core questions:

- What is the portfolio worth now?
- What is the average-cost basis of each holding?
- How much dividend income was collected during the trailing 12 months?

The app includes sample stocks, ETFs, and cryptocurrency and lets you record buy, sell, and dividend transactions. Data currently lives in React state, which keeps this version simple while leaving a clear path to an API later.

The portfolio selector filters the dashboard between the whole portfolio, growth, dividends, and crypto. Symbol entry checks assets already in the portfolio, queries CoinGecko for cryptocurrency metadata, and then checks a bundled US security directory for stocks such as VZ. CoinGecko prices refresh every 60 seconds; stocks and ETFs keep their saved sample prices until a backend can protect credentials for a broader market-data provider.

## Run locally

You need a current version of [Node.js](https://nodejs.org/).

```bash
npm install
npm run dev
```

Open the URL printed by Vite in your terminal.

## Other commands

```bash
npm run build   # Type-check and create a production build
npm run lint    # Check the source for common mistakes
npm run preview # Preview the production build
```

## How the calculation works

`src/lib/portfolio.ts` contains the financial logic:

1. A buy adds its full cost to the holding's cost basis.
2. A sale removes the sold quantity at the holding's current average cost.
3. Average cost is the remaining cost basis divided by remaining quantity.
4. Market value is current price multiplied by quantity.
5. Trailing-year dividends include dividend transactions dated within the last 12 months.

This logic is separate from the dashboard components, so a future API can replace the sample arrays without rewriting the calculations or interface.

## Live-data limitation

This front-end version uses only providers that allow direct browser requests without exposing a private API key. The interface labels live and fallback data rather than presenting saved stock prices as live. A future backend should request stock and ETF quotes, cache them, and keep the provider key secret.

> This project is a learning tool, not financial or tax advice. Cost-basis rules vary by asset and jurisdiction.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
