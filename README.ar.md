# π = π — هل Pi على المنصّات هو نفسه Pi المُعدَّن؟

🌍 [English](README.md) · **العربية**

> تحليل تقني موثّق عن **التكافؤ (Fungibility)** في بلوكشين **Pi Network**:
> ليش **صاحب التطبيق** (App owner) — حتى باستعمال **Pi Wallet SDK** و **Platform API** — **ما يقدرش يفرّق** بين:
> -π معدّنة (مُهاجَرة من التعدين)،
> -π مسحوبة من منصّة مثل **OKX / Bitget**،
> -π واصلة داخل تطبيق في **Pi Browser**.

[![Independent](https://img.shields.io/badge/Independent-unofficial-orange)](DISCLAIMER.ar.md)
[![Not affiliated with Pi Network](https://img.shields.io/badge/not%20affiliated-Pi%20Network-critical)](DISCLAIMER.ar.md)
[![Pi Docs](https://img.shields.io/badge/Source-docs.minepi.com-6f42c1)](https://docs.minepi.com/)
[![Pi Developer Guide](https://img.shields.io/badge/Source-pi--apps.github.io-2ea44f)](https://pi-apps.github.io/community-developer-guide/)
[![Platform API](https://img.shields.io/badge/Source-platform__API-0969da)](https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)
[![self-test](https://github.com/aybvip/pi-fungibility/actions/workflows/self-test.yml/badge.svg)](https://github.com/aybvip/pi-fungibility/actions/workflows/self-test.yml)
[![Audit: not independently audited](https://img.shields.io/badge/audit-not%20independently%20audited-red)](docs/AUDIT-REQUEST.ar.md)

📄 **النطاق الكامل — شنوّة مثبت وشنوّة موش مدّعى:** [`docs/SCOPE.ar.md`](docs/SCOPE.ar.md) · 🌍 [English](docs/SCOPE.md)
🧾 **حالة التدقيق المستقل — موش مدقّق من طرف ثالث (قابل للتكرار):** [`docs/AUDIT-REQUEST.ar.md`](docs/AUDIT-REQUEST.ar.md) · 🌍 [English](docs/AUDIT-REQUEST.md)

> 🏷️ **مستقل وغير رسمي — موش تابع لـPi Network.** هذا تحليل مستقل، موش منتج رسمي.
> شوف [`DISCLAIMER.ar.md`](DISCLAIMER.ar.md).
>
> 🔐 **آمن بالتصميم (للقراءة فقط).** **بلا** ربط محفظة، **بلا** عبارة سرية، **بلا** مفاتيح، **بلا** توقيع،
> **بلا** مكتبات. افحصو — شوف [`SECURITY.ar.md`](SECURITY.ar.md).
> التفاصيل: [`docs/FAQ-UNOFFICIAL-REPO-SCAM.ar.md`](docs/FAQ-UNOFFICIAL-REPO-SCAM.ar.md).

🗂️ **الفهرس الكامل لكل الملفات (حسب الملف وحسب السؤال):** [`docs/INDEX.ar.md`](docs/INDEX.ar.md)

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
| [`examples/mixing-check.mjs`](examples/mixing-check.mjs) | برهان حيّ لسيناريو **«معدَّنة + مشرية ثم بعث»**: خلط → رصيد رقم واحد → دفعة بلا مصدر |
| [`examples/verify-deposit.mjs`](examples/verify-deposit.mjs) | يتحقّق إنّ تحويلًا **معيّنًا** هو دفعة **Pi أصلية على Mainnet** (الادّعاء B)؛ ويوضّح شنوّة ما يثبتوش السجلّ (C) |
| [`examples/self-test.mjs`](examples/self-test.mjs) | اختبارات آلية: **بلا شبكة** (قاعدة نفس العملية، بوّابة المعاملة الفاشلة) + **أونلاين** (صحيح → VERIFIED، غالط → NOT VERIFIED) |
| [`examples/model-check.mjs`](examples/model-check.mjs) | **نموذج تنفيذي** + فحص خصائص (2000 بذرة، بلا شبكة): الحالة رقم واحد، `تاريخ → حالة` مش تعاكسية، رؤية المستلم مستقلة عن المصدر |
| [`examples/exhaustive-check.mjs`](examples/exhaustive-check.mjs) | **فحص استنفادي محدود** (بلا شبكة، بلا عشوائية): يعدّد **كل 1452** تاريخ في مجال منتهي؛ إخفاء المصدر يصحّ لكل واحد |
| [`examples/provenance-check.mjs`](examples/provenance-check.mjs) | سكربت **بلا اعتماديات** يشغّل على البلوكشين ويثبت شنو **ينفع/ما ينفعش** تعرفه عن عملة معيّنة |
| [`examples/coin-id-check.mjs`](examples/coin-id-check.mjs) | يثبت إنّ الرصيد رقم واحد — **مافيه معرّف لكل micro-π** |
| [`examples/app-payment-flow/frontend.html`](examples/app-payment-flow/frontend.html) | واجهة `Pi.createPayment` الرسمية (U2A) |
| [`examples/app-payment-flow/server.js`](examples/app-payment-flow/server.js) | باكند يتعامل مع `PaymentDTO` + يطبع مفاتيحه |
| [`examples/payment-dto-sample.json`](examples/payment-dto-sample.json) | نموذج `PaymentDTO` يبيّن غياب حقل المصدر |
| [`PROOF.md`](PROOF.md) | البرهان خطوة-بخطوة |
| [`docs/FAQ-MUXED-M-VS-G.md`](docs/FAQ-MUXED-M-VS-G.md) | الرد على اعتراض «المنصّات عندها عنوان M مو G» |
| [`docs/FAQ-MICRO-PI-ID.md`](docs/FAQ-MICRO-PI-ID.md) | الرد على اعتراض «كل micro-π عندها معرّف ID» |
| [`docs/FAQ-CAN-CORE-TEAM-SET-PRICE.md`](docs/FAQ-CAN-CORE-TEAM-SET-PRICE.ar.md) | **هل الفريق يفرض سعر مختلف/يمنع البيع؟** لا — على مستوى البروتوكول مستحيل |
| [`docs/FAQ-RECIPIENT-CANNOT-TELL.md`](docs/FAQ-RECIPIENT-CANNOT-TELL.ar.md) | **«خلطت معدَّنة + مشرية وبعثت — ينجّم يشوف الفرق؟»** برهان حتمي |
| [`docs/FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](docs/FAQ-EXCHANGE-DEPOSIT-VERIFY.ar.md) | **«التكافؤ شيء، لكن رصيد المنصّة مدعوم؟»** 3 ادّعاءات: A مثبت، B يُتحقّق، C موش مدّعى |
| [`docs/AUDIT-REQUEST.md`](docs/AUDIT-REQUEST.ar.md) | **«البرهان خضع لتدقيق مستقل؟»** **لا** — موثّق ذاتيًا وقابل للتكرار، وهذا موش تدقيق طرف ثالث |
| [`docs/FAQ-UNOFFICIAL-REPO-SCAM.md`](docs/FAQ-UNOFFICIAL-REPO-SCAM.ar.md) | **«مستودع GitHub عشوائي = نصب؟»** افحص ما تثقش + تصحيح «Pi موش مدرجة» |
| [`docs/FAQ-ALL-OBJECTIONS.md`](docs/FAQ-ALL-OBJECTIONS.md) | **كل الحجج الممكنة المتبقية** + الردّ على كل واحدة |
| [`docs/MICA-WHITEPAPER.md`](docs/MICA-WHITEPAPER.md) | ورقة MiCA الرسمية: «native, fungible» + «Functionally Fungible Group» |
| [`docs/FAQ-DONT-BUY-PI.md`](docs/FAQ-DONT-BUY-PI.md) | «Pi قالت لا تشتروا Pi» = سياسة Enclosed Mainnet (انتهت 20 فبراير 2025) |
| [`docs/FAQ-FUNGIBILITY-VS-PRICE.md`](docs/FAQ-FUNGIBILITY-VS-PRICE.md) | «نفس العملة ≠ نفس السعر» — الفرق بين الفطرة والسعر |

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

## 🛡️ اعتراض شائع: «المنصّات عندها عنوان M مو G!»

**الرد باختصار:** عناوين **M** هي **Muxed Accounts** (CAP-27) = عنوان **G** + رقم. ما توجدش على السلسلة أصلاً، والشبكة تتعامل معاها **بالضبط** كأنك ما استعملت muxing أبداً. الـ M توصف **الطرف الآخر** (غالباً حساب منصّة مجمّع)، **مو مصدر العملة**.

- ✅ صحيح: Bitget (وأخرى) تعطي عنوان إيداع Pi يبدأ بـ M.
- ❌ غلط: إنّ هذا يخليك تفرّق بين π معدّنة و π مشتراة.
- السبب: أي واحد يقدر يستعمل M، والسحب من المنصّة يجي من محفظة **G** ساخنة، والعملة نفسها native بلا ذاكرة.

**التفصيل الكامل:** [`docs/FAQ-MUXED-M-VS-G.md`](docs/FAQ-MUXED-M-VS-G.md)

| المفهوم | ماذا يعطيك |
|---|---|
| **Address labeling** (G/M معروف لمنصّة) | ✅ **مين** الطرف الآخر |
| **Coin provenance** (مصدر الوحدة) | ❌ **مستحيل** — لا يوجد حقل أصلاً |

---

## 🛡️ اعتراض شائع: «كل micro-π عندها معرّف ID خاص!»

**الردّ:** Pi (مثل Stellar) تستعمل **نموذج Account/Balance** — الرصيد **رقم واحد** — **مو UTXO** (مثل بيتكوين، اللي فيه معرّف لكل مخرج).

```json
// GET /accounts/GC55...
{ "balance": "2.0000000", "asset_type": "native" }   // ← رقم واحد، بلا قطع وبلا معرّفات
```

- `1 π = 10,000,000 micro-π` = **خانة عشرية رياضية**، مو معرّف.
- المعرّفات الموجودة فعلاً: `G` (حساب)، `M` (مستخدم مجمّع)، `txid` (معاملة)، `op.id` (عملية)، `cb-id` (صندوق مقفول) — **ولا واحد منها معرّف «وحدة π»**.
- **التفصيل:** [`docs/FAQ-MICRO-PI-ID.md`](docs/FAQ-MICRO-PI-ID.md) — والاختبار: `node examples/coin-id-check.mjs`

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

**Muxed accounts (M addresses):** a common counterargument is that exchanges use `M...` deposit addresses. True — but `M` is just a **muxed account** (`G...` + 64-bit ID, CAP-27). It identifies the **counterparty** (a pooled exchange account), not the **origin of the coins**. Muxed accounts don't exist on the ledger, and the network processes them *exactly as if muxing was not used*. So `M` vs `G` is **address labeling**, never **coin provenance**. See [`docs/FAQ-MUXED-M-VS-G.md`](docs/FAQ-MUXED-M-VS-G.md).

---

## المساهمة

لقيت خطأ؟ هذا أثمن تبرّع. شوف [`CONTRIBUTING.ar.md`](CONTRIBUTING.ar.md) وحالة التدقيق
[`docs/AUDIT-REQUEST.ar.md`](docs/AUDIT-REQUEST.ar.md) (هذا المستودع **موش** مدقّق من طرف ثالث توّا).

## License
MIT
