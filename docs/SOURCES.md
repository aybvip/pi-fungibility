# Official Sources — verified

> All quotes are transcribed verbatim from Pi Network / Pi Apps official documentation.

---

## 1. Pi Docs — official site (2026)
- https://docs.minepi.com/

## 2. Pi Wallet & SDK (`window.Pi.Wallet`)
- https://docs.minepi.com/use-native-features/Wallet

Quotes:
> “The Pi Network JS SDK exposes wallet-related operations and blockchain interactions via the `window.Pi.Wallet` module.”
> “Transactions must be pre-signed; the SDK does not build or sign transactions for you. See [Stellar docs](https://developers.stellar.org/docs/tools/lab/transactions) on creating XDR.”
> “Pi SDK authentication and payment features require the application to run inside the Pi Browser (or the Sandbox).”

## 3. Accept a payment (U2A)
- https://docs.minepi.com/accept-payment/Payments

`createPayment` interface:
```js
window.Pi.createPayment(
  { amount: 1, memo: 'Unlock Premium', metadata: { feature: 'premium' } },
  { onReadyForServerApproval, onReadyForServerCompletion, onCancel, onError }
);
```
> “Deliver purchased features **only after** the backend receives a successful `/complete` response from Pi.”

## 4. Advanced Payments (A2U)
- https://docs.minepi.com/accept-payment/PaymentsAdvanced

Quote:
> “The Pi blockchain is obviously the only source of truth for exchanging Pi.”

## 5. Tokens — proof of the Stellar protocol + the native asset
- https://docs.minepi.com/use-native-features/Tokens

```js
const StellarSDK = require("@stellar/stellar-sdk");
const server = new StellarSDK.Horizon.Server("https://api.testnet.minepi.com");
const NETWORK_PASSPHRASE = "Pi Testnet";
```
```js
updatedDistributorAccount.balances.forEach((balance) => {
  if (balance.asset_type === "native") {
    console.log(`Test-Pi Balance: ${balance.balance}`);
  } else {
    console.log(`${balance.asset_code} Balance: ${balance.balance}`);
  }
});
```
> Note: tokens require a `trustline` + `issuer`, while the native asset has neither.

## 6. Platform API — full `PaymentDTO` definition
- https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md
- Base path: `https://api.minepi.com/v2`

```ts
{
  identifier: string,
  user_uid: string,
  amount: number,
  memo: string,
  metadata: Object,
  from_address: string,
  to_address: string,
  direction: Direction,
  created_at: string,
  network: AppNetwork,
  status: {
    developer_approved: boolean,
    transaction_verified: boolean,
    developer_completed: boolean,
    cancelled: boolean,
    user_cancelled: boolean,
  },
  transaction: null | { txid: string, verified: boolean, _link: string },
}
```
> **No field** for “coin origin / mining / exchange”.

## 7. Community Developer Guide
- https://pi-apps.github.io/community-developer-guide/

## 8. Pi SDK JS (GitHub)
- https://github.com/pi-apps/pi-sdk-js

Quote:
> “`createPayment(paymentData)` – Begins a payment operation.”
```ts
interface PaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}
```

## 9. Blockchain (Horizon API) — general references
- Mainnet: `https://api.mainnet.minepi.com`
- Testnet: `https://api.testnet.minepi.com`
- Stellar reference for the native asset and base reserve: https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts

## 10. Whitepaper / Tokenomics
- https://minepi.com/white-paper
- https://minepi.com/blog/mainnet-migrations-roadmap-and-tokenomics/

## 11. Muxed Accounts (`M...`) — CAP-27
- Stellar — Pooled accounts / Muxed accounts / Memos:
  https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos
  > “Muxed accounts **do not exist on the ledger**, but their shared underlying `GABC…` account does.”
  > “There’s no validation on IDs and as far as the Stellar network is concerned, all supported operations **operate exactly as if you did not use a muxed account**.”
- CAP-27 spec: https://github.com/stellar/stellar-protocol/blob/master/core/cap-0027.md
- Bitget — Pi deposit address (starts with M):
  https://www.bitget.com/academy/how-to-securely-deposit-pi-coin-to-bitget
  > “Your PI deposit address will appear (usually starting with "M").”

## 12. Account/Balance model vs UTXO — “an ID per micro-π”
- Stellar — Accounts (a single numeric balance; native asset has no issuer):
  https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts
- UTXO vs Account model:
  https://www.alchemy.com/docs/utxo-vs-account-models
  https://bitcoin.stackexchange.com/questions/49853/utxo-model-vs-account-balance-model
- Live test: `examples/coin-id-check.mjs`.

## 13. Official MiCA Whitepaper (Pi Network — MiCAR whitepaper)
- 🔗 https://minepi.com/wp-content/uploads/2025/11/MiCA-Whitepaper-Pi-1.pdf
- Published: 2025-11-27 · Start of admission to trading: 2025-11-28 · Home Member State: Malta.
- Key verbatim quotes:
  > **F.2:** “Pi is the **native, fungible digital asset** of the Pi Network Layer 1 blockchain.”
  > **F.14:** “**Functionally Fungible Group** Digital Token Identifier: **2Z2WZP5KM**”
  > **G.3:** “The Pi token and its’ on chain functionalities are **immutable**. No modifications to transactions or the current blockchain ledger history can be made by anyone, **including the issuer**.”
  > **G.11 (Transfer Restrictions):** “Not applicable”
  > **G.4:** “Pi tokens are only available through mining. Individuals… that have mined tokens may elect to **sell tokens on the secondary market**…”
  > **E.2:** “The issuer is seeking admission to **secondary trading only**, through which the issuer will not gain any direct proceeds.”

## 14. “Don’t buy Pi” — Enclosed Mainnet policy (now expired)
- Enclosed Network (firewall blocks external connectivity): https://minepi.com/blog/open-network-launch-date/
  > “…the launch of the **Enclosed Network period**, which meant Mainnet was live but with a **firewall that prevents any external connectivity**.”
- Open Network (firewall removed + CEX): https://minepi.com/blog/open-network/
  > “With Open Network, **the firewall that was in place during Enclosed Network has been removed**.”
  > “…**support for integrations with centralized exchanges (CEXs) and onramps to provide additional means of acquiring Pi**…”

## 15. Fungibility vs price — same asset, different venue prices
- CryptoRank — Pi price spread across exchanges: https://cryptorank.io/price/pi-network-1/arbitrage
- arb.sh — PI spread (OKX vs Bitget): https://arb.sh/arbitrage/crypto/pi/okx-vs-bitget
- Investopedia — Kimchi Premium (same BTC, different price): https://www.investopedia.com/terms/k/kimchi-premium.asp

## 16. Issuer powers / no price control — “can they set a different price or block sales?”
- **No origin to target:** native asset has no per-unit identity (see §12).
- **No price in the protocol:** a payment is `bal(S) -= a ; bal(D) += a` — there is no price field.
- **No asset-level controls on native:** the issuer powers (freeze/clawback) exist only for *issued* assets;
  native Pi has **no issuer**. See Stellar — Accounts (§9) and MiCA G.11 “Transfer Restrictions: Not applicable” (§13).
- **Immutability even by the issuer:** MiCA **G.3** (§13).
- **Where their power lies:** off-chain — Pi Browser/app platform, SDK/Platform-API keys, KYC, migration
  (see §1, §2, §6).
- **Only a different *asset*** (IOU / wrapped / token) can carry different rules/price — not native Pi.
  See `docs/FAQ-CAN-CORE-TEAM-SET-PRICE.md`.

## 17. Official SDK Integration Guide (GitHub) — A2U payments
- https://github.com/pi-apps/pi-sdk-integration-guide
  Verbatim quotes:
  > “The Pi blockchain is obviously the **source of truth** for exchanging Pi. The Pi backend is used to
  > improve the end-user experience (e.g. provide users understandable memos on their wallet, and link backs
  > to your app, **while preserving user and developer privacy by not making this information public on the
  > chain**) and to assist developers in avoiding to make payment mistakes (e.g. double payments due to
  > server faults)”
  > “Your Pi SDK implementation needs to both be able to **sign and submit blockchain transactions using the
  > Stellar SDK** and send additional API calls to the Pi backend using standard https libraries.”
  Build-the-transaction step (verbatim), showing the payment is the **native asset** plus an app-written memo:
  ```js
  let payment = StellarSdk.Operation.payment({
    destination: recipientAddress,
    asset: StellarSdk.Asset.native(),   // native asset — no issuer
    amount: body.amount.toString()
  });
  // ...
  .addMemo(StellarSdk.Memo.text(paymentIdentifier));  // memo = app's own payment id
  ```
- Live check: `examples/app-payment-flow/server.js` (prints the `PaymentDTO` keys).

## 18. Official Platform docs (GitHub) — Payment flow
- https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md
  Verbatim quote:
  > “Payments are **wrappers around blockchain transactions**, which enable your app, the Pi Blockchain, and
  > the Pi Servers to be all synchronized when the user submits a blockchain transaction to pay for something
  > in your app.”
  > Three phases, all keyed on the **payment id + txid** (never a coin origin): “Payment creation and
  > Server-Side Approval”, “User interaction and blockchain transaction”, “Server-Side Completion”.
- Note on third-party mirrors: auto-generated wikis of these repos (e.g. *DeepWiki* “Payment Flow |
  pi-apps/pi-platform-docs”) are **unofficial**, and their field names (camelCase `paymentId`/`toAddress`) may
  not match the real API. Cite the official repos above.
- See also: `docs/FAQ-SDK-PLATFORM-API-FIELDS.md` (the full SDK/API field enumeration).
