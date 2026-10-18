---
layout: faq
faq_question: "The same coin trades at different prices - does that mean mined π and exchange π are different things?"
faq_answer: "No. Fungibility is a property of the asset on the ledger; price is a property of the market you trade in. The same native π can trade at different prices on different venues because of liquidity, fees, spreads and demand. That is a market difference, not an on-chain difference, and the ledger records no per-unit origin either way."
---
# FAQ — “Same coin = same price?”

## The claim
> “You say π = π (same coin), but the price on the exchange isn’t the same value. So it’s not the same thing.”

## The answer: this conflates three very different things

| # | Concept | Question | Property of | Always equal? |
|---|---|---|---|---|
| 1 | **Fungibility** | Can a unit be exchanged for a unit of the **same kind**? | **the asset** | ✅ Yes for π |
| 2 | **Market price** | What does the market pay at a **given place/time**? | **the market** | ❌ No |
| 3 | **Realizable value** | What do you **actually** get after liquidity, fees, and restrictions? | **execution** | ❌ No |

The common mistake: “same coin” means **(1)** — **not (2)** and **not (3)**.

---

## The evidence: **the same asset** trades at different prices

### Pi itself across venues (Sept 2026)
- OKX ≈ **$0.09433** · Gate ≈ **$0.09424** · Bitget a different number
- Arbitrage spread ≈ **0.12%** — cheapest **Gate**, most expensive **OKX**
- 🔗 https://cryptorank.io/price/pi-network-1/arbitrage · https://arb.sh/arbitrage/crypto/pi/okx-vs-bitget · https://yieldo.me/arbitrage/pi

### Bitcoin — the “Kimchi Premium”
- **The same BTC** trades **higher in Korea** (~2.48%) than on global exchanges.
- 🔗 https://www.investopedia.com/terms/k/kimchi-premium.asp

### The US dollar
- **The same banknote** sells at a higher **black-market** rate in countries with capital controls — the same currency.

👉 Same asset = different prices. **A price difference is not evidence of a different asset.**

---

## Why prices differ for the same π
- **Liquidity & depth** — a thin market swings and large orders move the price
- **Spread & fees** — different per venue
- **Deposit/withdrawal and regional access limits** — they block arbitrage, so the gap persists
- **Trading pairs** — `PI/USDT` ≠ `PI/BTC`
- **IOU vs native** — a real reason (see below)
- **Speculation/manipulation** in small markets

---

## Important: the “value” of π in your wallet
- **A wallet is not a market** → it has no “price”. The number in the wallet is a **quantity**, not a value.
- Real value = **the price you can actually sell at**, which varies with venue, liquidity, and fees.
- So “value” naturally varies — but the **coin is one**.

---

## The only real reason for a difference in “actual value”
If the venue gives you an **IOU** (an internal balance) instead of native on-chain π:

| What you hold | Value |
|---|---|
| **native π** on-chain (your wallet) | the asset’s own value |
| an **IOU** on an exchange (its internal balance) | the asset’s value **− counterparty risk** (the venue may fail/restrict) |

👉 This is **not a difference in the coin** — it’s a difference in **what you actually hold** (IOU vs native).
This is the only real distinction, and we flagged it earlier.

---

## A general rule
> “One price everywhere” is an **illusion** — it requires **perfect market efficiency** (no fees, no restrictions),
> which doesn’t hold even for Bitcoin or the US dollar.
> **Fungibility = asset identity. Price = market state.**

---

## Conclusion
- ✅ “Same coin” = same **asset** (fungibility) — true.
- ❌ “Same price” = a market illusion — never holds for any global asset.
- A **price difference** indicates a lack of **liquidity/access**, not a different coin.
- **The only real difference** = **IOU vs native**.

---

## Sources
- CryptoRank — Pi price comparison across exchanges: https://cryptorank.io/price/pi-network-1/arbitrage
- arb.sh — PI spread (OKX vs Bitget): https://arb.sh/arbitrage/crypto/pi/okx-vs-bitget
- Investopedia — Kimchi Premium: https://www.investopedia.com/terms/k/kimchi-premium.asp
- `docs/FAQ-ALL-OBJECTIONS.md` (Group D: IOU/token)
