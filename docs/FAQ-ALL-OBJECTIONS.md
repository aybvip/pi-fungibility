---
layout: faq
faq_question: "What objections to Pi fungibility remain, and are they all answered?"
faq_answer: "They are catalogued and each one is answered. The unifying rule: any piece of information on the ledger tells you only one of four things - counterparty identity, asset type, amount, or timing - and never a per-unit origin. Arguments that claim otherwise reduce to one of those four, or to an off-chain fact such as an exchange's internal bookkeeping."
---
# FAQ — Every remaining objection (and each one refuted)

> The golden rule that exposes every argument:
> **Any piece of information tells you only one of four things — counterparty identity / asset type /
> balance state / off-chain data — never “the origin of the unit”.**
> And unit origin (mined? exchange?) **does not exist** — not on-chain, not in the Pi Wallet SDK, and not in
> the Platform API.

---

## Group A — “Identifier / address” arguments

| # | Objection | Refutation |
|---|---|---|
| A1 | “Every micro-π has an ID” | Pi uses an **Account/Balance** model, not UTXO; the balance is **one number**. `1π = 10,000,000 micro-π` is a decimal place, not an ID. → `docs/FAQ-MICRO-PI-ID.md` |
| A2 | “Exchanges use M, not G” | `M` = a **Muxed Account** (`G` + ID, CAP-27); it identifies the **counterparty**, not the coin. → `docs/FAQ-MUXED-M-VS-G.md` |
| A3 | “We know OKX/Bitget’s hot wallet, so we can trace it” | That’s **address labeling** = you know **who**, not **where the coin came from**. After the first merge into a wallet, the trail is gone. |
| A4 | “The Memo field reveals the source” | `memo` is **data written by the sender** (optional), with no validation or standard meaning. |
| A5 | “`source_account` reveals the origin” | It identifies **who sent** (an account), not the **origin of the units**. |
| A6 | “The Operation ID settles it” | `op.id` identifies the **operation**, not a coin. |
| A7 | “The wallet address itself is proof” | An address = **account identity**. Any account (person/exchange) can send and receive the same native π. |
| A8 | “The SDK / Platform API must expose where the π came from” | Pi’s own docs **enumerate the whole surface** (`amount`/`memo`/`metadata`, `from_address`/`to_address`, `status`, `txid`) — **no** origin field exists. → `docs/FAQ-SDK-PLATFORM-API-FIELDS.md` |

---

## Group B — “Analysis / tracing” arguments

| # | Objection | Refutation |
|---|---|---|
| B1 | “Chain analysis follows the origin step by step” | In a balance model, **balances merge**; analysis is a **heuristic**, not proof. Once merged, the trail ends. |
| B2 | “We correlate by time and amounts” | **Probabilistic** signals only, easily defeated (split/merge/delay), never a proof of “origin”. |
| B3 | “Analytics companies (Chainalysis etc.) know” | They know **address labels**, not unit origin — and it’s guesswork about known addresses. |
| B4 | “The block explorer shows the wallet type” | It shows **type/state of the address**, not the coin’s origin. |
| B5 | “We follow the number of hops” | Hop counts describe a **transaction path**, not a **unit’s birth**. |

---

## Group C — “State / type / network” arguments

| # | Objection | Refutation |
|---|---|---|
| C1 | “Locked π is different” | A lockup = a `claimable_balance` (state + time predicate), not a different asset. A difference of **state**, not **origin**. |
| C2 | “Staking in apps differentiates” | Staking is **state/governance** info, not unit origin. |
| C3 | “Test-Pi (testnet) vs Pi (mainnet)” | **Two different networks** (different networkPassphrase), not two assets on one chain. |
| C4 | “Wrapped Pi (WPI) on other chains is different” | That’s a **wrapped asset** issued by a contract/entity → it can differ. But it is **not native π** on the Pi blockchain. |
| C5 | “Tokens (Soroban/others) are traceable” | Tokens have an `issuer` + trustline → a **different asset**. The native asset has no issuer at all. |
| C6 | “Stellar has a Stellar Asset Contract for the native asset, so it has a tag” | The SAC wraps the same native asset **without changing its fungibility**; it adds no “origin”. |
| C7 | “Amounts are stored as integers, so they have structure” | **Numeric** structure (scaled integer), not **piece** structure. |
| C8 | “Pi added **Soroban smart contracts**, so a contract can track a coin’s origin” | The contract-facing token interface exposes only **scalars** (`balance`/`allowance`/`transfer`/`transfer_from`/`approve`). A contract can hold state and define rules for **its own token** — a **different asset** — never native π’s per-unit origin. → `docs/FAQ-SMART-CONTRACTS-AND-TOKENS.md` |
| C9 | “**Ecosystem tokens / Pi Launchpad** (PiRC1) mean Pi units are now differentiated” | Launched units are **separate tokens** (own issuer/contract). Pi is used as the **staked/liquidity asset** by scalar amounts. “Mined” appears only as an **account lockup state**, not a per-unit tag. → `docs/FAQ-SMART-CONTRACTS-AND-TOKENS.md` |

---

## Group D — “Off-chain” arguments

| # | Objection | Refutation |
|---|---|---|
| D1 | “The Pi Core Team knows who mined” | Their data is **internal (off-chain)**, not exposed to apps and not carried through the chain. It doesn’t change the native asset’s fungibility. |
| D2 | “The exchange’s database knows the user” | It knows the **user (identity)**, not the **unit’s origin**. |
| D3 | “KYC links the wallet to a person” | KYC links an **identity to a human**, not an **origin to a unit**. |
| D4 | “AML / official exchange records” | **Off-chain** records; they’re not in the app’s payment data. |
| D5 | “Apps know the user’s profile” | They know **behavior/identity**, not coin origin. |

---

## Group E — “Governance / technical” arguments

| # | Objection | Refutation |
|---|---|---|
| E1 | “The Core Team can freeze/block” | The native asset has **no issuer** → **no asset-level freeze/clawback**. (Freezing applies to *issued* assets, not native π.) |
| E2 | “A different consensus (SCP/federated) means control over the coin” | That concerns **block production/consensus**, not a unit’s **origin** or fungibility. |
| E3 | “They could modify the protocol and add IDs” | Possible in theory, but **even so**, those IDs would be for **chain-of-custody**, not **origin** — as Bitcoin demonstrates. |
| E4 | “There is an ‘age’ to a coin” | There’s an age for an **account/transaction**, not for a unit, in a balance model. |
| E5 | “The secret phrase (24 words) identifies the origin” | The key belongs to an **account**, not a piece. |

---

## The master table

| Every argument above gives you only one of these | Identifies |
|---|---|
| an address (`G`/`M`/hot wallet) | **counterparty identity** |
| an asset type (`native` / token / wrapped / testnet) | **asset type** |
| a state (`claimable_balance` / stake) | **balance state** |
| off-chain data (KYC / Core Team / exchange) | **external identity/record** |
| a contract’s own state (Soroban service/subscription) | **app/contract data** |
| **unit origin (mined / bought)** | ❌ **does not exist at all** |

---

## Conclusion
Every possible argument falls into 5 groups, and all of them — without exception — are either **identity**,
**type**, **state**, or **off-chain data**. None gives you the **“unit origin”**, because it is simply **a
concept that does not exist** on the Pi blockchain (no issuer, no UTXO, no origin field).

> **Bottom line:** π = π. Telling mined from exchange Pi is technically impossible.

---

## Sources
- `docs/SOURCES.md` (all official sources)
- `docs/FAQ-MICRO-PI-ID.md` · `docs/FAQ-MUXED-M-VS-G.md` · `docs/FAQ-SDK-PLATFORM-API-FIELDS.md` · `docs/FAQ-SMART-CONTRACTS-AND-TOKENS.md` · `PROOF.md`
- Live tests: `examples/coin-id-check.mjs` · `examples/provenance-check.mjs`
