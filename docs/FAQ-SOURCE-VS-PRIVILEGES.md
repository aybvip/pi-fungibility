---
layout: faq
faq_question: "Could Pi have one market price but give early pioneers extra ecosystem privileges?"
faq_answer: "Technically, yes. Fungibility means 1 π = 1 π on-chain and at market price. Extra privileges (bonuses, priority, lower fees) can be tied to account history/contribution (off-chain/ecosystem logic), not to splitting the native asset into two types."
---

# FAQ — Same price, but different privileges (history-based rewards)

## Short answer
**Yes — in principle.** The native asset `π` can remain fully fungible (one market price, no two "kinds" of π on-chain) while the ecosystem grants **extra privileges** to accounts based on their contribution history (pioneer tenure, mining activity, Security Circle, Nodes, badges, lockups, etc.).

These are **account-level attributes**, not a property of individual coins.

## The key distinction: Price vs Value

| Term | What it is | Where it lives |
|---|---|---|
| **Price** | The market price of 1 π (determined by liquidity, supply/demand on CEX/DEX/AMM). | Off-chain markets + on-chain DEX pools. |
| **Value/privileges** | Extra benefits (bonuses, priority access, fee discounts, early allocation multipliers, etc.) tied to an account's history. | Ecosystem apps, launchpads, staking/rewards logic, or off-chain gating — **not** the ledger's native asset. |

## Why one price is natural

- **DEX/AMM require fungibility.** Automated market makers treat every unit of the same asset identically. Two "types" of π would require separate pools or a complex wrapper.
- **1 π = 1 π on-chain.** The ledger has a single scalar balance per account and no `origin`/`class` field for native π. Splitting would require a different asset (token/IOU) with trustlines, not the native asset.
- **Fungibility is a protocol property.** As this repo proves, native π carries **no observable per-unit origin** ([`FAQ-TRANSACTION-VS-COIN.md`](FAQ-TRANSACTION-VS-COIN.md), [`FAQ-SOURCE-VS-PRICE-LEDGER.md`](FAQ-TAX-SOURCING.md)).

## How history-based privileges work without breaking fungibility

Account history exists (tenure, mining sessions, migration, lockups, KYC status, badges, Nodes, Security Circle). Ecosystems can read/verify eligibility at the **account level** when users interact:

1. **Eligibility is per account, not per coin.** "Ahmed is a pioneer since 7 years" is an attribute of his `G...` account (or verifiable off-chain/through ecosystem logic). It does **not** tag the π he holds.
2. **Bonuses apply to participation, not to the asset's denomination.** In a launchpad example: both send 100 π. The contract/app can allocate 200 base tokens to both, **plus** a bonus to the eligible account. The bonus can be paid in the new token (or later claimable) — no change to π's price.
3. **Privileges are non-transferable by buying π.** You can buy 10,000 π, but you cannot buy 7 years of pioneer history. That’s the clean distinction: **history is bound to the account**, π is liquid and fungible.
4. **No "taint" spreads.** Because eligibility isn't attached to coins, sending π to another wallet doesn't carry the privilege unless the privilege is account-bound and non-transferable by design ([`FAQ-TAINT-CONTAGION.md`](FAQ-TAINT-CONTAGION.md)).

## The boundary (technical vs ecosystem)

| Mechanism | Changes the native asset? | Preserves 1 π = 1 π? | Observable on-chain? |
|---|---|---|---|
| Two prices for native π | Yes (impossible cleanly with DEX/AMM) | **No** | Would require a new field (doesn't exist). |
| Account-based bonuses/priority in an app/launchpad | **No** | **Yes** | Eligibility may be off-chain or attested; the payment itself is still a plain native payment. |
| Rewarding bonus π later from a pool | **No** (separate payment) | **Yes** | A new native payment, indistinguishable in type from any other. |

## Takeaway

The "joker" is exactly this separation:

> **Same market price for π. Extra ecosystem value tied to account contribution history.**

This solves the fairness debate without creating two classes of the native asset. It’s consistent with the ledger’s design (scalar balances, no per-unit origin) and with how many ecosystems reward loyalty/tenure without splitting their base asset.

## Notes on scope

This is a **technical possibility/clarification**, not a claim about what Pi Network’s Core Team will do. The repo only asserts what’s observable on the ledger ([Claims A–C in `SCOPE.md`](SCOPE.md)); ecosystem privileges are an orthogonal design choice.