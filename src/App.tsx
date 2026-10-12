import { useEffect, useMemo, useRef, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  CircleDollarSign,
  Landmark,
  Plus,
  RefreshCw,
  Sparkles,
  WalletCards,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  calculateHoldings,
  seedAssets,
  seedTransactions,
  trailingYearDividends,
  type Asset,
  type AssetType,
  type PortfolioName,
  type Transaction,
  type TransactionType,
} from "@/lib/portfolio"
import { lookupSymbol, refreshPublicPrices, type SymbolMatch } from "@/lib/market-data"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
})

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
})

const quantityFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 })
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
const today = new Date().toISOString().slice(0, 10)

const emptyForm = {
  type: "buy" as TransactionType,
  symbol: "VTI",
  name: "",
  assetType: "Stock" as AssetType,
  quantity: "",
  price: "",
  date: today,
}

function App() {
  const [assets, setAssets] = useState<Asset[]>(seedAssets)
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState("")
  const [selectedPortfolio, setSelectedPortfolio] = useState<"Whole Portfolio" | PortfolioName>("Whole Portfolio")
  const [quoteStatus, setQuoteStatus] = useState<"loading" | "live" | "fallback">("loading")
  const [liveQuoteCount, setLiveQuoteCount] = useState(0)
  const [lastQuoteUpdate, setLastQuoteUpdate] = useState<Date | null>(null)
  const [lookupStatus, setLookupStatus] = useState<"idle" | "searching" | "found" | "not-found" | "error">("idle")
  const [symbolMatch, setSymbolMatch] = useState<SymbolMatch | null>(null)
  const assetsRef = useRef(assets)
  assetsRef.current = assets

  const allHoldings = useMemo(() => calculateHoldings(assets, transactions), [assets, transactions])
  const holdings = selectedPortfolio === "Whole Portfolio"
    ? allHoldings
    : allHoldings.filter((holding) => holding.portfolio === selectedPortfolio)
  const visibleSymbols = new Set(holdings.map((holding) => holding.symbol))
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0)
  const totalBasis = holdings.reduce((sum, holding) => sum + holding.costBasis, 0)
  const totalGain = totalValue - totalBasis
  const dividendTotal = trailingYearDividends(
    transactions.filter((transaction) => visibleSymbols.has(transaction.symbol)),
  )
  const cryptoIds = assets.map((asset) => asset.coinGeckoId).filter(Boolean).join(",")

  useEffect(() => {
    const controller = new AbortController()

    const updateQuotes = async () => {
      setQuoteStatus("loading")
      try {
        const quotes = await refreshPublicPrices(assetsRef.current, controller.signal)
        setLiveQuoteCount(quotes.size)
        if (quotes.size) {
          setAssets((current) => current.map((asset) => ({
            ...asset,
            currentPrice: quotes.get(asset.symbol) ?? asset.currentPrice,
          })))
          setLastQuoteUpdate(new Date())
          setQuoteStatus("live")
        } else {
          setQuoteStatus("fallback")
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setQuoteStatus("fallback")
        }
      }
    }

    void updateQuotes()
    const interval = window.setInterval(updateQuotes, 60_000)
    return () => {
      controller.abort()
      window.clearInterval(interval)
    }
  }, [cryptoIds])

  useEffect(() => {
    if (!dialogOpen || !form.symbol.trim()) {
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      try {
        const match = await lookupSymbol(form.symbol, assetsRef.current, controller.signal)
        setSymbolMatch(match)
        if (!match) {
          setLookupStatus("not-found")
          return
        }

        setForm((current) => ({
          ...current,
          name: match.name,
          assetType: match.type,
          price: current.price || (match.currentPrice?.toString() ?? ""),
        }))
        setLookupStatus("found")
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setLookupStatus("error")
        }
      }
    }, 450)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [dialogOpen, form.symbol])

  const openTransaction = () => {
    const defaultSymbol = holdings[0]?.symbol ?? allHoldings[0]?.symbol ?? ""
    const defaultAsset = assets.find((asset) => asset.symbol === defaultSymbol)
    setForm({
      ...emptyForm,
      symbol: defaultSymbol,
      name: defaultAsset?.name ?? "",
      assetType: defaultAsset?.type ?? "Stock",
    })
    setFormError("")
    setLookupStatus(defaultSymbol ? "searching" : "idle")
    setSymbolMatch(null)
    setDialogOpen(true)
  }

  const submitTransaction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const symbol = form.symbol.trim().toUpperCase()
    const quantity = Number(form.quantity)
    const price = Number(form.price)
    const matchingHolding = allHoldings.find((holding) => holding.symbol === symbol)

    if (!symbol || !form.date || quantity <= 0 || price < 0) {
      setFormError("Enter a symbol, date, positive quantity, and valid price.")
      return
    }

    if (form.type === "sell" && (!matchingHolding || quantity > matchingHolding.quantity)) {
      setFormError(`You do not own enough ${symbol} to record this sale.`)
      return
    }

    if (!assets.some((asset) => asset.symbol === symbol) && form.type !== "buy") {
      setFormError("A new holding must begin with a buy transaction.")
      return
    }

    if (!assets.some((asset) => asset.symbol === symbol)) {
      setAssets((current) => [
        ...current,
        {
          symbol,
          name: form.name.trim() || symbol,
          type: form.assetType,
          portfolio: form.assetType === "Crypto" ? "Crypto" : "Growth Portfolio",
          currentPrice: price,
          color: ["#7857ef", "#2e8c74", "#ef9b44", "#4a82d8"][current.length % 4],
          coinGeckoId: symbolMatch?.coinGeckoId,
        },
      ])
    }

    setTransactions((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        symbol,
        type: form.type,
        date: form.date,
        quantity,
        price,
      },
    ])
    setDialogOpen(false)
  }

  const recentActivity = [...transactions]
    .filter((transaction) => visibleSymbols.has(transaction.symbol))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#14201c]">
      <header className="border-b border-[#dfe5e1] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#14201c] text-white">
              <Landmark className="size-4" />
            </div>
            <span className="text-[17px] font-semibold tracking-[-0.03em]">Ledge</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="hidden items-center gap-2 rounded-full bg-[#f2f5f3] px-3 py-1.5 text-xs text-[#65726d] sm:flex"
              title={quoteStatus === "live" ? `Live public quotes updated ${lastQuoteUpdate?.toLocaleTimeString()}` : "Using saved prices when a public quote is unavailable"}
            >
              <span className={`size-1.5 rounded-full ${quoteStatus === "live" ? "bg-[#2f9878]" : "bg-[#d59a3a]"}`} />
              {quoteStatus === "loading" ? "Refreshing prices" : quoteStatus === "live" ? `${liveQuoteCount} live quote` : "Saved prices"}
            </div>
            <Button onClick={openTransaction} className="rounded-full bg-[#14201c] px-4 text-white hover:bg-[#263630]">
              <Plus className="size-4" />
              Add transaction
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 md:py-12">
        <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-[#77827e]">PORTFOLIO OVERVIEW</p>
            <h1 className="text-3xl font-semibold tracking-[-0.045em] text-[#14201c] md:text-[40px]">
              Good afternoon, Alex.
            </h1>
            <p className="mt-2 text-sm text-[#65726d]">Here’s how your investments are doing today.</p>
          </div>
          <div className="relative w-fit">
            <select
              aria-label="Choose portfolio"
              value={selectedPortfolio}
              onChange={(event) => setSelectedPortfolio(event.target.value as "Whole Portfolio" | PortfolioName)}
              className="h-10 appearance-none rounded-lg border border-[#dbe2de] bg-white py-2 pr-9 pl-3 text-sm font-medium shadow-sm outline-none transition focus:border-[#8c9993] focus:ring-2 focus:ring-[#dce5e1]"
            >
              <option>Whole Portfolio</option>
              <option>Growth Portfolio</option>
              <option>Dividends Portfolio</option>
              <option>Crypto</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#7d8984]" />
          </div>
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-3">
          <Card className="overflow-hidden border-[#dfe5e1] bg-[#14201c] p-0 text-white shadow-none lg:col-span-2">
            <div className="flex min-h-[270px] flex-col justify-between p-6 md:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm text-[#aebbb6]">
                    <WalletCards className="size-4" /> Total portfolio value
                  </div>
                  <p className="text-4xl font-medium tracking-[-0.05em] md:text-[52px]">{currency.format(totalValue)}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-1 rounded-full bg-[#2f9878]/20 px-2 py-1 text-[#7bdbbd]">
                      <ArrowUpRight className="size-3.5" />
                      {totalBasis ? ((totalGain / totalBasis) * 100).toFixed(1) : "0.0"}%
                    </span>
                    <span className="text-[#93a39d]">all-time return</span>
                  </div>
                </div>
                <Sparkles className="size-5 text-[#82918b]" />
              </div>
              <div className="mt-8">
                <svg viewBox="0 0 700 75" className="h-20 w-full" preserveAspectRatio="none" aria-label="Portfolio value trend">
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#72d5b5" stopOpacity=".25" />
                      <stop offset="100%" stopColor="#72d5b5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 66 C42 62 55 45 95 51 S150 37 190 43 S242 21 280 30 S344 35 385 19 S438 25 478 13 S535 24 577 10 S640 16 700 2 L700 75 L0 75Z" fill="url(#chartFill)" />
                  <path d="M0 66 C42 62 55 45 95 51 S150 37 190 43 S242 21 280 30 S344 35 385 19 S438 25 478 13 S535 24 577 10 S640 16 700 2" fill="none" stroke="#72d5b5" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <div className="mt-2 flex justify-between text-[11px] text-[#74857e]">
                  <span>JAN</span><span>MAR</span><span>MAY</span><span>JUL</span><span>SEP</span><span>NOW</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <MetricCard
              icon={<CircleDollarSign className="size-4" />}
              label="Total cost basis"
              value={currency.format(totalBasis)}
              detail="Average cost method"
            />
            <MetricCard
              icon={<ArrowDownLeft className="size-4" />}
              label="Dividends · past year"
              value={currency.format(dividendTotal)}
              detail={`${totalValue ? ((dividendTotal / totalValue) * 100).toFixed(2) : "0.00"}% of portfolio value`}
              accent
            />
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="overflow-hidden border-[#dfe5e1] bg-white p-0 shadow-none">
            <div className="flex items-center justify-between border-b border-[#e5e9e7] px-5 py-5 md:px-6">
              <div>
                <h2 className="text-base font-semibold tracking-[-0.02em]">Your holdings</h2>
                <p className="mt-1 text-xs text-[#7b8782]">{holdings.length} assets across stocks, ETFs, and crypto</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-1.5 text-[11px] text-[#77847f] sm:flex">
                  <RefreshCw className={`size-3 ${quoteStatus === "loading" ? "animate-spin" : ""}`} />
                  {quoteStatus === "live" ? "Live where available" : "Saved-price fallback"}
                </span>
                <Badge variant="secondary" className="rounded-full bg-[#f1f4f2] font-medium text-[#66736e]">
                  USD
                </Badge>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-[#edf0ee] text-[11px] font-medium tracking-[0.04em] text-[#8a9590]">
                    <th className="px-6 py-3">ASSET</th>
                    <th className="px-4 py-3">QUANTITY</th>
                    <th className="px-4 py-3 text-right">AVG. COST</th>
                    <th className="px-4 py-3 text-right">COST BASIS</th>
                    <th className="px-4 py-3 text-right">MARKET VALUE</th>
                    <th className="px-6 py-3 text-right">RETURN</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr key={holding.symbol} className="border-b border-[#edf0ee] last:border-0">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-xl text-xs font-bold text-white" style={{ backgroundColor: holding.color }}>
                            {holding.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{holding.symbol}</p>
                            <p className="mt-0.5 max-w-[180px] truncate text-xs text-[#7d8984]">{holding.name}</p>
                          </div>
                          <Badge variant="outline" className="ml-1 rounded-md border-[#e2e7e4] text-[10px] font-medium text-[#7a8681]">
                            {holding.type}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#50605a]">{quantityFormat.format(holding.quantity)}</td>
                      <td className="px-4 py-4 text-right text-sm text-[#50605a]">{currency.format(holding.averageCost)}</td>
                      <td className="px-4 py-4 text-right text-sm text-[#50605a]">{currency.format(holding.costBasis)}</td>
                      <td className="px-4 py-4 text-right text-sm font-semibold">{currency.format(holding.marketValue)}</td>
                      <td className="px-6 py-4 text-right">
                        <p className={holding.gain >= 0 ? "text-sm font-semibold text-[#238065]" : "text-sm font-semibold text-[#c14e4e]"}>
                          {holding.gain >= 0 ? "+" : ""}{holding.gainPercent.toFixed(1)}%
                        </p>
                        <p className="mt-0.5 text-xs text-[#8a9590]">{holding.gain >= 0 ? "+" : ""}{currency.format(holding.gain)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="border-[#dfe5e1] bg-white p-0 shadow-none">
            <div className="border-b border-[#e5e9e7] px-5 py-5">
              <h2 className="text-base font-semibold tracking-[-0.02em]">Recent activity</h2>
              <p className="mt-1 text-xs text-[#7b8782]">Your latest portfolio entries</p>
            </div>
            <div className="px-5">
              {recentActivity.map((transaction) => {
                const isDividend = transaction.type === "dividend"
                const amount = transaction.quantity * transaction.price
                return (
                  <div key={transaction.id} className="flex items-center gap-3 border-b border-[#edf0ee] py-4 last:border-0">
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${isDividend ? "bg-[#e6f5ef] text-[#258167]" : "bg-[#f0edfd] text-[#6e53cf]"}`}>
                      {isDividend ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {isDividend ? `${transaction.symbol} dividend` : `${transaction.type === "buy" ? "Bought" : "Sold"} ${transaction.symbol}`}
                      </p>
                      <p className="mt-0.5 text-xs text-[#84908b]">{dateFormat.format(new Date(`${transaction.date}T12:00:00`))}</p>
                    </div>
                    <p className="text-sm font-semibold">{currency.format(amount)}</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </section>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[#dfe5e1] p-6 sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-[-0.03em]">Add a transaction</DialogTitle>
            <DialogDescription>
              Record a buy, sale, or dividend. Your totals recalculate immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitTransaction} className="mt-2 space-y-5">
            <div className="grid grid-cols-3 gap-2">
              {(["buy", "sell", "dividend"] as TransactionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, type }))}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${form.type === type ? "border-[#14201c] bg-[#14201c] text-white" : "border-[#dfe5e1] bg-white text-[#65726d] hover:bg-[#f5f7f6]"}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Symbol">
                <Input
                  value={form.symbol}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      symbol: event.target.value.toUpperCase(),
                      name: "",
                      price: "",
                    }))
                    setFormError("")
                    setLookupStatus(event.target.value ? "searching" : "idle")
                    setSymbolMatch(null)
                  }}
                  placeholder="e.g. AAPL"
                  className="h-10 uppercase"
                />
                <p className={`min-h-4 text-[11px] ${lookupStatus === "error" || lookupStatus === "not-found" ? "text-[#a36c27]" : "text-[#77847f]"}`}>
                  {lookupStatus === "searching" && "Looking up symbol…"}
                  {lookupStatus === "found" && `${symbolMatch?.source === "coingecko" ? "Live provider" : "Portfolio"} match found`}
                  {lookupStatus === "not-found" && "No public match. Enter the details below."}
                  {lookupStatus === "error" && "Lookup unavailable. You can enter details manually."}
                </p>
              </FormField>
              <FormField label="Date">
                <Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="h-10" />
              </FormField>
            </div>

            <div className="grid gap-4 rounded-xl border border-[#e2e7e4] bg-[#f7f9f8] p-4 sm:grid-cols-2">
              <FormField label="Asset name">
                <Input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder={lookupStatus === "searching" ? "Looking up…" : "Apple Inc."}
                  readOnly={lookupStatus === "found"}
                  className="h-10 bg-white read-only:bg-[#f0f3f1] read-only:text-[#53605b]"
                />
              </FormField>
              <FormField label="Asset type">
                <select
                  value={form.assetType}
                  onChange={(event) => setForm((current) => ({ ...current, assetType: event.target.value as AssetType }))}
                  disabled={lookupStatus === "found"}
                  className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30 disabled:bg-[#f0f3f1] disabled:text-[#53605b]"
                >
                  <option>Stock</option><option>ETF</option><option>Crypto</option>
                </select>
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={form.type === "dividend" ? "Eligible quantity" : "Quantity"}>
                <Input type="number" min="0" step="any" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} placeholder="0" className="h-10" />
              </FormField>
              <FormField label={form.type === "dividend" ? "Dividend per unit" : "Price per unit"}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8a9590]">$</span>
                  <Input type="number" min="0" step="any" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="0.00" className="h-10 pl-7" />
                </div>
              </FormField>
            </div>

            {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

            <DialogFooter className="-mx-6 -mb-6 px-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#14201c] text-white hover:bg-[#263630]">Save transaction</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  accent = false,
}: {
  icon: ReactNode
  label: string
  value: string
  detail: string
  accent?: boolean
}) {
  return (
    <Card className="flex min-h-[127px] flex-row items-center justify-between border-[#dfe5e1] bg-white p-5 shadow-none">
      <div>
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#71807a]">
          <span className={accent ? "text-[#2c8d70]" : "text-[#65726d]"}>{icon}</span>{label}
        </div>
        <p className="text-2xl font-semibold tracking-[-0.04em]">{value}</p>
        <p className="mt-1 text-xs text-[#8a9590]">{detail}</p>
      </div>
      <div className={`hidden rounded-full px-2 py-1 text-xs font-medium sm:block lg:hidden xl:block ${accent ? "bg-[#e8f5f0] text-[#277d63]" : "bg-[#f1f4f2] text-[#68756f]"}`}>
        {accent ? "Income" : compactCurrency.format(Number(value.replace(/[$,]/g, "")))}
      </div>
    </Card>
  )
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-[#5f6c67]">{label}</Label>
      {children}
    </div>
  )
}

export default App
