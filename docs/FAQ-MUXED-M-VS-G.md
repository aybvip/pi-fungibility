# FAQ — «المنصّات عندها عنوان **M** مو **G**، إذن يمكن التفرقة؟»

## الادّعاء
> «المنصّات (OKX / Bitget) تعطي عنوان إيداع يبدأ بـ **M** مو **G**، لذلك يمكن التمييز بين Pi المنصّة و Pi المُعدّنة.»

## نصف الحقيقة ✅
- **صحيح جزئياً:** بعض المنصّات تعطي **عنوان إيداع Pi** يبدأ بـ **M**.
  > Bitget: «Your PI deposit address will appear (usually starting with "M").»
  > 🔗 https://www.bitget.com/academy/how-to-securely-deposit-pi-coin-to-bitget
- عناوين **M** هي **Muxed Accounts** (CAP-27 في بروتوكول Stellar، وPi مبنية عليه): عنوان = **G** + رقم 64-bit.

## ليش ما يثبتش التفرقة بين العملات ❌

1. **الـ M حساب وهمي — ما يوجدش على السلسلة.**
   > Stellar Docs: «Muxed accounts **do not exist on the ledger**, but their shared underlying `GABC…` account does.»
   → على العموم، الحساب الحقيقي هو **G**، والـ M مجرد تغليف.
   🔗 https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos

2. **الشبكة تتعامل معه كأنك ما استعملت الـ muxing أبداً.**
   > «There’s no validation on IDs and as far as the Stellar network is concerned, all supported operations **operate exactly as if you did not use a muxed account**.»
   → يعني نفس الـ native π بالضبط، نفس الفطرة.

3. **الـ M يوصف «الطرف الآخر»، مو «العملة».**
   الـ M موجود باش يفرّق بين **مستخدمين داخل حساب مجمّع واحد** (pooled account) للمنصّة.
   → يقولك **مين** (أي مستخدم إيداع)، ما يقولكش **العملة جات من وين**.

4. **«M = منصّة» اتجاه واحد وناقص.**
   - **الإيداع عند المنصّة** → غالباً لعنوان **M**.
   - **السحب من المنصّة** → يجي من **محفظة G الساخنة** تبع المنصّة (مو M).
   → فلو شفت M، تعرف فقط إنّ **وجهة الإيداع** حساب مجمّع.

5. **مو كل المنصّات تستعمل M** — كثير تستعمل **G + Memo**.
6. **أي شخص عادي يقدر يستعمل عنوان M** — مو حكر على المنصّات.
   → إذن «M = منصّة» غلط من الأساس.

7. **الأهم:** حتى لو عرفت إنّ الطرف الآخر منصّة، **العملة نفسها (native) ما عندهاش ذاكرة**. ما تعرفش هل الحبات اللي عند المنصّة جات من **تعدين** ولا **شراء**.

## الفرق المهم

| المفهوم | شنو يعطيك |
|---|---|
| **Address labeling** (G/M معروف لمنصّة) | ✅ يعطيك **مين الطرف الآخر** |
| **Coin provenance** (مصدر الوحدة) | ❌ **مستحيل** — ماكو أصلاً حقل |

> الـ M يزيد معلومة على **هوية العنوان (counterparty)**, **مو على مصدر العملة (coin origin)**.

## مثال عملي
1. شخص **عدّن** π → حوّلها لـ **OKX** (إيداع لعنوان M) → **سحبها** لمحفظة جديدة G → بعثها لتطبيقك.
2. **التطبيق يشوف فقط آخر قفزة:** `payment` native من عنوان G. ما يشوفش التاريخ.
3. ولو بعث مباشرة **لعنوان M** تبع OKX: تعرف فقط إنّ **الوجهة منصّة**، لكن العملة = native عادية بلا وسم.

## الخلاصة
**M vs G = عنونة/هوية طرف آخر، مو وسم للعملة.**
الفطرة (**fungibility**) قائمة: الأصل **native** واحد، بلا مصدر — لا في السلسلة، ولا في Pi Wallet SDK، ولا في Platform API.

---

## المصادر
- Stellar — Pooled accounts / Muxed accounts / Memos: https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos
- Stellar — CAP-27 (Muxed accounts): https://github.com/stellar/stellar-protocol/blob/master/core/cap-0027.md
- Bitget — عنوان إيداع Pi (يبدأ بـ M): https://www.bitget.com/academy/how-to-securely-deposit-pi-coin-to-bitget
- Pi Platform API (`PaymentDTO`): https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md
