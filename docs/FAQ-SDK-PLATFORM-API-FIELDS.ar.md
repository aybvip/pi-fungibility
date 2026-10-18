# FAQ — «لازم الـSDK ولا Platform API يبيّنوا من وين جات الـπ — وإلا كيفاش التطبيق يعرف؟»

🌍 [English](FAQ-SDK-PLATFORM-API-FIELDS.md) · **العربية**

> الاعتراض: *«Pi Wallet SDK و Platform API يعرفوا كل شي على الدفعة. لازم في مكان بين هاذي الخانات يكون
> موجود مصدر العملة (تعدين؟ منصّة؟). التطبيق لازم ينجّم يقراه.»*
>
> الجواب القصير: **لا.** سطح الـSDK/API **معدّد بالكامل** في توثيق Pi نفسه، و**ما فماش خانة واحدة**
> تحمل مصدر كل وحدة. كل خانة تعرّف **الطرف الآخر**، ولا **نوع الأصل**، ولا **الحالة**، ولا هي
> **بيانات كتبها المرسل** — وعمرها ما تقول *من وين جات الحبة*.

نفس نتيجة [`FAQ-MICRO-PI-ID.ar.md`](FAQ-MICRO-PI-ID.ar.md) و[`PROOF.ar.md`](../PROOF.ar.md)، بس من جهة
**طبقة التطبيق** (SDK + Platform API) بدل السجلّ.

---

## 1. الدفعة A2U كاملة، من دليل تكامل الـSDK الرسمي

دليل **Pi SDK Integration Guide** الرسمي (مستودع `pi-apps/pi-sdk-integration-guide`) يشرح بالضبط شنوّة دفعة
A2U وكيفاش تتبنى. حرفيًا:

> «The Pi blockchain is obviously the **source of truth** for exchanging Pi. The Pi backend is used to improve
> the end-user experience (e.g. provide users understandable memos on their wallet, and link backs to your
> app, **while preserving user and developer privacy by not making this information public on the chain**)…»

> «Your Pi SDK implementation needs to both be able to **sign and submit blockchain transactions using the
> Stellar SDK** and send additional API calls to the Pi backend using standard https libraries.»

وقت يبني الدليل المعاملة فعليًا، هاذي برك السطرين اللي يحدّدوا شنوّة *تحمل* الدفعة:

```js
// Official SDK Integration Guide — "Build the transaction"
let payment = StellarSdk.Operation.payment({
  destination: recipientAddress,
  asset: StellarSdk.Asset.native(),   // ← هي الأصل الأصلي (بلا issuer)
  amount: body.amount.toString()
});
// ...
.addMemo(StellarSdk.Memo.text(paymentIdentifier));  // ← memo كتبو التطبيق بنفسو
```

- `Asset.native()` — التحويل على **الأصل الأصلي**؛ ما فماش issuer ولا وسم على مستوى الأصل.
- الـ**memo** هو `paymentIdentifier` تبع التطبيق — بيانات **اختار المرسل يكتبها**، مو مصدر على السلسلة.
  (ولهذا بالضبط الدليل يقول إنّ الباكند يخلّي الحوايج «**not … public on the chain**».)

👉 المحتوى على مستوى البروتوكول = `amount + destination + native`. ما فماش غيرو.

---

## 2. `createPayment` (U2A) — سطح الإدخال كامل

الـWallet SDK يقبل برك:

| الخانة | شنوّة هي | تعرّف المصدر؟ |
|---|---|---|
| `amount` | رقم | ❌ |
| `memo` | نص حر **كتبو المرسل** | ❌ (اختيار المرسل) |
| `metadata` | JSON حر للتطبيق | ❌ (اختيار المرسل) |

الـ`memo` والـ`metadata` للاستعمال **البشري/التطبيقي**؛ مو مصدر على السلسلة. شوف
[`SOURCES.ar.md`](SOURCES.ar.md) §3 و§8.

---

## 3. Platform API `PaymentDTO` — كل خانة وشنوّة تعرّف

الردّ الرسمي الكامل (`GET /v2/payments/{payment_id}`؛ [`SOURCES.ar.md`](SOURCES.ar.md) §6):

| الخانة | تعرّف | مصدر؟ |
|---|---|---|
| `identifier` | **الدفعة** هاذي | ❌ |
| `user_uid` | **المستخدم** (هوية) | ❌ |
| `amount` | رقم | ❌ |
| `memo` | نص كتبو المرسل | ❌ |
| `metadata` | JSON للمرسل/التطبيق | ❌ |
| `from_address` | **من أرسل** (حساب) | ❌ |
| `to_address` | **من استقبل** (حساب) | ❌ |
| `direction` | تطبيق↔مستخدم | ❌ |
| `created_at` | توقيت | ❌ |
| `network` | mainnet/testnet | ❌ |
| `status` | أعلام دورة حياة الدفعة | ❌ |
| `transaction.txid` | **المعاملة** | ❌ |

شغّل `examples/app-payment-flow/server.js` باش تطبع هاذي المفاتيح بنفسك؛ والعيّنة في
[`examples/payment-dto-sample.json`](../examples/payment-dto-sample.json).

---

## 4. شنوّة تعطي السلسلة للـSDK — وشنوّة عمرو ما تعطيه

أي SDK يقرا السلسلة (Horizon) يشوف، في دفعة: `amount`، `from`، `to`، `asset_type: "native"`،
`memo`، `txid`. **ما يشوفش** `origin`، `mined`، `exchange`، `provenance`، `taint`، ولا ID لكل وحدة.
جرّبها حيّة بـ`examples/provenance-check.mjs`.

---

## 5. ملاحظة على النسخ الطرف-ثالث (صراحة)

نتائج البحث بزاف مرّات تدلّي على **wikis مولّدة آليًا** لمستودعات Pi (مثلاً صفحات *DeepWiki* بعنوان
«Payment Flow | pi-apps/pi-platform-docs»). هاذي **مرايا طرف ثالث، غير رسمية**؛ وسمّي خاناتها
(مثلاً camelCase `paymentId`/`toAddress`) ينجّم ما يطابقش الـAPI الحقيقي.

لهذا هذا المستودع يستشهد **بالمستودعات والتوثيق الرسمي برك**: `pi-apps/pi-sdk-integration-guide`،
`pi-apps/pi-platform-docs`، `pi-apps/pi-sdk-js`، و`docs.minepi.com`. شوف [`SOURCES.ar.md`](SOURCES.ar.md)
§17–§18.

---

## 6. الحدود الصادقة

هذا الـFAQ يثبت الادّعاء على **مستوى التطبيق**: *ما فماش خانة في الـSDK ولا في الـAPI تحمل مصدر كل وحدة.*

و**ما يدّعيش**:
- إنّ سجلّ **المنصّة** الداخلي ما فيهش تسجيل (الادّعاء C — برّا السلسلة، شوف
  [`FAQ-EXCHANGE-DEPOSIT-VERIFY.ar.md`](FAQ-EXCHANGE-DEPOSIT-VERIFY.ar.md))؛
- أي حاجة على **السعر** ولا **الهوية**.

---

## 7. القاعدة الجامعة

> أي خانة تقراها — من السلسلة، ولا الـSDK، ولا الـAPI — تقولك **مين**، ولا **نوع شنوّة**، ولا
> **الحالة**، ولا **شنوّة كتب المرسل**. **ما فماش** وحدة تقولك *من وين جات الحبة*، خاطر في نموذج
> Account/Balance **«من وين جات الحبة» مو خاصية موجودة**.

---

## المصادر
- [`SOURCES.ar.md`](SOURCES.ar.md) §3 (U2A)، §6 (`PaymentDTO`)، §8 (SDK JS)، **§17 (دليل تكامل SDK)**،
  **§18 (Platform docs — Payment flow)**
- [`FAQ-MICRO-PI-ID.ar.md`](FAQ-MICRO-PI-ID.ar.md) · [`FAQ-ALL-OBJECTIONS.ar.md`](FAQ-ALL-OBJECTIONS.ar.md) ·
  [`PROOF.ar.md`](../PROOF.ar.md)
- حيّ: `examples/provenance-check.mjs` · `examples/app-payment-flow/server.js` ·
  `examples/payment-dto-sample.json`
