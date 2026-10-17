# π = π — هل Pi على المنصّات هو نفسه Pi المُعدَّن؟

> تحليل تقني موثّق عن **التكافؤ (Fungibility)** في بلوكشين **Pi Network**:
> ليش **صاحب التطبيق** (App owner) — حتى باستعمال **Pi Wallet SDK** و **Platform API** — **ما يقدرش يفرّق** بين:
> -π معدّنة (مُهاجَرة من التعدين)،
> -π مسحوبة من منصّة مثل **OKX / Bitget**،
> -π واصلة داخل تطبيق في **Pi Browser**.

[![Pi Docs](https://img.shields.io/badge/Source-docs.minepi.com-6f42c1)](https://docs.minepi.com/)
[![Pi Developer Guide](https://img.shields.io/badge/Source-pi--apps.github.io-2ea44f)](https://pi-apps.github.io/community-developer-guide/)
[![Platform API](https://img.shields.io/badge/Source-platform__API-0969da)](https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

---

## 🎯 الخلاصة (TL;DR)

من ناحية البلوكشين، **كل π متطابقة تماماً**. الأصل الأصلي (**native**) **ما عندوش issuer ولا contract**، والسلسلة تسجّل **الأرصدة (balances)** مو **«حبات» موصوفة بمصدر**. لذلك:

```
π معدّنة = π من OKX/Bitget = π داخل تطبيق Pi Browser
```

**ما فيه حقل** اسمه «المصدر» أو «التعدين» أو «منصّة» — لا في البلوكشين، ولا في الـ SDK، ولا في Platform API.
‏الشي الوحيد اللي صاحب التطبيق يشوفو هو: **المبلغ + عنوان المرسل + عنوان المستلم + المذكرة (memo) + txid**.

---

## 📚 المصادر الرسمية (تم التحقق منها)

كل معلومة في هذا الريبو مأخوذة من الوثائق الرسمية لـ Pi Network:

| المصدر | الرابط | الاستعمال |
|---|---|---|
| Pi Docs (رسمي، 2026) | https://docs.minepi.com/ | Wallet SDK / Payments / Tokens |
| Pi Wallet & SDK | https://docs.minepi.com/use-native-features/Wallet | `window.Pi.Wallet` + «pre-signed transactions» |
| Accept a payment | https://docs.minepi.com/accept-payment/Payments | `Pi.createPayment` + الحقول المسموحة |
| Advanced Payments (A2U) | https://docs.minepi.com/accept-payment/PaymentsAdvanced | «البلوكشين هو المصدر الوحيد للحقيقة» |
| Tokens (Stellar SDK) | https://docs.minepi.com/use-native-features/Tokens | إثبات إنّ Pi بروتوكول Stellar وأنّ native بلا issuer |
| Platform API | https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md | تعريف `PaymentDTO` كامل |
| Community Dev Guide | https://pi-apps.github.io/community-developer-guide/ | نظرة عامة |
| Pi SDK JS (GitHub) | https://github.com/pi-apps/pi-sdk-js | واجهة `createPayment` |

التفاصيل والاقتباسات الحرفية في [`docs/SOURCES.md`](docs/SOURCES.md).

---

## 🧩 الدليل التقني على 3 طبقات

### الطبقة 1 — البلوكشين: الأصل الأصلي بلا هويّة (No issuer, No provenance)
- Pi تستعمل بروتوكول **Stellar** (نفس `Horizon` API، نفس `@stellar/stellar-sdk`، نفس `networkPassphrase: "Pi Mainnet"`).
- في Stellar: الأصل الأصلي **native** ما عندوش `asset_issuer`.
- أي أصل آخر (token) يظهر بـ `asset_code` + `asset_issuer`، ويلزمه **trustline**.
- → مافيش أي طريقة على السلسلة تحدد «من وين جات» الـπ.

**اختبار مباشر:**
```json
// GET https://api.mainnet.minepi.com/accounts/<G_ADDRESS>
{ "balance": "2.0000000", "asset_type": "native" }   // ← بلا issuer، بلا مصدر
```

### الطبقة 2 — Pi Wallet SDK: `createPayment` ما فيهاش «مصدر»
```js
// توثيق Pi الرسمي
Pi.createPayment(
  { amount: 1, memo: 'Unlock Premium', metadata: { feature: 'premium' } },
  { onReadyForServerApproval, onReadyForServerCompletion, onCancel, onError }
);
```
الحقول المسموحة: **amount / memo / metadata فقط**. مافيش أي حقل للمصدر.
وتوثيق الـ Wallet صريح: «Transactions must be pre-signed; the SDK does not build or sign transactions for you» — يعني العملية Stellar XDR عادية (payment)، ما فيهاش أي تاغ لمصدر العملة.

### الطبقة 3 — Platform API: `PaymentDTO` بلا حقل «origin»
الردّ الرسمي الكامل لـ `GET /v2/payments/{payment_id}`:
```ts
{
  identifier, user_uid, amount, memo, metadata,
  from_address, to_address, direction, created_at, network,
  status: { developer_approved, transaction_verified, developer_completed, cancelled, user_cancelled },
  transaction: { txid, verified, _link } | null
}
```
👉 **مافيه ولا حقل واحد** يوصف مصدر الـπ. حتى `from_address` يقولك **مين** بعث، مو **العملة من وين**.

---

## 🧪 الكود (قابل للتشغيل)

| الملف | الوصف |
|---|---|
| [`examples/provenance-check.mjs`](examples/provenance-check.mjs) | سكربت **بلا اعتماديات** يشغّل على البلوكشين ويثبت شنو **ينفع/ما ينفعش** تعرفه عن عملة معيّنة |
| [`examples/app-payment-flow/frontend.html`](examples/app-payment-flow/frontend.html) | واجهة `Pi.createPayment` الرسمية (U2A) |
| [`examples/app-payment-flow/server.js`](examples/app-payment-flow/server.js) | باكند يتعامل مع `PaymentDTO` + يطبع مفاتيحه |
| [`examples/payment-dto-sample.json`](examples/payment-dto-sample.json) | نموذج `PaymentDTO` يبيّن غياب حقل المصدر |
| [`PROOF.md`](PROOF.md) | البرهان خطوة-بخطوة |

**تشغيل الاختبار:**
```bash
node examples/provenance-check.mjs
# أو على معاملة معيّنة:
node examples/provenance-check.mjs <TXID>
```

المخرجات تبيّن إنّ اللي تشوفو هو `amount / from / to / asset_type: "native"` **وخلاص** — ما فيه أثر لمصدر العملة.

---

## ⚖️ الحدود والاستثناءات (مهم للدقة)

| الحالة | الفرق الحقيقي |
|---|---|
| **قفل / Lockup** | يظهر كـ `claimable_balance` (له predicate زمني) ≠ `native`. فرق **حالة**، مو فرق أصل. |
| **رصيد تعدين غير مُهاجر** | أصلاً مو على السلسلة (mobile balance) → قبل vs بعد. |
| **IOU / توكين وسيط على منصّة** | ممكن يكون **مو** native π حقيقي. هذا الفرق الوحيد المهم عملياً. |
| **Tokens (أصول أخرى)** | تظهر بـ `asset_code`+`asset_issuer`، ويلزمها trustline. |

> الخلاصة: الأصل الـ native الواحد = **fungible بالكامل**. أي تمييز حقيقي يكون في **الحالة** (مقفول/سائل/خارج الشبكة) أو **نوع الأصل** (native vs token) — **مو** في تاريخ التعدين.

---

## 🧠 النتائج العملية

1. **القيمة واحدة** — ما فيه فرق سعري بسبب المصدر.
2. **لا يمكن الفصل أو الوسم (no taint/segregation).**
3. **الأمان** — أي تطبيق يستلم π، المبلغ يندمج في رصيدو فوراً؛ الثقة في **العنوان/المذكرة**، مو في «نوع العملة».
4. **تحقّق دائماً من البلوكشين** — رقم π في منصّة/تطبيق ليس بالضرورة native π على السلسلة.

---

## English Summary

On **Pi Mainnet** (built on the **Stellar** protocol), Pi is the **native asset**: no issuer, no contract, and all units are fully fungible. The ledger records **balances, not coins**, so there is **no provenance / no taint** — neither the **Pi Wallet SDK** (`window.Pi`) nor the **Platform API** `PaymentDTO` exposes any field describing where a coin came from.

- `Pi.createPayment(...)` accepts only **amount / memo / metadata**.
- `PaymentDTO` exposes only **amount, from_address, to_address, direction, memo, metadata, txid** and status flags.
- The Wallet SDK sends **pre-signed Stellar XDR transactions**; the chain only confirms a `payment` of `asset_type: "native"`.

An app (or exchange) therefore **cannot tell** whether an incoming Pi was mined, withdrawn from OKX/Bitget, or sent by another app. The only real distinctions are **state** (locked `claimable_balance` vs liquid `native`) and **asset type** (native vs token/IOU) — never mining history.

---

## License
MIT
