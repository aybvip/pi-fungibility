# مصادر رسمية (Official Sources) — تم التحقق منها

> كل الاقتباسات منقولة حرفياً من الوثائق الرسمية لـ Pi Network / Pi Apps.

---

## 1. Pi Docs — الموقع الرسمي (2026)
- https://docs.minepi.com/

## 2. Pi Wallet & SDK (`window.Pi.Wallet`)
- https://docs.minepi.com/use-native-features/Wallet

اقتباسات:
> «The Pi Network JS SDK exposes wallet-related operations and blockchain interactions via the `window.Pi.Wallet` module.»
> «Transactions must be pre-signed; the SDK does not build or sign transactions for you. See [Stellar docs](https://developers.stellar.org/docs/tools/lab/transactions) on creating XDR.»
> «Pi SDK authentication and payment features require the application to run inside the Pi Browser (or the Sandbox).»

## 3. Accept a payment (U2A)
- https://docs.minepi.com/accept-payment/Payments

اقتباس (واجهة `createPayment`):
```js
window.Pi.createPayment(
  { amount: 1, memo: 'Unlock Premium', metadata: { feature: 'premium' } },
  { onReadyForServerApproval, onReadyForServerCompletion, onCancel, onError }
);
```
> «Deliver purchased features **only after** the backend receives a successful `/complete` response from Pi.»

## 4. Advanced Payments (A2U)
- https://docs.minepi.com/accept-payment/PaymentsAdvanced

اقتباس:
> «The Pi blockchain is obviously the only source of truth for exchanging Pi.»

## 5. Tokens — إثبات بروتوكول Stellar + الأصل الأصلي
- https://docs.minepi.com/use-native-features/Tokens

اقتباس:
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
> ملاحظة: التوكنات تلزمها `trustline` + `issuer`، بينما الـ native ما عندهاش issuer.

## 6. Platform API — تعريف `PaymentDTO` الكامل
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
> **لا يوجد أي حقل** لـ«مصدر العملة / تعدين / منصّة».

## 7. Community Developer Guide
- https://pi-apps.github.io/community-developer-guide/

## 8. Pi SDK JS (GitHub)
- https://github.com/pi-apps/pi-sdk-js

اقتباس:
> «`createPayment(paymentData)` – Begins a payment operation.»
```ts
interface PaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}
```

## 9. البلوكشين (Horizon API) — مصادر عامة
- Mainnet: `https://api.mainnet.minepi.com`
- Testnet: `https://api.testnet.minepi.com`
- مرجع Stellar للأصل الأصلي والـ base reserve: https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts

## 10. Whitepaper / Tokenomics
- https://minepi.com/white-paper
- https://minepi.com/blog/mainnet-migrations-roadmap-and-tokenomics/

## 11. Muxed Accounts (عناوين M) — CAP-27
- Stellar — Pooled accounts / Muxed accounts / Memos:
  https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos
  > «Muxed accounts **do not exist on the ledger**, but their shared underlying `GABC…` account does.»
  > «There’s no validation on IDs and as far as the Stellar network is concerned, all supported operations **operate exactly as if you did not use a muxed account**.»
- CAP-27 spec: https://github.com/stellar/stellar-protocol/blob/master/core/cap-0027.md
- Bitget — عنوان إيداع Pi (يبدأ بـ M):
  https://www.bitget.com/academy/how-to-securely-deposit-pi-coin-to-bitget
  > «Your PI deposit address will appear (usually starting with "M").»

## 12. نموذج الرصيد (Account/Balance) vs UTXO — «معرّف لكل micro-π»
- Stellar — Accounts (رصيد رقمي واحد، الأصل الأصلي بلا issuer):
  https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts
- UTXO vs Account model:
  https://www.alchemy.com/docs/utxo-vs-account-models
  https://bitcoin.stackexchange.com/questions/49853/utxo-model-vs-account-balance-model
- اختبار مباشر: `examples/coin-id-check.mjs` (يبيّن أنّ الرصيد رقم واحد، والمعرّفات كلها لحسابات/معاملات، مو لوحدات).
