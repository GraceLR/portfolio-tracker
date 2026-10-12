export type AssetType = "Stock" | "ETF" | "Crypto"
export type TransactionType = "buy" | "sell" | "dividend"
export type PortfolioName = "Growth Portfolio" | "Dividends Portfolio" | "Crypto"

export interface Asset {
  symbol: string
  name: string
  type: AssetType
  portfolio: PortfolioName
  currentPrice: number
  color: string
  coinGeckoId?: string
}

export interface Transaction {
  id: string
  symbol: string
  type: TransactionType
  date: string
  quantity: number
  price: number
}

export interface Holding extends Asset {
  quantity: number
  averageCost: number
  costBasis: number
  marketValue: number
  gain: number
  gainPercent: number
}

export const seedAssets: Asset[] = [
  { symbol: "VTI", name: "Vanguard Total Stock Market", type: "ETF", portfolio: "Growth Portfolio", currentPrice: 311.42, color: "#7857ef" },
  { symbol: "AAPL", name: "Apple Inc.", type: "Stock", portfolio: "Growth Portfolio", currentPrice: 247.88, color: "#2e8c74" },
  { symbol: "BTC", name: "Bitcoin", type: "Crypto", portfolio: "Crypto", currentPrice: 68124.3, color: "#ef9b44", coinGeckoId: "bitcoin" },
  { symbol: "SCHD", name: "Schwab US Dividend Equity", type: "ETF", portfolio: "Dividends Portfolio", currentPrice: 31.18, color: "#4a82d8" },
]

const monthsAgo = (months: number, day: number) => {
  const date = new Date()
  date.setMonth(date.getMonth() - months, day)
  return date.toISOString().slice(0, 10)
}

export const seedTransactions: Transaction[] = [
  { id: "t1", symbol: "VTI", type: "buy", date: monthsAgo(22, 8), quantity: 40, price: 238.2 },
  { id: "t2", symbol: "VTI", type: "buy", date: monthsAgo(8, 14), quantity: 12, price: 281.6 },
  { id: "t3", symbol: "AAPL", type: "buy", date: monthsAgo(18, 3), quantity: 28, price: 184.4 },
  { id: "t4", symbol: "AAPL", type: "buy", date: monthsAgo(5, 19), quantity: 8, price: 221.75 },
  { id: "t5", symbol: "BTC", type: "buy", date: monthsAgo(15, 11), quantity: 0.12, price: 59200 },
  { id: "t6", symbol: "BTC", type: "buy", date: monthsAgo(3, 7), quantity: 0.045, price: 64350 },
  { id: "t7", symbol: "SCHD", type: "buy", date: monthsAgo(13, 22), quantity: 130, price: 26.85 },
  { id: "t8", symbol: "SCHD", type: "buy", date: monthsAgo(2, 10), quantity: 35, price: 29.64 },
  { id: "t9", symbol: "VTI", type: "dividend", date: monthsAgo(3, 25), quantity: 52, price: 0.94 },
  { id: "t10", symbol: "AAPL", type: "dividend", date: monthsAgo(2, 12), quantity: 36, price: 0.26 },
  { id: "t11", symbol: "SCHD", type: "dividend", date: monthsAgo(1, 18), quantity: 165, price: 0.26 },
  { id: "t12", symbol: "VTI", type: "dividend", date: monthsAgo(9, 25), quantity: 40, price: 0.91 },
]

export function calculateHoldings(assets: Asset[], transactions: Transaction[]): Holding[] {
  return assets.flatMap((asset) => {
    let quantity = 0
    let costBasis = 0

    transactions
      .filter((transaction) => transaction.symbol === asset.symbol)
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((transaction) => {
        if (transaction.type === "buy") {
          quantity += transaction.quantity
          costBasis += transaction.quantity * transaction.price
        }

        if (transaction.type === "sell" && quantity > 0) {
          const soldQuantity = Math.min(transaction.quantity, quantity)
          costBasis -= soldQuantity * (costBasis / quantity)
          quantity -= soldQuantity
        }
      })

    if (quantity <= 0.0000001) return []

    const marketValue = quantity * asset.currentPrice
    const gain = marketValue - costBasis

    return [{
      ...asset,
      quantity,
      averageCost: costBasis / quantity,
      costBasis,
      marketValue,
      gain,
      gainPercent: costBasis ? (gain / costBasis) * 100 : 0,
    }]
  })
}

export function trailingYearDividends(transactions: Transaction[]) {
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 1)

  return transactions
    .filter((transaction) => transaction.type === "dividend" && new Date(transaction.date) >= cutoff)
    .reduce((sum, transaction) => sum + transaction.quantity * transaction.price, 0)
}
