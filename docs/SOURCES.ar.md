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

## 13. ورقة MiCA الرسمية (Pi Network — MiCAR whitepaper)
- 🔗 https://minepi.com/wp-content/uploads/2025/11/MiCA-Whitepaper-Pi-1.pdf
- النشر: 2025-11-27 · بداية الإدراج: 2025-11-28 · الدولة المضيفة: مالطا.
- اقتباسات حاسمة (نصّ حرفي):
  > **F.2:** «Pi is the **native, fungible digital asset** of the Pi Network Layer 1 blockchain.»
  > **F.14:** «**Functionally Fungible Group** Digital Token Identifier: **2Z2WZP5KM**»
  > **G.3:** «The Pi token and its' on chain functionalities are **immutable**. No modifications to transactions or the current blockchain ledger history can be made by anyone, **including the issuer**.»
  > **G.11 (Transfer Restrictions):** «Not applicable»
  > **G.4:** «Pi tokens are only available through mining. Individuals… that have mined tokens may elect to **sell tokens on the secondary market**…»
  > **E.2:** «The issuer is seeking admission to **secondary trading only**, through which the issuer will not gain any direct proceeds.»

## 14. «لا تشتروا Pi» — سياسة Enclosed Mainnet (منتهية)
- Enclosed Network (firewall يمنع الاتصال الخارجي): https://minepi.com/blog/open-network-launch-date/
  > «…the launch of the **Enclosed Network period**, which meant Mainnet was live but with a **firewall that prevents any external connectivity**.»
- Open Network (انتُزع الـfirewall + CEX): https://minepi.com/blog/open-network/
  > «With Open Network, **the firewall that was in place during Enclosed Network has been removed**.»
  > «…**support for integrations with centralized exchanges (CEXs) and onramps to provide additional means of acquiring Pi**…»

## 15. التكافؤ مقابل السعر — نفس الأصل، سعر مختلف حسب المنصّة
- CryptoRank — فرق سعر Pi بين المنصّات: https://cryptorank.io/price/pi-network-1/arbitrage
- arb.sh — فرق PI (OKX مقابل Bitget): https://arb.sh/arbitrage/crypto/pi/okx-vs-bitget
- Investopedia — علاوة الكيمتشي (نفس BTC، سعر مختلف): https://www.investopedia.com/terms/k/kimchi-premium.asp

## 16. صلاحيات المُصدِر / بلا تحكّم بالسعر — «ينجّموا يفرضوا سعر مختلف ولا يمنعوا البيع؟»
- **ما فماش مصدر تستهدفه:** الأصل الأصلي بلا هوية لكل وحدة (شوف §12).
- **ما فماش سعر في البروتوكول:** الدفعة `bal(S) -= a ; bal(D) += a` — ما فماش خانة سعر.
- **ما فماش تحكّم على الأصل الأصلي:** صلاحيات المُصدِر (تجميد/clawback) موجودة برك للأصول *المُصدَرة*؛
  الـPi الأصلية **بلا مُصدِر**. شوف Stellar — Accounts (§9) وMiCA G.11 «Transfer Restrictions: Not applicable» (§13).
- **عدم القابلية للتغيير حتى من المُصدِر:** MiCA **G.3** (§13).
- **وين تكمن قوّتهم:** برّا السلسلة — Pi Browser/منصّة التطبيق، مفاتيح SDK/Platform-API، KYC، الترحيل
  (شوف §1، §2، §6).
- **غير *أصل مختلف*** (IOU / ملفوف / توكن) ينجّم يحمل قواعد/سعر مختلف — مو الـPi الأصلية.
  شوف `docs/FAQ-CAN-CORE-TEAM-SET-PRICE.ar.md`.

## 17. دليل تكامل الـSDK الرسمي (GitHub) — دفعات A2U
- https://github.com/pi-apps/pi-sdk-integration-guide
  اقتباسات حرفية:
  > «The Pi blockchain is obviously the **source of truth** for exchanging Pi. The Pi backend is used to improve the end-user experience (e.g. provide users understandable memos on their wallet, and link backs to your app, **while preserving user and developer privacy by not making this information public on the chain**) and to assist developers in avoiding to make payment mistakes (e.g. double payments due to server faults)»
  > «Your Pi SDK implementation needs to both be able to **sign and submit blockchain transactions using the Stellar SDK** and send additional API calls to the Pi backend using standard https libraries.»
  خطوة «بناء المعاملة» (حرفيًا)، وتوري إنّ الدفعة **الأصل الأصلي** + memo كتبو التطبيق:
  ```js
  let payment = StellarSdk.Operation.payment({
    destination: recipientAddress,
    asset: StellarSdk.Asset.native(),   // الأصل الأصلي — بلا issuer
    amount: body.amount.toString()
  });
  // ...
  .addMemo(StellarSdk.Memo.text(paymentIdentifier));  // memo = معرّف الدفعة تبع التطبيق
  ```
- فحص حيّ: `examples/app-payment-flow/server.js` (يطبع مفاتيح `PaymentDTO`).

## 18. توثيق Platform الرسمي (GitHub) — مسار الدفع
- https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md
  اقتباس حرفي:
  > «Payments are **wrappers around blockchain transactions**, which enable your app, the Pi Blockchain, and the Pi Servers to be all synchronized when the user submits a blockchain transaction to pay for something in your app.»
  > ثلاث مراحل، كلها مبنية على **معرّف الدفعة + txid** (عمرها ما على مصدر عملة): «Payment creation and Server-Side Approval»، «User interaction and blockchain transaction»، «Server-Side Completion».
- ملاحظة على المرايا طرف-ثالث: الـwikis المولّدة آليًا لهاذي المستودعات (مثلاً *DeepWiki* «Payment Flow | pi-apps/pi-platform-docs») **غير رسمية**، وسمّي خاناتها (camelCase `paymentId`/`toAddress`) ينجّم ما يطابقش الـAPI الحقيقي. استشهد بالمستودعات الرسمية فوق.
- شوف زادة: `docs/FAQ-SDK-PLATFORM-API-FIELDS.ar.md` (تعداد خانات الـSDK/API كامل).
