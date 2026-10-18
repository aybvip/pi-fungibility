# PROOF — An app owner cannot tell where the π came from

This file proves the following claim with official evidence + code:

> **Neither a Pi app owner nor an exchange can determine whether an incoming π was originally mined, withdrawn
> from an exchange (OKX/Bitget), or sent from another app.**

---

## 0) The general logic

```
        [ SENDER ]  (miner / OKX / Bitget / app)
              |
              |  Stellar operation: payment { amount, asset_type: "native" }
              v
     [ Pi Mainnet blockchain ]  ← the only source of truth
              |
              |  visible fields: amount, from, to, memo, txid
              v
   [ your app: Pi SDK + Platform API ]  ← has no "origin" field
```

If the **data available to the app** contains no “origin” field, and the **blockchain** does not record the
origin of individual units, then differentiation is **impossible**.

> ⚠️ **Precise scope (avoid a common misreading).** This proves that **per-coin origin** is not observable —
> **not** that “nothing is knowable about transfers”. The **account-level transaction graph is observable**:
> an analyst can see *which accounts* transacted (e.g. an inflow from a labeled exchange hot-wallet), but that
> is a fact about the **account over time**, never about the **units it sends**. See
> [`docs/SCOPE.md`](docs/SCOPE.md) §4 and [`docs/FAQ-RECIPIENT-CANNOT-TELL.md`](docs/FAQ-RECIPIENT-CANNOT-TELL.md) §3.

---

## 1) The proof at the blockchain level

### 1.1 Pi = the Stellar protocol (official)
Pi’s official docs for issuing tokens use the Stellar library:
```js
const StellarSDK = require("@stellar/stellar-sdk");
const server = new StellarSDK.Horizon.Server("https://api.testnet.minepi.com");
const NETWORK_PASSPHRASE = "Pi Testnet";
```
🔗 https://docs.minepi.com/use-native-features/Tokens

### 1.2 The native asset has no issuer
- Any token requires an `issuer` + `trustline` and shows `asset_code/asset_issuer`.
- The **native** asset has neither issuer nor code.
- So the account’s `balances` array gives you:
```json
{ "balance": "2.0000000", "asset_type": "native" }
```
There is **no origin field** and no “mining history” on-chain.

### 1.3 The ledger records balances, not coins
The only fields about the counterparty are the **sender address** (`from`) and the **memo** (`memo`).
A real example (run `examples/provenance-check.mjs`):
```
type        : payment
from        : G...
to          : G...
amount      : 0.8000000
asset_type  : native   (no issuer)
```
An address tells you **who**, not **where the coin came from**.

---

## 2) The proof at the Pi Wallet SDK level

Official Pi docs (Wallet & SDK):
> “The Pi Network JS SDK exposes wallet-related operations … via the `window.Pi.Wallet` module.”
> “**Transactions must be pre-signed; the SDK does not build or sign transactions for you.**”
🔗 https://docs.minepi.com/use-native-features/Wallet

And the payment interface (`Pi.createPayment`) — officially allowed fields:
```js
Pi.createPayment(
  { amount: 1, memo: 'Unlock Premium', metadata: { feature: 'premium' } },
  { onReadyForServerApproval, onReadyForServerCompletion, onCancel, onError }
);
```
🔗 https://docs.minepi.com/accept-payment/Payments

👉 **amount / memo / metadata only.** `metadata` is written by the developer — it is not information about the
coin. So neither the SDK nor the operation (a native `payment`) carries any coin-origin data.

---

## 3) The proof at the Platform API level (`PaymentDTO`)

The full official definition (from `pi-platform-docs/platform_API.md`):

```ts
{
  identifier: string,
  user_uid: string,
  amount: number,
  memo: string,
  metadata: Object,
  from_address: string,      // sender address only
  to_address: string,        // recipient address only
  direction: Direction,
  created_at: string,
  network: AppNetwork,
  status: { developer_approved, transaction_verified, developer_completed, cancelled, user_cancelled },
  transaction: null | { txid, verified, _link }
}
```
🔗 https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md

Number of fields about “coin origin” = **0**.
Even for A2U (app paying a user), the official docs say:
> “The Pi blockchain is obviously the only source of truth for exchanging Pi.”
🔗 https://docs.minepi.com/accept-payment/PaymentsAdvanced

---

## 4) Verify it yourself (runnable)

```bash
# 1) Inspect a transaction on-chain directly (no libraries)
node examples/provenance-check.mjs

# 2) See the official PaymentDTO fields — no origin
cat examples/payment-dto-sample.json

# 3) Read the official payment interface
cat examples/app-payment-flow/frontend.html
```

**Result:** at every layer, all you see is **amount + address + memo**, and **no** “origin/mining/exchange”.

---

## 5) Official corroboration: the MiCA whitepaper

Pi’s **MiCA whitepaper** (Nov 2025) states:
> **F.2:** “Pi is the **native, fungible digital asset** of the Pi Network Layer 1 blockchain.”
> **F.14:** “**Functionally Fungible Group** Digital Token Identifier: 2Z2WZP5KM”
> **G.3:** “The Pi token and its’ on chain functionalities are **immutable**. No modifications to transactions
> or the current blockchain ledger history can be made by anyone, **including the issuer**.”
> **G.11 (Transfer Restrictions):** “Not applicable”
🔗 https://minepi.com/wp-content/uploads/2025/11/MiCA-Whitepaper-Pi-1.pdf

See [`docs/MICA-WHITEPAPER.md`](docs/MICA-WHITEPAPER.md).

---

## 6) Conclusion

| Layer | “Coin origin” field? |
|---|---|
| Blockchain (Horizon) | ❌ No |
| Pi Wallet SDK (`window.Pi`) | ❌ No |
| Platform API (`PaymentDTO`) | ❌ No |
| Soroban smart contracts / token interface (SEP-41) | ❌ No — `balance`/`allowance`/`transfer` are **scalar `i128`** |
| Official MiCA whitepaper | ❌ No — instead: **“native, fungible”** |

> Field-by-field enumeration of the whole SDK + Platform API surface:
> [`docs/FAQ-SDK-PLATFORM-API-FIELDS.md`](docs/FAQ-SDK-PLATFORM-API-FIELDS.md).

**Therefore:** an app owner — exactly like everyone else — **cannot** distinguish mined π from π that came from
OKX/Bitget. They are the same native asset, with the same value and the same nature.

> ⚠️ One important exception: if an app/exchange uses an **IOU or a wrapped token** (not native), that *is* a
> different asset. Always check `asset_type` and `issuer`.
