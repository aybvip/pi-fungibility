# FAQ — Can the Pi Core Team set a **different price** for mined Pi vs exchange Pi, or stop you selling them at the same price?

## The question
> “Can the Pi Core Team force a different price on mined Pi compared with Pi on an exchange, or prevent
> selling them at the same price?”

## Short answer
**No — not at the protocol level, and not per origin.**
For three independent reasons:
1. **The protocol cannot even express “mined vs exchange.”** There is no per-unit origin (no tag). So there is
   nothing to attach a different price to.
2. **The protocol has no “price” at all.** Price is a **market phenomenon**, not a ledger field. No entity sets
   it; buyers and sellers do, venue by venue.
3. **Native Pi has no issuer**, so there are **no asset-level controls** (no freeze, no clawback, no transfer
   restrictions). The issuer **cannot** single out, price-tag, or block native Pi.

---

## 1. Why “different price by origin” is technically impossible

A price difference by origin would require the system to **identify origin** and **apply a rule to it**.
Both are absent:

| Requirement for a per-origin price | Present in Pi? |
|---|---|
| A per-unit origin tag (“this π is mined”) | ❌ Does not exist |
| A price field in the protocol | ❌ Does not exist |
| An issuer rule that can target a subset of units | ❌ No issuer authority over native |

- **No per-unit identity:** the ledger stores `bal(account, native)` as a **single scalar** — see
  [`FAQ-MICRO-PI-ID.md`](FAQ-MICRO-PI-ID.md) and [`SCOPE.md`](SCOPE.md) §7.
- **No price in the ledger:** a payment is `bal(S) -= a ; bal(D) += a`. There is **no place** to record “price”.
- **No issuer control:** the native asset has **no issuer**, so there is no account that can freeze, clawback,
  or restrict it. Issued tokens have those powers; **native Pi does not.**

> So “mining price” vs “exchange price” is not a switch anyone can flip — **the concept has no representation
> in the protocol.**

---

## 2. What the Core Team **cannot** do (on-chain)

| Cannot | Why |
|---|---|
| Set a different price for mined vs exchange Pi | No origin exists to target |
| Set the market price at all | Price is not a protocol field; it is set by markets |
| Freeze / clawback native Pi | Native asset has **no issuer** |
| Block a specific transfer of native Pi | Native asset has **no transfer restrictions** |
| “Tag” Pi as mined so it can be treated differently | The ledger is **immutable** — even by the issuer |

Official corroboration (MiCA whitepaper, §F/§G):
> **G.3:** “…immutable. No modifications … can be made by anyone, **including the issuer**.”
> **G.11 (Transfer Restrictions):** “**Not applicable**”
> **F.6:** “Pi Network does not maintain custody … **native noncustodial** Pi Wallet app … There are **no rights
> or obligations** associated with the Pi token.”
> **E.2:** “The issuer is seeking admission to **secondary trading only**, through which the issuer will not
> gain any direct proceeds.”
🔗 https://minepi.com/wp-content/uploads/2025/11/MiCA-Whitepaper-Pi-1.pdf

---

## 3. What the Core Team **can** do (off-chain — this is the honest part)

Their power is **off-chain and application-level**, never per-coin:

| Can (off-chain) | What it affects |
|---|---|
| Control **Pi Browser / app platform**, SDK and Platform API keys | whether an **app** runs — not wallets |
| Manage **KYC** and the **mining/migration** process | **onboarding** — who gets to migrate |
| Operate their **own** apps / run their own wallets | their own accounts only |
| Ask venues for policy changes (listing, KYC, region) | a **venue’s** rules — not the asset |
| Distribute **mining rewards** by their own formula | how much is **mined** — not a per-coin tag |

**None of these can set a price for native Pi, nor target “mined” vs “exchange” units** — because units are
not identifiable and the ledger has no price.

---

## 4. The only technically-possible “two prices” route — and it isn’t native Pi

If someone wanted two different prices, they would need **two different assets**:

| What you hold | Is it native Pi? | Can it have different rules/price? |
|---|---|---|
| **native Pi** on-chain (your wallet) | ✅ Yes | No — one asset, one market basis |
| an **IOU** on a venue (internal balance) | ❌ No | Yes — the **venue’s** terms (risk/limits) |
| a **wrapped** Pi (e.g. WPI on another chain) | ❌ No | Yes — that **token’s** issuer sets rules |

👉 Any “special price” scheme is about a **different asset** (IOU/wrapped/token), **not** native Pi. It does
**not** change native Pi’s fungibility. This is the single real distinction — always check `asset_type` and
`issuer`.

---

## 5. Market reality: one asset, slightly different prices (not by origin)

Even a single native asset can trade at slightly different prices across venues — due to **fees, liquidity,
depth, access/region limits, and trading pairs**. Examples:
- **Pi** across exchanges: small spread (e.g. OKX vs Gate ≈ 0.12%).
  🔗 https://cryptorank.io/price/pi-network-1/arbitrage
- **Bitcoin** “Kimchi premium”: the **same BTC** ~2.48% higher in Korea.
  🔗 https://www.investopedia.com/terms/k/kimchi-premium.asp

👉 A price difference reflects **venue/liquidity conditions**, **not** a different **origin** or a different
**asset**. Price ≠ origin. (See [`FAQ-FUNGIBILITY-VS-PRICE.md`](FAQ-FUNGIBILITY-VS-PRICE.md).)

---

## 6. Conclusion

```
Different price by origin?   → impossible: no origin to target, no price field
Prevent selling?             → impossible on-chain: no issuer, no transfer restrictions
Set the market price?        → no entity can; markets set prices
Their real power?            → off-chain / app-level only (platform, KYC, migration)
```

**Neither the Core Team nor anyone else can price native Pi by origin, or block its sale, at the protocol
level.** Mined Pi and exchange Pi are the **same native asset** — **π = π**.

---

## Sources
- MiCA Whitepaper (F.6, F.13, F.14, G.3, G.4, G.11, E.2): https://minepi.com/wp-content/uploads/2025/11/MiCA-Whitepaper-Pi-1.pdf
- Pi Platform API (`PaymentDTO`, no price/origin): https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md
- Stellar — Accounts (native asset has no issuer; scalar balance):
  https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts
- CryptoRank — Pi price across venues: https://cryptorank.io/price/pi-network-1/arbitrage
- Investopedia — Kimchi Premium: https://www.investopedia.com/terms/k/kimchi-premium.asp
- Internal: [`SCOPE.md`](SCOPE.md) · [`FAQ-FUNGIBILITY-VS-PRICE.md`](FAQ-FUNGIBILITY-VS-PRICE.md) · [`FAQ-MICRO-PI-ID.md`](FAQ-MICRO-PI-ID.md)
