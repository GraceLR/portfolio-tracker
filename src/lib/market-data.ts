import type { Asset, AssetType } from "@/lib/portfolio"
import { lookup as lookupStock } from "stock-ticker-symbol"

const COINGECKO_API = "https://api.coingecko.com/api/v3"

interface CoinGeckoSearchResult {
  id: string
  name: string
  symbol: string
}

interface CoinGeckoSearchResponse {
  coins: CoinGeckoSearchResult[]
}

export interface SymbolMatch {
  symbol: string
  name: string
  type: AssetType
  coinGeckoId?: string
  currentPrice?: number
  source: "portfolio" | "coingecko" | "security-directory"
}

export async function refreshPublicPrices(assets: Asset[], signal?: AbortSignal) {
  const cryptoAssets = assets.filter((asset) => asset.coinGeckoId)
  if (!cryptoAssets.length) return new Map<string, number>()

  const ids = cryptoAssets.map((asset) => asset.coinGeckoId).join(",")
  const response = await fetch(
    `${COINGECKO_API}/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd`,
    { signal },
  )

  if (!response.ok) throw new Error(`Quote provider returned ${response.status}`)

  const prices = await response.json() as Record<string, { usd?: number }>
  const quotes = new Map<string, number>()

  cryptoAssets.forEach((asset) => {
    const price = asset.coinGeckoId ? prices[asset.coinGeckoId]?.usd : undefined
    if (typeof price === "number") quotes.set(asset.symbol, price)
  })

  return quotes
}

export async function lookupSymbol(
  symbol: string,
  assets: Asset[],
  signal?: AbortSignal,
): Promise<SymbolMatch | null> {
  const normalizedSymbol = symbol.trim().toUpperCase()
  if (!normalizedSymbol) return null

  const portfolioAsset = assets.find((asset) => asset.symbol === normalizedSymbol)
  if (portfolioAsset) {
    return {
      symbol: portfolioAsset.symbol,
      name: portfolioAsset.name,
      type: portfolioAsset.type,
      coinGeckoId: portfolioAsset.coinGeckoId,
      currentPrice: portfolioAsset.currentPrice,
      source: "portfolio",
    }
  }

  const response = await fetch(
    `${COINGECKO_API}/search?query=${encodeURIComponent(normalizedSymbol)}`,
    { signal },
  )

  if (!response.ok) throw new Error(`Symbol provider returned ${response.status}`)

  const data = await response.json() as CoinGeckoSearchResponse
  const match = data.coins.find((coin) => coin.symbol.toUpperCase() === normalizedSymbol)
  if (!match) {
    const stockName = lookupStock(normalizedSymbol)
    return stockName
      ? {
          symbol: normalizedSymbol,
          name: stockName,
          type: "Stock",
          source: "security-directory",
        }
      : null
  }

  const priceResponse = await fetch(
    `${COINGECKO_API}/simple/price?ids=${encodeURIComponent(match.id)}&vs_currencies=usd`,
    { signal },
  )
  const priceData = priceResponse.ok
    ? await priceResponse.json() as Record<string, { usd?: number }>
    : {}

  return {
    symbol: normalizedSymbol,
    name: match.name,
    type: "Crypto",
    coinGeckoId: match.id,
    currentPrice: priceData[match.id]?.usd,
    source: "coingecko",
  }
}
