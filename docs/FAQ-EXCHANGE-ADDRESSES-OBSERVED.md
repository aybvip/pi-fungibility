---
layout: faq
faq_question: "Bitget and OKX show these Pi deposit addresses — does that mean the coin's origin is now traceable?"
faq_answer: "No. On-chain, these are single native accounts with scalar balances; inbound payments carry a muxed recipient id (to_muxed_id) that identifies the recipient at the exchange (who), not the coin's origin (where). The attribution to Bitget/OKX is external (the venues' UI/docs), never proven by the ledger."
---

# FAQ — "Here are two exchange addresses — can you now trace a coin's origin?"

## Short answer
No. The addresses are real, and the payments into them are plain native payments. But the `to_muxed_id` tag names the **recipient** inside a pooled account (who), not the **coin's origin** (where). 

The ledger shows **how much** went to which G account and with which muxed id — it never shows **where that π came from**.

## What's actually being observed (measurement)

We measured two addresses as shown by the exchanges (attribution is external):

| Property | Bitget (`GDFNWH6Z…75`) | OKX (`GALYJFJ5…EQU`) |
|---|---|---|
| Asset | native only | native only |
| Balance | 165,432,201.2469451 π | 37,539,111.4435694 π |
| Subentries/flags/signers | 0 / auth off / 1 signer (0/0/0 thresholds) | same |
| Inbound deposits | carry `to_muxed_id` (171/171 in the last 200 payments) | carry `to_muxed_id` (197/197 in the last 200 payments) |
| M address | rebuilt byte-for-byte from `(G + id)` and matches `to_muxed` | same match |

### Rebuilding the muxed address (CAP-27)

For each deposit, `M... = muxedFromG(G..., to_muxed_id)`. The API returns `to_muxed` (the M address) — the script rebuilds it from first principles and requires `rebuilt === api.to_muxed`. This is a pure check that the tag is exactly `(G + id)`, not some other metadata.

> Stellar: “Muxed accounts do not exist on the ledger, but their shared underlying G… account does.” (CAP-27). Treating `M` as “separate” is a misread of the addressing model.

## The key distinction

| What `to_muxed_id` tells you | What it does NOT tell you |
|---|---|
| **Who receives** inside the pooled account (which user ID at the venue). | **Where the coin came from** (mined / withdrawn / sent from another app). |
| The routing/accounting identifier for crediting the correct internal user. | Any per-unit origin tag. No such field exists on the native asset. |

## Concrete, pinned evidence: Bitget → OKX

We verified **5 distinct historical transactions** where Bitget sent native π directly to OKX, each successful, `memo_type: "none"`, with a single native payment op to OKX (one case is multi-op but the OKX payment matches exactly):

| Transaction hash | Amount | `to_muxed_id` (OKX side) | Notes |
|---|---|---|
| `6a77e7db92750aa8fcd03ea00e2ecbffdd9bb734c5ca7c66aed91984f8e75137` | 129.2106200 | 2486605 | single-op |
| `dc967226fe81530960171dc8819c2c3d7485107880ec52bfbe97ccf13fbdbca6` | 177.4462800 | 2494403 | single-op |
| `68b384aa5845309ceaccb90fceaefa7f2bdb67cf7e8e99438e55eaf380afbd19` | 340.1076151 | 1504575 | single-op |
| `ccd1af63d264fdb2e732caaac2494af2d242ec21679675cce497a74eb1a2bb9c` | 1116.7920500 | 2494316 | multi-op tx contains another payment |
| `bab994789ee5deb694b8db9513914f09b83c4b922a0d5640a5fcf8c9f90a004d` | 102.0257300 | 2489489 | single-op |

These hashes are **pinned** in `examples/exchange-wallets.mjs` and re-checked by the script every time it runs. The tx hash itself is immutable; the ledger state for that transaction is fixed.

## Why this does NOT break fungibility

- **One scalar balance.** Each G account holds a single native balance (`165.43M π` / `37.53M π`). Muxed ids do not create separate balances, they only tag payments. When those payments land, the amount is **merged** into that scalar number.
- **No per-unit identity.** The ledger does not track which “coin” was merged. History is non-injective with respect to state. (See `examples/model-check.mjs` + `examples/exhaustive-check.mjs`.)
- **Recipient identity ≠ coin origin.** Knowing *which exchange user* received a credit is different from knowing *where the π came from*. You can know **who**, you cannot know **which unit’s provenance** — because no such provenance exists for native π.
- **The M is derived, not new state.** `M = G + id`. The network processes the payment exactly as if muxed were not used. The underlying G account is what exists on the ledger.

## Honest caveat

**Attribution is external.** On-chain, there is no label reading “Bitget” or “OKX”. We label these two addresses because the venues themselves publish them in their UI/docs. The script explicitly prints this boundary and never asserts on-chain ownership. This matches the repo’s principle: address labeling = know *who*, not *where the coin came from*.

## Reproduce (read-only)

```bash
node examples/exchange-wallets.mjs
node examples/self-test.mjs  # includes offline codec tests (checksums + muxed rebuild)
```

Outputs: `examples/exchange-wallets-output.txt` (committed snapshot), `examples/self-test-output.txt`.

## Context

- [`docs/FAQ-MUXED-M-VS-G.md`](FAQ-MUXED-M-VS-G.md) — why M vs G doesn’t reveal origin
- [`docs/FAQ-TRANSACTION-VS-COIN.md`](FAQ-TRANSACTION-VS-COIN.md) — transaction vs coin (the boundary that matters)
- [`examples/verify-deposit.mjs`](../examples/verify-deposit.mjs) — Claim B (specific deposit is native on-chain)
- [`docs/SCOPE.md`](SCOPE.md) — Claims A (fungibility), B (verifiable), C (not claimed)
