import type { Asset, AssetType } from "@/lib/portfolio"

export interface SymbolMatch {
  symbol: string
  name: string
  type: AssetType
  currentPrice?: number
  source: "portfolio" | "security-directory"
}

export async function lookupSymbol(
  symbol: string,
  assets: Asset[],
): Promise<SymbolMatch | null> {
  const normalizedSymbol = symbol.trim().toUpperCase()
  if (!normalizedSymbol) return null

  const portfolioAsset = assets.find((asset) => asset.symbol === normalizedSymbol)
  if (portfolioAsset) {
    return {
      symbol: portfolioAsset.symbol,
      name: portfolioAsset.name,
      type: portfolioAsset.type,
      currentPrice: portfolioAsset.currentPrice,
      source: "portfolio",
    }
  }

  const stockDirectoryModule = await import("stock-ticker-symbol/tickerToName.json")
  const stockDirectory = stockDirectoryModule.default as Record<string, { name: string }>
  const stockName = stockDirectory[normalizedSymbol]?.name
  return stockName
    ? {
        symbol: normalizedSymbol,
        name: stockName,
        type: "Stock",
        source: "security-directory",
      }
    : null
}
