# π = π — هل Pi على المنصّات هو نفسه Pi المُعدَّن؟

> تحليل تقني عن **التكافؤ (Fungibility)** في بلوكشين Pi Network:
> ليش ما يمكنك تفرّق بين Pi معدّن، و Pi مسحوب من منصّة مثل OKX/Bitget، و Pi مُستلَم داخل تطبيق في Pi Browser.

---

## 1) الفكرة الأساسية (Main thesis)

كل وحدة **π** موجودة على بلوكشين **Pi Mainnet** هي **متطابقة تماماً** مع أي وحدة أخرى.

ما فيه شي اسمه «Pi معدّن» مقابل «Pi منصّة» مقابل «Pi تطبيق» — من ناحية البلوكشين، كلهم **نفس الأصل الأصلي (native asset)** ونفس القيمة، وما يمكن فصلهم أو وسمهم.

```
π على السلسلة = π على OKX = π من التعدين = π داخل تطبيق Pi Browser
```

---

## 2) الأسباب (Organized reasons)

### السبب 1 — Pi هو الأصل الأصلي للبلوكشين (Native)
- Pi Network عبارة عن fork من **Stellar**.
- الأصل الأصلي (native) ما عندوش `issuer` ولا `contract` — هو عملة السلسلة نفسها.
- في رد الـ API يظهر دائماً `"asset_type": "native"` بدون أي وسيلة تعريف.
- وبالتالي كل الوحدات قابلة للاستبدال ببعضها 1:1 (fungible by design).

### السبب 2 — البلوكشين ما يتتبّعش «مصدر العملة» (No provenance / No taint)
- السلسلة تسجّل **الأرصدة (balances)**، مو الـ«حبات» المنفردة.
- يعني مثل الحساب البنكي: بعد ما يدخل مبلغ، ما تقدرش تقول «هذي الفلوس جات من الراتب ولا من البيع».
- حتى لو تبعت كل المعاملات من البداية، النتيجة نفسها: الوحدات قابلة للتبادل ولا تحمل «هوية مصدر».

### السبب 3 — Pi المُعدَّن بعد الترحيل = نفس الأصل
- رصيد التعدين (mobile balance) يبقى **خارج السلسلة** حتى الهجرة (migration).
- بعد ما يهاجر، يصبح **native π** على Mainnet — نفس الأصل بالضبط.
- فبعد الترحيل ما فيه أي فرق بينه وبين أي π ثانية.

### السبب 4 — Pi على المنصّات (OKX / Bitget) = نفس الأصل
- المنصّات تحتفظ بـ**عناوين Pi wallets** على **نفس البلوكشين**.
- الإيداع والسحب عبارة عن **تحويل native عادي** (payment من عنوان لعنوان).
- لما تسحب، توصلك حبات native ما فيها أي وسم «منصّة». والمنصّة نفسها لما تستلم منك، ما تفرّقش.

### السبب 5 — التطبيقات داخل Pi Browser + Pi Wallet SDK
- أي تطبيق في Pi Browser عندو **عنوان Pi wallet** خاص بيه.
- لما شخص يبعتلو π، التطبيق يشوف **دفعة native عادية** — مبلغ، وعنوان المرسل، ومذكرة (memo) اختيارية.
- الـ **Pi Wallet SDK** ما يعطيكش أي معلومة عن «مصدر» العملة، ولا يقدر يفرّق بين معدّن/منصّة/تطبيق.
- النتيجة: من داخل التطبيق ما تقدرش تعرف من وين جات الـπ، غير من عنوان المرسل.

### السبب 6 — الشي الوحيد المُفرِّق هو العنوان/المذكرة، مو «العملة»
- تقدر تعرف **مين بعت** (source account) و **المذكرة (memo)**.
- لكن ما تقدرش تعرف **أي حبة** من الرصيد جات من وين — لأن الأرصدة تندمج في pool واحد.

---

## 3) الحدود والاستثناءات (Boundaries / Counterpoints)

مهم نكون دقيقين — فيه حالات معينة **لها فرق**، لكن الفرق مو «مصدر العملة»:

| الحالة | الفرق الحقيقي |
|---|---|
| **قفل / Lockup** | الـπ المقفولة تظهر كـ `claimable_balance` (لها predicate زمني)، وليست `native`. فرق **حالة**، مو فرق أصل. |
| **رصيد التعدين غير المُهاجر** | أصلاً مو على السلسلة (mobile balance) → قبل vs بعد. |
| **IOU / توكين وسيط على منصّة** | بعض المنصّات قد تعرض «Pi» وهمي أو IOU قبل الإيداع الفعلي على الشبكة. هذا **مو native π**، وممكن يتفكّك أو ما يُسحبش. |
| **أصول أخرى (trustlines)** | لو فيه أصل غير native، يظهر بـ `asset_code/issuer`. غير هذا، ما فيه. |

> الخلاصة: الأصل الـ native الواحد = fungible. أي تمييز حقيقي يكون في **الحالة** (مقفول/سائل/خارج الشبكة) أو في **نوع الأصل** (native vs token)، ومو في «تاريخ التعدين».

---

## 4) النتائج (Implications)

1. **القيمة واحدة** — ما فيه فرق سعري بسبب المصدر؛ السوق يحدّد السعر، مو المنشأ.
2. **لا يمكن الفصل أو الوسم (no segregation/taint)** — ما فيه طريقة تقنية تفصل π «نظيفة» من π «من منصّة».
3. **أمان وثقة** — أي تطبيق/شخص يستلم π، المبلغ يندمج في رصيدو فوراً. ما فيه رجوع إلا بتعاون الطرف الآخر (إلا في claimable balances). الثقة تكون في **العنوان/المذكرة**، مو في «نوع العملة».
4. **احذروا الـ IOU** — أهم نقطة عملية: «رقم π» على منصّة أو تطبيق ليس بالضرورة native π على السلسلة. تحقّق دائماً من البلوكشين.

---

## 5) كيف تتأكدّ على السلسلة (On-chain verification)

الـ API العام:
```
https://api.mainnet.minepi.com
```

| عملية | الرابط |
|---|---|
| حساب + رصيده السائل | `GET /accounts/<G_ADDRESS>` |
| الأقفال (claimable balances) | `GET /claimable_balances?claimant=<G_ADDRESS>` |
| العمليات | `GET /accounts/<G_ADDRESS>/operations?order=desc&limit=30` |

- الأصل الأصلي يظهر `"asset_type": "native"` — بدون أي `issuer`.
- ما فيه أي حقل يوصف «مصدر» الوحدات.

الصيغة المفيدة (الحد الأدنى المحجوز):
```
المتاح = السائل − (2 + subentries + sponsoring − sponsored) × 0.5
```

---

## English Summary

On the Pi Mainnet (a Stellar fork), **Pi is the native asset**: it has no issuer and no contract, and all units are fully fungible. The ledger tracks **balances, not coins**, so there is **no provenance / no taint** — you cannot tell whether a given Pi was mined, withdrawn from an exchange (OKX/Bitget), or received inside a Pi Browser app.

- Exchanges hold Pi in Pi wallets on the same chain → deposits/withdrawals are ordinary native payments.
- The **Pi Wallet SDK** only exposes an incoming native payment (amount + source address + memo); it cannot distinguish the "origin" of the coins.
- The only real on-chain distinctions are **state** (locked `claimable_balance` vs liquid `native`) and **asset type** (native vs token/IOU) — never mining history.

**Practical takeaway:** a "Pi number" shown by a platform or third-party app is not necessarily real native Pi. Always verify against the chain.

---

## License
MIT — للاستعمال الحر.
