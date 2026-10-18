---
layout: faq
faq_question: "Does buying Pi from an exchange vs mining change what an app/chain observer can see?"
faq_answer: "No. On-chain, both are the same native asset. There is no 'mined' vs 'bought' field. The only observable differences are off-chain records (receipts, invoices, tax logs). The ledger itself carries no per-unit origin."
---

# FAQ — Source (bought vs mined): what the ledger sees vs off-chain

## Short answer
**On-chain: nothing.** The Pi Mainnet ledger records native payments as `asset_type: "native"` with `amount`, `from`, `to`, `memo_type`, and (for pooled accounts) `to_muxed_id`. It does **not** record whether a unit was mined, purchased on an exchange, or received from an app.

**Off-chain: everything that matters for accounting/tax.** Invoices, trade history, deposit/withdrawal receipts, KYC, timestamps, and the venue's internal ledgers are separate from the public ledger.

## The technical point (matches this repo)

- **No origin field.** A native payment has no `origin`, `source_type`, `mined`, `purchase_id`, or equivalent.
- **Scalar balance, not units with IDs.** When π lands in an account, it merges into a single balance. The per-unit history is not preserved.
- **Muxed recipient ≠ origin.** `to_muxed_id` identifies *who* receives inside a pooled account (e.g. an exchange user), never *where the coin came from* (mined/bought). See [`FAQ-MUXED-M-VS-G.md`](FAQ-MUXED-M-VS-G.md).
- **Concrete evidence:** Two real exchange accounts and 5 pinned Bitget→OKX transfers show plain native payments, `memo_type: "none"`, with `to_muxed_id` only. See [`FAQ-EXCHANGE-ADDRESSES-OBSERVED.md`](FAQ-EXCHANGE-ADDRESSES-OBSERVED.md).

## What this does NOT imply

- **It does not say "treat them the same for tax".** The repo is technical (fungibility + what’s observable on-chain). Tax treatment depends on your jurisdiction, how you acquired the asset, when control was obtained, and the specific transactions you performed.
- **It does not erase off-chain records.** If you bought on an exchange, the exchange keeps an order/trade history. If you mined, your app/phone logs may exist. Those are **different sources of evidence** than the public chain.
- **It does not prove or disprove taxability.** "No origin field on-chain" is a ledger property. Whether mining rewards are taxable at receipt (or only at disposal) is a legal/accounting question, not a technical property of the native asset.

## The clean boundary

| Question | Where the answer lives |
|---|---|
| **Can the chain tell if this π was mined vs bought?** | **No.** (on-chain) — this repo proves that. |
| **Can your records show how you acquired it?** | **Yes.** (off-chain receipts/trade logs/wallet history). |
| **Does that difference create two different assets?** | **No.** They are the same native, fungible asset (`π = π`). |

## Practical takeaway
Keep clean records by **acquisition method** (purchase receipts, withdrawal tx hashes, mining/migration timestamps). Do that for compliance — it doesn’t contradict fungibility. The chain’s inability to see origin is exactly why you must preserve your own off-chain documentation.

## Reproduce (read-only)
```bash
node examples/exchange-wallets.mjs   # shows muxed id (who) vs no origin
node examples/provenance-check.mjs  # shows no origin field on a real payment
```

## Context
- [`docs/SCOPE.md`](SCOPE.md) — Claims A (fungibility), B (verifiable), C (not claimed)
- [`docs/FAQ-TRANSACTION-VS-COIN.md`](FAQ-TRANSACTION-VS-COIN.md) — transaction vs coin
- [`docs/FAQ-MUXED-M-VS-G.md`](FAQ-MUXED-M-VS-G.md) — muxed = counterparty, not origin
- [`docs/FAQ-EXCHANGE-ADDRESSES-OBSERVED.md`](FAQ-EXCHANGE-ADDRESSES-OBSERVED.md) — concrete observed addresses
