---
layout: faq
faq_question: "Could Pi have one market price but give early pioneers extra ecosystem privileges?"
faq_answer: "Yes — and Pi's own RFC (PiRC1, Pi Launchpad) designs exactly this. Fungibility keeps 1 π = 1 π on-chain. PiPower (from staked π, plus a baseline for lockups of at least 90% for at least 3 years in accounts created before 2026-02-20) and an Engagement Score set caps and effective prices for the newly launched token — never a second price for π itself."
---

# FAQ — Same price, but different privileges (history-based rewards)

## Short answer
**Yes — and this is not merely hypothetical.** Pi Network's own RFC, **PiRC1 — Pi Ecosystem Token Design (Pi Launchpad)**, designs exactly this separation.

The native asset `π` can remain fully fungible (one market price, no two "kinds" of π on-chain) while the ecosystem grants **extra privileges** to accounts based on their contribution history (pioneer tenure, mining activity, Security Circle, Nodes, badges, lockups, etc.).

These are **account-level attributes**, not a property of individual coins.

## The key distinction: Price vs Value

| Term | What it is | Where it lives |
|---|---|---|
| **Price** | The market price of 1 π (determined by liquidity, supply/demand on CEX/DEX/AMM). | Off-chain markets + on-chain DEX pools. |
| **Value/privileges** | Extra benefits (bonuses, priority access, fee discounts, early allocation multipliers, etc.) tied to an account's history. | Ecosystem apps, launchpads, staking/rewards logic, or off-chain gating — **not** the ledger's native asset. |

## Why one price is natural

- **DEX/AMM require fungibility.** Automated market makers treat every unit of the same asset identically. Two "types" of π would require separate pools or a complex wrapper.
- **1 π = 1 π on-chain.** The ledger has a single scalar balance per account and no `origin`/`class` field for native π. Splitting would require a different asset (token/IOU) with trustlines, not the native asset.
- **Fungibility is a protocol property.** As this repo proves, native π carries **no observable per-unit origin** ([`FAQ-TRANSACTION-VS-COIN.md`](FAQ-TRANSACTION-VS-COIN.md), [`FAQ-TAX-SOURCING.md`](FAQ-TAX-SOURCING.md)).

## How history-based privileges work without breaking fungibility

Account history exists (tenure, mining sessions, migration, lockups, KYC status, badges, Nodes, Security Circle). Ecosystems can read/verify eligibility at the **account level** when users interact:

1. **Eligibility is per account, not per coin.** "Ahmed is a pioneer since 7 years" is an attribute of his `G...` account (or verifiable off-chain/through ecosystem logic). It does **not** tag the π he holds.
2. **Bonuses apply to participation, not to the asset's denomination.** In a launchpad example: both send 100 π. The contract/app can allocate 200 base tokens to both, **plus** a bonus to the eligible account. The bonus can be paid in the new token (or later claimable) — no change to π's price.
3. **Privileges are non-transferable by buying π.** You can buy 10,000 π, but you cannot buy 7 years of pioneer history. That’s the clean distinction: **history is bound to the account**, π is liquid and fungible.
4. **No "taint" spreads.** Because eligibility isn't attached to coins, sending π to another wallet doesn't carry the privilege unless the privilege is account-bound and non-transferable by design ([`FAQ-TAINT-CONTAGION.md`](FAQ-TAINT-CONTAGION.md)).

## Official corroboration — PiRC1 (Pi Launchpad)

Pi Network's own RFC **[PiRC1 — Pi Ecosystem Token Design](https://github.com/PiNetwork/PiRC/blob/main/PiRC1/ReadMe.md)** (org `PiNetwork`, cited in the official Pi Day 2026 announcement) designs exactly the separation above.

### `PiPower` — a participation cap, not a second price for π

From [§3 Participation](https://github.com/PiNetwork/PiRC/blob/main/PiRC1/3-participation.md):

```
PiPower_i = T_available × ( StakedPi_i / ΣStakedPi  +  PiPower_Baseline )
```

- `StakedPi_i` = the π a user stakes for that launch.
- `T_available` = the tokens the project provides to the Launchpad.
- **`PiPower` bounds the maximum number of *the new token* a user may commit to buy.** It never re-prices π.

### `PiPower_Baseline` — history that cannot be bought

> “Any user with an **active Pi lockup of ≥90% of their mined tokens for at least 3 years** at the time of a token launch **created before February 20, 2026** automatically receives a standardized, platform-defined baseline PiPower… The time limit was to prevent future accounts created to exploit this baseline PiPower.”

This is the “history is bound to the account, not the coin” principle written into a spec — with a **hard date cutoff**. You can buy any amount of π today; you cannot back-date an account's lockup history.

### `Engagement Score` — different effective prices for the *new* token

The same participation window scores a user's interaction with the project's app. At close, participants are ranked, and that rank affects the **effective price of the launched token** — never of π:

| Design | Effective-price range on the launched token | Mechanism |
|---|---|---|
| Design 1 | `p_eff/p_list` = 0.909 / 0.952 / 1.000 (≈ **10%** max discount) | `T_engage = 5%T`, split 2/3 · 1/3 · 0 by engagement third |
| Design 2 | `p_eff` from `0.4·p_list` → `p_list` (up to **60%** discount) | engagement-ranked AMM swaps; discounted tokens carry a lockup proportional to the discount |

### All committed π becomes liquidity — never project revenue

> “all Pi sold becomes liquidity” · the Escrow Wallet “will be **permanently locked by removing its own signing authority to 0 on the blockchain** (an irreversible operation)”.

### Why this does **not** touch fungibility

| Question | Answer |
|---|---|
| Is the staked asset a different kind of π? | **No.** Same native asset — `asset_type: "native"`, one scalar balance. |
| Do `PiPower` / `Engagement Score` appear on the ledger? | **No.** They are Launchpad participation metrics, not ledger fields. |
| Does a discount create a “premium π”? | **No.** It changes how many units of the *new* token a participant receives per π committed. |
| Can that π later be sold at the discounted rate? | **No.** The discount is bound to the participation event, not carried by the coin. |

→ Consistent with [`FAQ-SMART-CONTRACTS-AND-TOKENS.md`](FAQ-SMART-CONTRACTS-AND-TOKENS.md): ecosystem tokens are a **different asset**; π stays one fungible native asset.

### ⚠️ Status: RFC, not a final Mainnet spec

PiRC is explicitly a **Request for Comment** — “not all suggestions will be adopted”, and “the designs are also subject to further revisions”. The `PiPower_Baseline` value is stated as “will be calibrated”. Pi Launchpad shipped as an **MVP on Testnet** (Pi Day 2026, 2026-03-19).
Treat the *mechanism* as official design intent and the *numbers* as provisional. Pinned quotes: [`docs/SOURCES.md`](SOURCES.md) §19–§21.

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

- This FAQ documents a **design mechanism** (PiRC1 / Pi Launchpad) and the **technical boundary** between the ledger's native asset and ecosystem-level participation logic.
- The repo still only asserts what is observable on the ledger ([Claims A–C in `SCOPE.md`](SCOPE.md)). PiPower, `PiPower_Baseline` and the `Engagement Score` are **not** ledger fields and are **not** part of Claims A–C.
- PiRC1 is an **RFC**: design intent, subject to revision, and the numbers are not final. It is **not** evidence about π's supply, price, or reserve backing.
- Nothing here is a claim about the value of any launched token, nor an endorsement of any project using the Launchpad.