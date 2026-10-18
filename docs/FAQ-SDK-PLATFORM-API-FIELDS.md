---
layout: faq
faq_question: "Does the Pi Wallet SDK or the Platform API expose where the π came from?"
faq_answer: "No. The official surfaces are fully enumerated and no field carries per-unit origin. The SDK builds a native-asset payment with amount, destination and a sender-written memo. The U2A createPayment call takes only amount, memo and metadata. The Platform API PaymentDTO returns identifier, user_uid, amount, memo, metadata, from_address, to_address, direction, created_at, network, status and transaction.txid - each of which identifies a counterparty, an asset type, a state, or sender-written data."
---
# FAQ — “The SDK or Platform API must expose where the π came from — otherwise how does the app know?”

> Objection: *“The Pi Wallet SDK and the Platform API know everything about a payment. Somewhere in those
> fields there must be the coin’s origin (mined? exchange?). An app should be able to read it.”*
>
> Short answer: **No.** The SDK/API surface is **fully enumerated** by Pi’s own documentation, and **not one
> field** carries per-unit origin. Every field identifies the **counterparty**, the **asset type**, the
> **state/status**, or is **sender-written data** — never *where the unit came from*.

This is the same conclusion as [`FAQ-MICRO-PI-ID.md`](FAQ-MICRO-PI-ID.md) and
[`PROOF.md`](../PROOF.md), but approached from the **application layer** (SDK + Platform API) instead of the
ledger.

---

## 1. The complete A2U payment, straight from the official SDK integration guide

The official **Pi SDK Integration Guide** (repo `pi-apps/pi-sdk-integration-guide`) describes exactly what an
A2U payment is and how it is built. Verbatim:

> “The Pi blockchain is obviously the **source of truth** for exchanging Pi. The Pi backend is used to improve
> the end-user experience (e.g. provide users understandable memos on their wallet, and link backs to your
> app, **while preserving user and developer privacy by not making this information public on the chain**)…”

> “Your Pi SDK implementation needs to both be able to **sign and submit blockchain transactions using the
> Stellar SDK** and send additional API calls to the Pi backend using standard https libraries.”

When the guide builds the actual transaction, these are the only two lines that decide what the payment
*carries*:

```js
// Official SDK Integration Guide — "Build the transaction"
let payment = StellarSdk.Operation.payment({
  destination: recipientAddress,
  asset: StellarSdk.Asset.native(),   // ← it IS the native asset (no issuer)
  amount: body.amount.toString()
});
// ...
.addMemo(StellarSdk.Memo.text(paymentIdentifier));  // ← a memo the app wrote itself
```

- `Asset.native()` — the transfer is the **native asset**; there is no issuer and no asset-level tag.
- The **memo** is the app’s own `paymentIdentifier` — data the **sender chose to write**, not an on-chain
  origin. (This is exactly why the guide says the backend keeps things “**not … public on the chain**”.)

👉 The protocol-level content of the payment is `amount + destination + native`. Nothing else.

---

## 2. U2A `createPayment` — the whole input surface

The Wallet SDK’s `createPayment` accepts only:

| Field | What it is | Identifies origin? |
|---|---|---|
| `amount` | a number | ❌ |
| `memo` | free text **written by the sender** | ❌ (sender-chosen) |
| `metadata` | arbitrary app JSON | ❌ (sender-chosen) |

Both `memo` and `metadata` are for **human/app reference**; they are not on-chain provenance. See
[`SOURCES.md`](SOURCES.md) §3 and §8.

---

## 3. Platform API `PaymentDTO` — every field, and what each identifies

The complete official response (`GET /v2/payments/{payment_id}`; [`SOURCES.md`](SOURCES.md) §6):

| Field | Identifies | Origin? |
|---|---|---|
| `identifier` | this **payment** | ❌ |
| `user_uid` | the **user** (identity) | ❌ |
| `amount` | a number | ❌ |
| `memo` | sender-written text | ❌ |
| `metadata` | sender/app JSON | ❌ |
| `from_address` | **who sent** (account) | ❌ |
| `to_address` | **who received** (account) | ❌ |
| `direction` | app↔user | ❌ |
| `created_at` | a timestamp | ❌ |
| `network` | mainnet/testnet | ❌ |
| `status` | payment lifecycle flags | ❌ |
| `transaction.txid` | the **transaction** | ❌ |

Run `examples/app-payment-flow/server.js` to print these keys yourself; the sample is
[`examples/payment-dto-sample.json`](../examples/payment-dto-sample.json).

---

## 4. What the blockchain gives the SDK — and what it never gives

An SDK that reads the chain (Horizon) sees, for a payment: `amount`, `from`, `to`, `asset_type: "native"`,
`memo`, `txid`. It sees **no** `origin`, `mined`, `exchange`, `provenance`, `taint`, or per-unit id.
Demonstrate it live with `examples/provenance-check.mjs`.

---

## 5. A note on third-party mirrors (honesty)

Search results often point to **auto-generated wikis** of Pi’s repos (for example *DeepWiki* pages titled
“Payment Flow | pi-apps/pi-platform-docs”). Those are **third-party, unofficial** mirrors; their field names
(e.g. camelCase `paymentId`/`toAddress`) may not match the real API.

This repository therefore cites the **official repositories and docs only**:
`pi-apps/pi-sdk-integration-guide`, `pi-apps/pi-platform-docs`, `pi-apps/pi-sdk-js`, and `docs.minepi.com`.
See [`SOURCES.md`](SOURCES.md) §17–§18.

---

## 6. The honest boundary

This FAQ proves the **application-layer** claim: *no SDK field or API field carries per-unit origin.*

It does **not** claim:
- that an **exchange’s** internal ledger has no record (Claim C — off-chain, see
  [`FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](FAQ-EXCHANGE-DEPOSIT-VERIFY.md));
- anything about **price** or **identity**.

---

## 7. Master rule

> Any field you can read — from the chain, the SDK, or the API — tells you **who**, **what type**, **what
> state**, or **what the sender wrote**. **None** tells you *where a unit came from*, because in an
> Account/Balance model **“where the unit came from” is not a property that exists.**

---

## Sources
- [`SOURCES.md`](SOURCES.md) §3 (U2A), §6 (`PaymentDTO`), §8 (SDK JS), **§17 (SDK Integration Guide)**,
  **§18 (Platform docs — Payment flow)**
- [`FAQ-MICRO-PI-ID.md`](FAQ-MICRO-PI-ID.md) · [`FAQ-ALL-OBJECTIONS.md`](FAQ-ALL-OBJECTIONS.md) · [`PROOF.md`](../PROOF.md)
- Live: `examples/provenance-check.mjs` · `examples/app-payment-flow/server.js` ·
  `examples/payment-dto-sample.json`
