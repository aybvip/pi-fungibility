# π = π — Is Pi on exchanges the same as mined Pi?

> A **source-verified** technical analysis of **fungibility** in the **Pi Network** blockchain:
> why an **app owner** — even with the **Pi Wallet SDK** and **Platform API** — **cannot distinguish**
> between mined π, π withdrawn from an exchange (OKX / Bitget), and π sent from inside a Pi Browser app.

[![Independent](https://img.shields.io/badge/Independent-unofficial-orange)](DISCLAIMER.md)
[![Not affiliated with Pi Network](https://img.shields.io/badge/not%20affiliated-Pi%20Network-critical)](DISCLAIMER.md)
[![Pi Docs](https://img.shields.io/badge/Source-docs.minepi.com-6f42c1)](https://docs.minepi.com/)
[![Pi Developer Guide](https://img.shields.io/badge/Source-pi--apps.github.io-2ea44f)](https://pi-apps.github.io/community-developer-guide/)
[![Platform API](https://img.shields.io/badge/Source-platform__API-0969da)](https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md)
[![MiCA Whitepaper](https://img.shields.io/badge/Source-MiCA%20Whitepaper-ff69b4)](https://minepi.com/wp-content/uploads/2025/11/MiCA-Whitepaper-Pi-1.pdf)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)
[![self-test](https://github.com/aybvip/pi-fungibility/actions/workflows/self-test.yml/badge.svg)](https://github.com/aybvip/pi-fungibility/actions/workflows/self-test.yml)
[![Audit: not independently audited](https://img.shields.io/badge/audit-not%20independently%20audited-red)](docs/AUDIT-REQUEST.md)

🌍 **English** · [العربية](README.ar.md)

> 🏷️ **Independent & unofficial — not affiliated with Pi Network.** This is an independent technical
> analysis, not an official product. See [`DISCLAIMER.md`](DISCLAIMER.md).
>
> 🔐 **Safe by design (read-only).** **No** wallet connection, **no** passphrase, **no** keys, **no** signing,
> **no** dependencies. Audit it — see [`SECURITY.md`](SECURITY.md). Details:
> [`docs/FAQ-UNOFFICIAL-REPO-SCAM.md`](docs/FAQ-UNOFFICIAL-REPO-SCAM.md).

🗂️ **Full index of every file (by file and by question):** [`docs/INDEX.md`](docs/INDEX.md)

---

## 🎯 TL;DR

On-chain, **every π is identical**. The native asset has **no issuer and no contract**, and the ledger records
**balances — not “coins” tagged with an origin**. Therefore:

```
mined π = π from OKX/Bitget = π from inside a Pi Browser app
```

There is **no field** called “origin”, “mining”, or “exchange” — not on-chain, not in the SDK, and not in the
Platform API. All an app sees is: **amount + sender address + recipient address + memo + txid**.

The official MiCA whitepaper says it plainly: Pi is the **“native, fungible digital asset”** and belongs to a
**“Functionally Fungible Group”**.

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

Full quotes and citations: [`docs/SOURCES.md`](docs/SOURCES.md).

---

## 🧩 The three-layer proof

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

---

## 🛡️ Counterarguments (fully answered)

Every objection reduces to one of four things — **counterparty identity, asset type, balance state, or off-chain
data** — never **coin provenance**.

| Objection | Answer | Details |
|---|---|---|
| “Exchanges use **M** addresses, not **G**” | `M` = a **muxed account** (`G` + ID, CAP-27); identifies the **counterparty**, not the coin. Muxed accounts don’t exist on the ledger, and the network processes them *exactly as if muxing weren’t used*. | [`docs/FAQ-MUXED-M-VS-G.md`](docs/FAQ-MUXED-M-VS-G.md) |
| “Every **micro-π** has its own ID” | Pi uses an **Account/Balance** model (one number), **not UTXO**. `1 π = 10,000,000 micro-π` is just decimal precision, not an ID. | [`docs/FAQ-MICRO-PI-ID.md`](docs/FAQ-MICRO-PI-ID.md) |
| “The **MiCA whitepaper** says Pi comes only from mining” | The same paper says Pi is **native, fungible**, in a **Functionally Fungible Group**, **immutable even by the issuer**, with **no transfer restrictions**, and that exchanges are the **secondary market**. | [`docs/MICA-WHITEPAPER.md`](docs/MICA-WHITEPAPER.md) |
| “Pi once said **‘don’t buy Pi’**” | That was **Enclosed Mainnet** policy (until **Feb 20, 2025**). Open Network **removed the firewall** and enabled **CEX integration** — Pi’s own blog says so. | [`docs/FAQ-DONT-BUY-PI.md`](docs/FAQ-DONT-BUY-PI.md) |
| “Same coin, but **not the same price**” | **Fungibility ≠ price.** The same asset trades at different prices across venues (Bitcoin’s “Kimchi premium”, even the US dollar). Only an **IOU vs native** difference is real. | [`docs/FAQ-FUNGIBILITY-VS-PRICE.md`](docs/FAQ-FUNGIBILITY-VS-PRICE.md) |
| **“I bought π on an exchange, put it in the same wallet as my mined π, then sent some to a friend — can they tell?”** | **No — and it is deterministic, not a loophole.** The ledger has no per-unit identity, so per-coin origin is **not an observable**. Includes the honest account-level-vs-unit-level distinction. | [`docs/FAQ-RECIPIENT-CANNOT-TELL.md`](docs/FAQ-RECIPIENT-CANNOT-TELL.md) |
| **“Can the Core Team set a different price for mined vs exchange Pi, or stop you selling?”** | **No — not on-chain.** No origin to target, no price field, no issuer controls. Their power is off-chain/app-level only. | [`docs/FAQ-CAN-CORE-TEAM-SET-PRICE.md`](docs/FAQ-CAN-CORE-TEAM-SET-PRICE.md) |
| **“Fungibility is one thing — but is an exchange’s balance really backed?”** | **Three separate claims:** A fungibility (**proven**), B a specific deposit is on-chain (**verifiable**), C reserve backing (**not claimed**). | [`docs/FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](docs/FAQ-EXCHANGE-DEPOSIT-VERIFY.md) |
| **“Has this proof been independently audited?”** | **No** — it is **self-verified and reproducible**, which is *not* the same as a third-party audit. Status, scope, and how to do one. | [`docs/AUDIT-REQUEST.md`](docs/AUDIT-REQUEST.md) |
| **“It’s just an unofficial GitHub repo — must be a scam/phishing.”** | **Audit, don’t trust.** This repo is read-only: no wallet, no passphrase, no keys, no signing, no deps. And “Pi not listed / network closed” is outdated (Open Network 2025-02-20). | [`docs/FAQ-UNOFFICIAL-REPO-SCAM.md`](docs/FAQ-UNOFFICIAL-REPO-SCAM.md) · [`SECURITY.md`](SECURITY.md) |
| **All other objections** (labeling, chain analysis, lockups, KYC, core-team data, governance…) | Catalogued with a refutation each. | [`docs/FAQ-ALL-OBJECTIONS.md`](docs/FAQ-ALL-OBJECTIONS.md) |

---

## 🧪 Code (runnable)

| File | Description |
|---|---|
| [`examples/provenance-check.mjs`](examples/provenance-check.mjs) | **Zero-dependency** script that queries the live chain and shows what an app **can / cannot** know about a coin |
| [`examples/coin-id-check.mjs`](examples/coin-id-check.mjs) | Proves the balance is a **single number** — there is **no per-micro-π ID** |
| [`examples/mixing-check.mjs`](examples/mixing-check.mjs) | Live proof for the exact **“mined + bought, then send”** scenario: commingling → scalar balance → origin-less payment |
| [`examples/verify-deposit.mjs`](examples/verify-deposit.mjs) | Verifies a **specific** transfer is a real **native Pi payment on Mainnet** (Claim B); states what the ledger cannot prove (Claim C) |
| [`examples/self-test.mjs`](examples/self-test.mjs) | Automated check: correct recipient → **VERIFIED**, wrong recipient → **NOT VERIFIED** (proves the per-operation fix) |
| [`examples/app-payment-flow/frontend.html`](examples/app-payment-flow/frontend.html) | Official `Pi.createPayment` flow (U2A) |
| [`examples/app-payment-flow/server.js`](examples/app-payment-flow/server.js) | Backend handling `PaymentDTO` + printing its keys |
| [`examples/payment-dto-sample.json`](examples/payment-dto-sample.json) | Sample `PaymentDTO` showing the missing origin field |
| [`PROOF.md`](PROOF.md) | The step-by-step proof |

**Run it:**
```bash
node examples/provenance-check.mjs
node examples/coin-id-check.mjs
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
> and **C** (reserve backing — *not* claimed): [`docs/SCOPE.md`](docs/SCOPE.md) ·
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

## License
MIT
