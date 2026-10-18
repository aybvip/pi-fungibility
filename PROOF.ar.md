# PROOF — البرهان: صاحب التطبيق ما يقدرش يفرّق مصدر الـπ

هدف هذا الملف: إثبات الادّعاء التالي بدليل رسمي + كود:

> **لا يمكن لصاحب تطبيق Pi (ولا لمنصّة) أن يحدّد ما إذا كانت π الواصلة أصلها تعدين، أم مسحوبة من منصّة (OKX/Bitget)، أم من تطبيق آخر.**

---

## 0) المنطق العام

```
        [ المُرسِل ]  (معدّن / OKX / Bitget / تطبيق)
              |
              |  عملية Stellar: payment { amount, asset_type: "native" }
              v
     [ بلوكشين Pi Mainnet ]  ← المصدر الوحيد للحقيقة
              |
              |  الحقول الظاهرة: amount, from, to, memo, txid
              v
   [ تطبيقك: Pi SDK + Platform API ]  ← ما عنده أي حقل "مصدر"
```

إذا كانت **البيانات المتاحة للتطبيق** لا تحتوي على حقل «مصدر»، و**البلوكشين** لا يسجّل مصدر الوحدات، إذن **يستحيل** التفريق.

---

## 1) البرهان على مستوى البلوكشين

### 1.1 Pi = بروتوكول Stellar (رسمي)
توثيق Pi الرسمي لإنشاء التوكنات يستعمل نفس مكتبة Stellar:
```js
const StellarSDK = require("@stellar/stellar-sdk");
const server = new StellarSDK.Horizon.Server("https://api.testnet.minepi.com");
const NETWORK_PASSPHRASE = "Pi Testnet";
```
🔗 https://docs.minepi.com/use-native-features/Tokens

### 1.2 الأصل الأصلي (native) بلا issuer
- أي توكن يلزمه `issuer` + `trustline` ويظهر بـ `asset_code/asset_issuer`.
- الـ **native** ما عندوش لا issuer لا code.
- ولهذا مصفوفة `balances` في ردّ الحساب تعطيك:
```json
{ "balance": "2.0000000", "asset_type": "native" }
```
**لا يوجد حقل مصدر** ولا «تاريخ تعدين» على السلسلة.

### 1.3 السلسلة تسجّل الأرصدة لا الحبات
الحقل الوحيد المتعلق بالطرف الآخر هو **عنوان المرسل** (`from`) + **المذكرة** (`memo`).
مثال حقيقي (شغّل `examples/provenance-check.mjs`):
```
type        : payment
from        : G...
to          : G...
amount      : 0.8000000
asset_type  : native   (no issuer)
```
العنوان يقول **مين**، مو **العملة من وين**.

---

## 2) البرهان على مستوى Pi Wallet SDK

توثيق Pi الرسمي (Wallet & SDK):
> «The Pi Network JS SDK exposes wallet-related operations ... via the `window.Pi.Wallet` module.»
> «**Transactions must be pre-signed; the SDK does not build or sign transactions for you.**»
🔗 https://docs.minepi.com/use-native-features/Wallet

وواجهة الدفع (`Pi.createPayment`) — الحقول المسموحة رسمياً:
```js
Pi.createPayment(
  { amount: 1, memo: 'Unlock Premium', metadata: { feature: 'premium' } },
  { onReadyForServerApproval, onReadyForServerCompletion, onCancel, onError }
);
```
🔗 https://docs.minepi.com/accept-payment/Payments

👉 **amount / memo / metadata فقط.** `metadata` كاتبها المطوّر نفسه، ماهي معلومة عن العملة.
لذلك لا الـ SDK ولا العملية (payment من نوع native) تحمل أي معلومة عن مصدر الـπ.

---

## 3) البرهان على مستوى Platform API (`PaymentDTO`)

التعريف الرسمي الكامل (من `pi-platform-docs/platform_API.md`):

```ts
{
  identifier: string,
  user_uid: string,
  amount: number,
  memo: string,
  metadata: Object,
  from_address: string,      // عنوان المرسل فقط
  to_address: string,        // عنوان المستلم فقط
  direction: Direction,
  created_at: string,
  network: AppNetwork,
  status: { developer_approved, transaction_verified, developer_completed, cancelled, user_cancelled },
  transaction: null | { txid, verified, _link }
}
```
🔗 https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md

عدد الحقول = 0 تخصّ «مصدر العملة».
وحتى الـ A2U (تطبيق يدفع للمستخدم) التوثيق الرسمي يقول:
> «The Pi blockchain is obviously the only source of truth for exchanging Pi.»
🔗 https://docs.minepi.com/accept-payment/PaymentsAdvanced

---

## 4) خطوات التحقق بنفسك (Runnable)

```bash
# 1) افحص معاملة على السلسلة مباشرة (بلا أي مكتبة)
node examples/provenance-check.mjs

# 2) شوف حقول PaymentDTO الرسمية ومافيهاش مصدر
cat examples/payment-dto-sample.json

# 3) اقرأ واجهة الدفع الرسمية
cat examples/app-payment-flow/frontend.html
```

**النتيجة:** في كل الطبقات، اللي تشوفو هو **مبلغ + عنوان + مذكرة**، **ومافيهش** «مصدر/تعدين/منصّة».

---

## 5) الاستنتاج

| الطبقة | هل يوجد حقل «مصدر العملة»؟ |
|---|---|
| البلوكشين (Horizon) | ❌ لا |
| Pi Wallet SDK (`window.Pi`) | ❌ لا |
| Platform API (`PaymentDTO`) | ❌ لا |
| ورقة MiCA الرسمية | ❌ لا — بل: **«native, fungible»** |

> تعداد الخانات كامل في سطح الـSDK + Platform API:
> [`docs/FAQ-SDK-PLATFORM-API-FIELDS.ar.md`](docs/FAQ-SDK-PLATFORM-API-FIELDS.ar.md).

**إذن:** صاحب التطبيق — بالضبط مثل أي شخص آخر — **ما يمكنش** يفرّق بين π معدّنة و π جاية من OKX/Bitget. كلهم نفس الأصل الأصلي (native)، ومن نفس الحجم والقيمة والفطرة.

> ⚠️ استثناء واحد مهم: إذا المنصّة/التطبيق يستعمل **IOU أو توكن وسيط** (مو native)، فهذا يفرق — لأنه أصلاً مو π حقيقية على السلسلة. تحقّق دائماً من `asset_type` و `issuer`.
