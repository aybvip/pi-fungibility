# FAQ — “Pi now has Soroban smart contracts and ecosystem tokens — so you *can* tag a coin’s origin now?”

> Objection: *“Pi has added smart contracts (Soroban) and a token launchpad. A smart contract can store
> anything — including where each coin came from. So the ‘no origin field’ claim is obsolete.”*
>
> Short answer: **No.** Smart contracts change **what can be built on top of Pi**, not **what a native π
> payment carries**. The interface a contract is given for an asset exposes only **scalars**
> (`balance`, `allowance`, `transfer`, `transfer_from`, `approve`) — there is **no per-unit origin** to read
> or to write. A contract may define arbitrary rules **for its own token**, but that is a **different asset**,
> never **native π**.

This is the same conclusion as [`FAQ-MICRO-PI-ID.md`](FAQ-MICRO-PI-ID.md) and [`PROOF.md`](../PROOF.md),
approached from the **new smart-contract layer**.

---

## 1. What Pi actually added (official, with status)

| Item | Official source | Status |
|---|---|---|
| **PiRC** — Pi Requests for Comment | `github.com/PiNetwork/PiRC` | **RFC** (proposal), open for comment |
| **PiRC1** — Pi Ecosystem Token Design (Pi Launchpad) | `PiRC1/ReadMe.md` | **RFC** |
| **PiRC2** — Subscription Contract API | `PiRC2/ReadMe.md` | **RFC** + reference implementation |
| **Subscription contract** (first smart contract) | `minepi.com/blog/subscriptions-smart-contract` (2026-04-17) | **Testnet**; Mainnet rollout pending |
| Reference implementation | `github.com/PiNetwork/SmartContracts` | Public Rust/Soroban (`soroban-sdk = "22.0.0"`) |

Pi’s own blog is explicit about the stage:

> “Pi Network is launching its **first smart contract capability on Pi Testnet: subscription support**!”
> “It also gives the ecosystem a way to **evaluate the contract before rollout to the Mainnet**.”

So the honest framing is: **Pi is adding a Soroban (Stellar protocol 22) smart-contract layer.** That is a
real change — and it **does not** touch the question of per-unit origin.

---

## 2. What the token interface can actually see (from the official code)

The reference implementation uses `soroban_sdk::token::TokenClient` — the **standard Stellar token
interface**. Every method it calls deals in **scalar amounts**:

```rust
// PiNetwork/SmartContracts — contracts/subscription/src/lib.rs
use soroban_sdk::{ token::TokenClient, Address, ... };

let token_client = TokenClient::new(env, &token);   // a token contract address

token_client.approve(subscriber, &contract_addr, &approve_amount, &expiration_ledger);
token_client.transfer(&subscriber, &service.merchant, &service.price);
token_client.try_transfer_from(&contract_addr, &sub.subscriber, &merchant, &sub.price);
let balance   = token_client.balance(&subscriber);               // one number
let allowance = token_client.allowance(&subscriber, &contract_addr); // one number
```

`approve_amount`, `price`, `balance`, `allowance` are all **`i128` — single numbers**. There is **no array of
units, no `txid` per coin, and no origin field** anywhere in the interface.

---

## 3. The contract’s own data model has no origin either

The whole stored state of the subscription contract is services and subscriptions
([`SOURCES.md`](SOURCES.md) §21):

| Struct | Fields | Origin field? |
|---|---|---|
| `Service` | `service_id`, `merchant`, `name`, `price: i128`, `period_secs`, `trial_period_secs`, `approve_periods`, `is_active`, `created_at` | ❌ |
| `Subscription` | `sub_id`, `subscriber`, `service_id`, `price: i128`, `period_secs`, `auto_renew`, `service_end_ts`, `next_charge_ts`, `created_at` | ❌ |
| `ProcessResult` | `charged`, `failed`, `skipped`, `total` (counts) | ❌ |
| Event `charge` | `(subscriber, service_id, price)` | ❌ |

Not one field describes *where a unit came from*.

---

## 4. “But a contract **could** implement its own taint/origin ledger!”

Correct — and it would prove our point, not break it. Consider a third-party contract that tries to track
“mined vs bought”:

- It can only see **what is deposited into it** — an **account-level** deposit/withdraw graph — never the
  per-unit origin of native π (there is nothing to read).
- It must **define its own rules** and **trust its own inputs**; it becomes a **policy overlay** with its own
  assumptions, not a property of the protocol.
- If it issues a receipt/representative token, that token is a **different asset** (with its own issuer/
  contract) — exactly the “different asset” case we already separate out.

So a taint service is possible — as a **third-party accounting layer**. It is **not** per-unit provenance on
native π, and it cannot see the protocol’s “origin” because **none exists**. (See
[`THREAT-MODEL.md`](THREAT-MODEL.md) §5.2 and §5.9.)

---

## 5. Ecosystem tokens (PiRC1 / Pi Launchpad) are **separate assets**

PiRC1’s launchpad lets projects launch **new tokens**. Pi is used as the **staked / liquidity asset**, and
holders can do **“Pi ↔ token swaps”**. Two things follow:

- **Native π** here is still the same **native, fungible** asset — staked, pooled, swapped by **scalar
  amounts**.
- The **launched tokens are different assets** (each with its own issuer/contract and rules). That is the
  long-standing “not native π” distinction — always check **`asset_type` / `asset_code` / issuer / contract
  id**.

Note the one place “mined” appears (PiRC1 §3, baseline *PiPower*): it refers to an **account with a lockup of
≥90% of its mined tokens**. That is an **account-level lockup state** (a `claimable_balance`-style state with a
time predicate) — a difference of **state**, not a per-unit **origin**, and it is **not** carried by payments.
See [`FAQ-ALL-OBJECTIONS.md`](FAQ-ALL-OBJECTIONS.md) Group C (C1, C2).

---

## 6. Honest status (RFC / Testnet)

- PiRC1 and PiRC2 are **Requests for Comment** — proposals under public review, subject to change.
- The subscription contract launched on **Testnet** as the **first** smart-contract capability; **Mainnet
  rollout was still pending** at publication, and the contract is **under external review**.
- **No** official document, contract, or API in any of this defines a **per-unit origin** for **native π**.

---

## 7. What this does **not** change

- Native π is still **one native asset** with **no issuer** and **no per-unit origin**
  ([`FAQ-MICRO-PI-ID.md`](FAQ-MICRO-PI-ID.md), [`PROOF.md`](../PROOF.md)).
- A **different asset** (token / contract token / wrapped) can carry different rules — and that was **never
  claimed** to be native π ([`SCOPE.md`](SCOPE.md)).
- We still make **no** claim about price, identity-hiding, reserves, or an independent audit
  ([`SCOPE.md`](SCOPE.md) · [`AUDIT-REQUEST.md`](AUDIT-REQUEST.md)).

---

## 8. Master rule

> A smart contract can hold **state** and define **rules for its own token**. What it **cannot** do is read or
> write **where a native π unit came from** — because, in an Account/Balance model, **that is not a property
> that exists.**

---

## Sources
- [`SOURCES.md`](SOURCES.md) **§19** (PiRC) · **§20** (PiRC1 Launchpad) · **§21** (PiRC2 + reference impl) ·
  **§22** (Soroban platform)
- Official: `github.com/PiNetwork/PiRC` · `github.com/PiNetwork/SmartContracts` ·
  `minepi.com/blog/subscriptions-smart-contract`
- Related: [`FAQ-MICRO-PI-ID.md`](FAQ-MICRO-PI-ID.md) · [`FAQ-ALL-OBJECTIONS.md`](FAQ-ALL-OBJECTIONS.md) (Group C) ·
  [`THREAT-MODEL.md`](THREAT-MODEL.md) §5 · [`PROOF.md`](../PROOF.md)
