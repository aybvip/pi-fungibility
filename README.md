# π = π — Is Pi on exchanges the same as mined Pi?

> A **source-verified** technical analysis of **fungibility** in the **Pi Network** blockchain:
> why an **app owner** — even with the **Pi Wallet SDK**, the **Platform API**, and **Soroban smart
> contracts** — **cannot distinguish**
> between mined π, π withdrawn from an exchange (OKX / Bitget), and π sent from inside a Pi Browser app.

[![Independent](https://img.shields.io/badge/Independent-unofficial-orange)](https://github.com/aybvip/pi-fungibility/blob/main/DISCLAIMER.md)
[![Not affiliated with Pi Network](https://img.shields.io/badge/not%20affiliated-Pi%20Network-critical)](https://github.com/aybvip/pi-fungibility/blob/main/DISCLAIMER.md)
[![Pi Docs](https://img.shields.io/badge/Source-docs.minepi.com-6f42c1)](https://docs.minepi.com/)
[![Pi Developer Guide](https://img.shields.io/badge/Source-pi--apps.github.io-2ea44f)](https://pi-apps.github.io/community-developer-guide/)
[![Platform API](https://img.shields.io/badge/Source-platform__API-0969da)](https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md)
[![MiCA Whitepaper](https://img.shields.io/badge/Source-MiCA%20Whitepaper-ff69b4)](https://minepi.com/wp-content/uploads/2025/11/MiCA-Whitepaper-Pi-1.pdf)
[![PiRC (official)](https://img.shields.io/badge/Source-PiRC%20RFcs-blueviolet)](https://github.com/PiNetwork/PiRC)
[![Smart Contracts (official)](https://img.shields.io/badge/Source-SmartContracts-2ea44f)](https://github.com/PiNetwork/SmartContracts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)
[![self-test](https://github.com/aybvip/pi-fungibility/actions/workflows/self-test.yml/badge.svg)](https://github.com/aybvip/pi-fungibility/actions/workflows/self-test.yml)
[![Audit: not independently audited](https://img.shields.io/badge/audit-not%20independently%20audited-red)](https://github.com/aybvip/pi-fungibility/blob/main/docs/AUDIT-REQUEST.md)

> 🏷️ **Independent & unofficial — not affiliated with Pi Network.** This is an independent technical
> analysis, not an official product. See [`DISCLAIMER.md`](DISCLAIMER.md).
>
> 🔐 **Safe by design (read-only).** **No** wallet connection, **no** passphrase, **no** keys, **no** signing,
> **no** dependencies. Audit it — see [`SECURITY.md`](SECURITY.md). Details:
> [`docs/FAQ-UNOFFICIAL-REPO-SCAM.md`](docs/FAQ-UNOFFICIAL-REPO-SCAM.md).

🗂️ **Full index of every file (by file and by question):** [`docs/INDEX.md`](docs/INDEX.md)

🌐 **Website:** <https://aybvip.github.io/pi-fungibility/> · 📄 **Machine-readable index for AI tools:**
[`llms.txt`](llms.txt) · 📌 **Cite this work:** [`CITATION.cff`](CITATION.cff)

> GitHub Pages is the **canonical** host. Every rendered page emits a `rel="canonical"`
> tag pointing here, so optional mirrors (Netlify / Cloudflare Pages) add reach and
> redundancy **without** splitting search ranking — see [`docs/DEPLOY-MIRRORS.md`](docs/DEPLOY-MIRRORS.md).

---

## 🎯 TL;DR

On-chain, **every π is identical**. The native asset has **no issuer and no contract**, and the ledger records
**balances — not “coins” tagged with an origin**. Therefore:

```
mined π = π from OKX/Bitget = π from inside a Pi Browser app
```

There is **no field** called “origin”, “mining”, or “exchange” — not on-chain, not in the SDK, not in the
Platform API, and not in the Soroban smart-contract layer. All an app sees is: **amount + sender address +
recipient address + memo + txid** — and the memo is **optional** (on recent Pi Mainnet traffic the large
majority of transactions carry none at all).

The official MiCA whitepaper says it plainly: Pi is the **“native, fungible digital asset”** and belongs to a
**“Functionally Fungible Group”**.

---

## 🔎 Transaction vs. coin — the distinction that decides the argument

You **can** trace **transactions**. You **cannot** trace **coins**.

| Level | Unit of information | Traceable? | What you get |
|---|---|---|---|
| **1 — Transaction / operation** | `txid` · `ledger` | ✅ fully public | who sent, to whom, how much, when, the memo |
| **2 — Account** | `G…` / `M…` | ✅ as a graph | you can label addresses and measure flows between them |
| **3 — Coin / unit** (micro-π) | — | ❌ **does not exist** | ❌ “this π was mined” / “this π came from OKX” |

A worked example — following the *money* is not following the *coins*:

| Event | What the ledger shows |
|---|---|
| You deposit 100 π to an exchange | `payment 100 native → <venue G…>` — ✅ visible |
| You withdraw 100 π weeks later | `payment 100 native → <your G…>` — ✅ visible |
| *“the 100 π I withdrew are the 100 π I deposited”* | ❌ **not provable** — the venue pools its funds, and the unit has no identity |

> This is not *“we don’t know”*. It is *“there is no such property”*. Receiving π **merges** the amount into a
> single scalar balance, so the map **history → state is non-injective** — the per-unit information is *destroyed*,
> not *concealed* (`examples/model-check.mjs`, 2 000 seeds; `examples/exhaustive-check.mjs`, all 1 452 histories).

**The honest boundary:** the absence of per-unit origin does **not** hide that you ever used an exchange **at the
account level**. If a venue’s address is publicly labeled, address-level analysis can link **accounts** — never
**coins**. Anything said about *“where your money came from”* is an **inference about an account**, not a **fact
about a coin**.

Full treatment: [`docs/FAQ-TRANSACTION-VS-COIN.md`](docs/FAQ-TRANSACTION-VS-COIN.md).

---

## ✅ Verification status

**Last verified: 2026-10-18** — `node examples/run-all.mjs` → **all checks passed** (exit code `0`), on Node 24
locally and Node 20/22 in CI. The self-test file alone runs **29 checks: 29 passed, 0 failed** (26 offline, 3 online).

- **Live Mainnet reads** (read-only `GET`s against `api.mainnet.minepi.com`) run **locally and in CI** on every
  push. They are reachability-dependent, so a red build can simply mean the API was unreachable.
- **Offline layers** (validators, `evaluate()` rules, transport-failure handling, the ledger model) are
  deterministic and cannot be flaky — they are what actually holds the claims up.
- **Not verified:** no independent audit, no reserve-backing claim, nothing about price.

Full breakdown — what ran, where, what it proves, and what it cannot: [`docs/VERIFICATION.md`](docs/VERIFICATION.md).
Exact revision of every official source (including a SHA-256 of the MiCA PDF): [`docs/SOURCES.md`](docs/SOURCES.md) §0.

---

## 📚 Official sources (verified)

Everything in this repo is grounded in Pi Network’s official documentation:

| Source | Link | Used for |
|---|---|---|
| Pi Docs (official, 2026) | https://docs.minepi.com/ | Wallet SDK / Payments / Tokens |
| Pi Wallet & SDK | https://docs.minepi.com/use-native-features/Wallet | `window.Pi.Wallet` + pre-signed transactions |
| Accept a payment | https://docs.minepi.com/accept-payment/Payments | `Pi.createPayment` + allowed fields |
| Advanced Payments (A2U) | https://docs.minepi.com/accept-payment/PaymentsAdvanced | “the blockchain is the only source of truth” |
| Tokens (Stellar SDK) | https://docs.minepi.com/use-native-features/Tokens | Pi is Stellar-based; native has no issuer |
| Platform API | https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md | Full `PaymentDTO` definition |
| Community Dev Guide | https://pi-apps.github.io/community-developer-guide/ | Overview |
| Pi SDK JS (GitHub) | https://github.com/pi-apps/pi-sdk-js | `createPayment` interface |
| MiCA Whitepaper (PDF) | https://minepi.com/wp-content/uploads/2025/11/MiCA-Whitepaper-Pi-1.pdf | “native, fungible”, “Functionally Fungible Group” |
| Stellar — Accounts | https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts | Account/Balance model |
| Stellar — Muxed accounts | https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos | CAP-27 `M...` addresses |
| PiRC — Pi Requests for Comment | https://github.com/PiNetwork/PiRC | Ecosystem-token design (PiRC1) + subscription contract (PiRC2) |
| Smart Contracts (reference impl) | https://github.com/PiNetwork/SmartContracts | Soroban token interface = scalar amounts |
| Pi blog — Subscription contract | https://minepi.com/blog/subscriptions-smart-contract | First smart contract, on Testnet (2026-04-17) |

Full quotes and citations: [`docs/SOURCES.md`](docs/SOURCES.md).

---

## 🧩 The proof (four layers)

### Layer 1 — The blockchain: a native asset with no identity (no issuer, no provenance)
- Pi uses the **Stellar protocol** (same `Horizon` API, same `@stellar/stellar-sdk`, same `networkPassphrase`).
- On Stellar, the **native** asset has **no `asset_issuer`**.
- Any other asset (a token) shows an `asset_code` + `asset_issuer` and needs a **trustline**.
- → There is **no way** on-chain to determine where a π “came from”.

**Direct test:**
```json
// GET https://api.mainnet.minepi.com/accounts/<G_ADDRESS>
{ "balance": "2.0000000", "asset_type": "native" }   // no issuer, no origin
```

### Layer 2 — Pi Wallet SDK: `createPayment` has no “origin”
```js
// Official Pi docs
Pi.createPayment(
  { amount: 1, memo: 'Unlock Premium', metadata: { feature: 'premium' } },
  { onReadyForServerApproval, onReadyForServerCompletion, onCancel, onError }
);
```
Allowed fields: **amount / memo / metadata only**. And the Wallet docs are explicit:
*“Transactions must be pre-signed; the SDK does not build or sign transactions for you.”* — i.e. a plain Stellar
`payment` of the native asset, with no tag describing the coin’s origin.

### Layer 3 — Platform API: `PaymentDTO` has no “origin” field
The full official response of `GET /v2/payments/{payment_id}`:
```ts
{
  identifier, user_uid, amount, memo, metadata,
  from_address, to_address, direction, created_at, network,
  status: { developer_approved, transaction_verified, developer_completed, cancelled, user_cancelled },
  transaction: { txid, verified, _link } | null
}
```
👉 **Not a single field** describes where the π came from. Even `from_address` tells you **who** sent it — not
**where the coin came from**.

### Layer 4 — Smart contracts (Soroban): still scalars, never origin
Pi’s new **Soroban** smart-contract capability (PiRC1/PiRC2, on **Testnet**) gives a contract only the
**Stellar token interface**:
```rust
token.approve(subscriber, spender, &amount, &expiration_ledger);
token.transfer(&from, &to, &amount);
token.transfer_from(&spender, &from, &to, &amount);
let balance   = token.balance(&account);       // one i128 number
let allowance = token.allowance(&from, &spender); // one i128 number
```
Every value is a **scalar `i128`** — no array of units, no per-coin `txid`, no origin. A contract may define
rules for **its own token** (a **different asset**), but it cannot read or write **native π’s** per-unit
origin. → [`docs/FAQ-SMART-CONTRACTS-AND-TOKENS.md`](docs/FAQ-SMART-CONTRACTS-AND-TOKENS.md)

---

## 🛡️ Counterarguments (fully answered)

Every objection reduces to one of four things — **counterparty identity, asset type, balance state, or off-chain
data** — never **coin provenance**.

| Objection | Answer | Details |
|---|---|---|
| **“You can follow the transactions — so you *can* tell where the π came from”** | **You can trace the *transaction*, never the *coin*.** Transactions and accounts are fully traceable; the individual unit is not stored at all. Receiving π merges the amount into one scalar balance, so per-unit origin is not *hidden* — it *does not exist*. | [`docs/FAQ-TRANSACTION-VS-COIN.md`](docs/FAQ-TRANSACTION-VS-COIN.md) |
| “Exchanges use **M** addresses, not **G**” | `M` = a **muxed account** (`G` + ID, CAP-27); identifies the **counterparty**, not the coin. The `M` is a `G` account plus a 64-bit id — the `G` account is what exists on the ledger — and the network processes the payment *exactly as if muxing weren’t used*. | [`docs/FAQ-MUXED-M-VS-G.md`](docs/FAQ-MUXED-M-VS-G.md) |
| “Every **micro-π** has its own ID” | Pi uses an **Account/Balance** model (one number), **not UTXO**. `1 π = 10,000,000 micro-π` is just decimal precision, not an ID. | [`docs/FAQ-MICRO-PI-ID.md`](docs/FAQ-MICRO-PI-ID.md) |
| **“Doesn’t the SDK / Platform API expose where the π came from?”** | **No.** Pi’s own docs enumerate the **entire** SDK/API surface — `amount`, `memo`, `metadata`, `from_address`, `to_address`, `status`, `txid`… Not one field carries per-unit origin. | [`docs/FAQ-SDK-PLATFORM-API-FIELDS.md`](docs/FAQ-SDK-PLATFORM-API-FIELDS.md) |
| **“Pi now has Soroban smart contracts and ecosystem tokens — can’t you tag a coin’s origin now?”** | **No.** The contract-facing token interface exposes only **scalars** (`balance`, `allowance`, `transfer`, `transfer_from`, `approve`). A contract can hold state and define rules for **its own token** — a **different asset** — but it cannot read/write **native π’s** per-unit origin, because none exists. | [`docs/FAQ-SMART-CONTRACTS-AND-TOKENS.md`](docs/FAQ-SMART-CONTRACTS-AND-TOKENS.md) |
| “The **MiCA whitepaper** says Pi comes only from mining” | The same paper says Pi is **native, fungible**, in a **Functionally Fungible Group**, **immutable even by the issuer**, with **no transfer restrictions**, and that exchanges are the **secondary market**. | [`docs/MICA-WHITEPAPER.md`](docs/MICA-WHITEPAPER.md) |
| “Pi once said **‘don’t buy Pi’**” | That was **Enclosed Mainnet** policy (until **Feb 20, 2025**). Open Network **removed the firewall** and enabled **CEX integration** — Pi’s own blog says so. | [`docs/FAQ-DONT-BUY-PI.md`](docs/FAQ-DONT-BUY-PI.md) |
| “Same coin, but **not the same price**” | **Fungibility ≠ price.** The same asset trades at different prices across venues (Bitcoin’s “Kimchi premium”, even the US dollar). Only an **IOU vs native** difference is real. | [`docs/FAQ-FUNGIBILITY-VS-PRICE.md`](docs/FAQ-FUNGIBILITY-VS-PRICE.md) |
| **“I bought π on an exchange, put it in the same wallet as my mined π, then sent some to a friend — can they tell?”** | **No — and it is deterministic, not a loophole.** The ledger has no per-unit identity, so per-coin origin is **not an observable**. Includes the honest account-level-vs-unit-level distinction. | [`docs/FAQ-RECIPIENT-CANNOT-TELL.md`](docs/FAQ-RECIPIENT-CANNOT-TELL.md) |
| **“Can the Core Team set a different price for mined vs exchange Pi, or stop you selling?”** | **No — not on-chain.** No origin to target, no price field, no issuer controls. Their power is off-chain/app-level only. | [`docs/FAQ-CAN-CORE-TEAM-SET-PRICE.md`](docs/FAQ-CAN-CORE-TEAM-SET-PRICE.md) |
| **“Fungibility is one thing — but is an exchange’s balance really backed?”** | **Three separate claims:** A fungibility (**proven**), B a specific deposit is on-chain (**verifiable**), C reserve backing (**not claimed**). | [`docs/FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](docs/FAQ-EXCHANGE-DEPOSIT-VERIFY.md) |
| **“Has this proof been independently audited?”** | **No** — it is **self-verified and reproducible**, which is *not* the same as a third-party audit. Status, scope, and how to do one. | [`docs/AUDIT-REQUEST.md`](docs/AUDIT-REQUEST.md) |
| **“It’s just an unofficial GitHub repo — must be a scam/phishing.”** | **Audit, don’t trust.** This repo is read-only: no wallet, no passphrase, no keys, no signing, no deps. And “Pi not listed / network closed” is outdated (Open Network 2025-02-20). | [`docs/FAQ-UNOFFICIAL-REPO-SCAM.md`](docs/FAQ-UNOFFICIAL-REPO-SCAM.md) · [`SECURITY.md`](SECURITY.md) |
| **“If *tainted* π touches my wallet, doesn’t the taint spread through everything I own?”** | **No — there is no taint field for it to spread through.** Contagion needs a *marked object* and a *propagation rule*; the ledger state is a scalar balance and supplies neither. And it is a hard dichotomy: if taint is **non-transitive** it cannot be allocated to any unit; if **transitive** it reaches every π and therefore distinguishes nothing. | [`docs/FAQ-TAINT-CONTAGION.md`](docs/FAQ-TAINT-CONTAGION.md) |
| **All other objections** (labeling, chain analysis, lockups, KYC, core-team data, governance…) | Catalogued with a refutation each. | [`docs/FAQ-ALL-OBJECTIONS.md`](docs/FAQ-ALL-OBJECTIONS.md) |

---

## 🧪 Code (runnable)

| File | Description |
|---|---|
| [`examples/provenance-check.mjs`](examples/provenance-check.mjs) | **Zero-dependency** script that queries the live chain and shows what an app **can / cannot** know about a coin |
| [`examples/memo-check.mjs`](examples/memo-check.mjs) | Samples **200 real Mainnet transactions** and shows the large majority carry **no memo at all** (`memo_type: "none"`) — so `memo` is optional, sender-written text, not a provenance channel |
| [`examples/coin-id-check.mjs`](examples/coin-id-check.mjs) | Proves the balance is a **single number** — there is **no per-micro-π ID** |
| [`examples/mixing-check.mjs`](examples/mixing-check.mjs) | Live proof for the exact **“mined + bought, then send”** scenario: commingling → scalar balance → origin-less payment |
| [`examples/verify-deposit.mjs`](examples/verify-deposit.mjs) | Verifies a **specific** transfer is a real **native Pi payment on Mainnet** (Claim B); states what the ledger cannot prove (Claim C) |
| [`examples/self-test.mjs`](examples/self-test.mjs) | Automated checks: **offline** unit tests (same-op rule, failed-tx gate) + **offline** transport-failure handling (HTTP 500/429, invalid JSON, connection failure, timeout) + **online** end-to-end (correct → VERIFIED, wrong → NOT VERIFIED). 29 checks |
| [`examples/model-check.mjs`](examples/model-check.mjs) | **Executable model** + property check (2000 seeds, offline): state is one scalar, `history → state` non-injective, recipient view independent of origin |
| [`examples/exhaustive-check.mjs`](examples/exhaustive-check.mjs) | **Exhaustive bounded check** (offline, no randomness): enumerates **all 1452** histories in a finite domain; origin-invisibility holds for every one |
| [`examples/run-all.mjs`](examples/run-all.mjs) | **One command** runs every check and prints a summary (`--offline` to skip network) |
| [`examples/lib.mjs`](examples/lib.mjs) | Shared helpers: robust API client (shows HTTP status + body on error) and strkey input validation |
| [`examples/app-payment-flow/frontend.html`](examples/app-payment-flow/frontend.html) | Official `Pi.createPayment` flow (U2A) |
| [`examples/app-payment-flow/server.js`](examples/app-payment-flow/server.js) | Backend handling `PaymentDTO` + printing its keys |
| [`examples/payment-dto-sample.json`](examples/payment-dto-sample.json) | Sample `PaymentDTO` showing the missing origin field |
| [`PROOF.md`](PROOF.md) | The step-by-step proof |

**Run it:**
```bash
node examples/provenance-check.mjs
node examples/coin-id-check.mjs
node examples/memo-check.mjs
# or against a specific transaction:
node examples/provenance-check.mjs <TXID>
```

---

## ⚖️ Limits and real distinctions (for accuracy)

| Case | The real difference |
|---|---|
| **Lockup / claimable balance** | Shows as `claimable_balance` (with a time predicate) ≠ `native`. A difference of **state**, not of asset. |
| **Unmigrated mining balance** | Not on-chain at all (in-app balance) → before vs after. |
| **Exchange IOU / token** | May **not** be real native π. This is the only distinction that matters in practice. |
| **Other tokens** | Show `asset_code` + `asset_issuer` and require a trustline. |

> Bottom line: the single native asset is **fully fungible**. Any real distinction is about **state**
> (locked / liquid / off-chain) or **asset type** (native vs token/IOU) — never mining history.

---

## 🧭 Scope — what this repo proves (and what it does not)

**Proven ✅**
- Pi is a **native, fungible** asset with **no per-unit identity** → per-coin origin is **not an observable**.
- An app / exchange / recipient **cannot distinguish** mined π from exchange-bought π from the
  **ledger / SDK / Platform-API** data.
- The distinction is **undefined** (information-theoretic), not merely *hidden*.

**Not claimed ❌**
- Nothing about **price** or future value (fungibility ≠ price — see [`docs/FAQ-FUNGIBILITY-VS-PRICE.md`](docs/FAQ-FUNGIBILITY-VS-PRICE.md)).
- It does **not** claim you can hide that you *ever* used an exchange **at the account level**: if an exchange
  address is publicly labeled, transaction-graph analysis may link **accounts** — never **coins**.
- No independent audit is claimed; instead, **everything is verifiable** by running the code and reading the
  official sources. Status, scope, and how to audit: [`docs/AUDIT-REQUEST.md`](docs/AUDIT-REQUEST.md).

> Precise claim: **“A native Pi payment carries no observable per-unit mining origin on the Pi Mainnet ledger.”**
> No more, no less. Distinguishing **A** (fungibility, proven) from **B** (a specific deposit — verifiable)
> Precision package: assumptions & adversary capabilities in [`docs/THREAT-MODEL.md`](docs/THREAT-MODEL.md);
> the three claims in [`docs/SCOPE.md`](docs/SCOPE.md) ·
> [`docs/FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](docs/FAQ-EXCHANGE-DEPOSIT-VERIFY.md).

---

## 🧠 Practical conclusions

1. **One price basis** — there is no price difference by origin.
2. **No segregation / no taint** — impossible on-chain.
3. **Security** — an incoming π payment merges into the balance instantly; trust the **address + memo**, not a
   “coin type”.
4. **Always verify on-chain** — a number in an app/exchange is not necessarily native π on the ledger.
5. **Anti-scam** — anyone claiming a “special / original mined / graded” Pi is lying; and any “buy/lock Pi”
   scheme that doesn’t appear on-chain as a `claimable_balance` is a scam.

---

## Contributing

Found a flaw? That is the most valuable contribution. See [`CONTRIBUTING.md`](CONTRIBUTING.md) and the
audit status [`docs/AUDIT-REQUEST.md`](docs/AUDIT-REQUEST.md) (this repo is **not** independently audited yet).

## Citing

If you reference this work, please cite it — see [`CITATION.cff`](CITATION.cff) — or simply link the repository:
<https://github.com/aybvip/pi-fungibility>. A machine-readable index for AI tools is in [`llms.txt`](llms.txt);
the website is <https://aybvip.github.io/pi-fungibility/>.

## License
MIT
