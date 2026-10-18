# الفهرس — كل ملف، وأي سؤال يجاوب

🌍 [English](INDEX.md) · **العربية**

خريطة المستودع. طبقتين:
- **الجزء 1 — حسب الملف** (شنوّة كل ملف).
- **الجزء 2 — حسب السؤال** (لقّي جواب اعتراض معيّن).

كل وثيقة موجودة **بالإنجليزية** و**بالعربية** (`*.ar.md`).

---

## الجزء 1 — حسب الملف

### الجذر
| الملف | شنوّة هو |
|---|---|
| [`README.ar.md`](../README.ar.md) · [`README.md`](README.md) | **ابدأ من هنا.** الخلاصة، المصادر الرسمية، البرهان 3 طبقات، جدول الأسئلة، النطاق، الكود |
| [`PROOF.ar.md`](../PROOF.ar.md) · [`PROOF.md`](../PROOF.md) | البرهان خطوة بخطوة إنّ صاحب التطبيق ما يعرفش منين جاءت الـπ |
| [`docs/SCOPE.ar.md`](SCOPE.ar.md) · [`SCOPE.md`](SCOPE.md) | **النطاق الدقيق:** شنوّة مثبت مقابل **شنوّة موش مدّعى** (+ تحقّق مستقل) |
| [`AUDIT-REQUEST.ar.md`](AUDIT-REQUEST.ar.md) · [`AUDIT-REQUEST.md`](AUDIT-REQUEST.md) | **حالة التدقيق:** موش مدقّق من طرف ثالث — شنوّة يعني هذا، وكيفاش تدير واحد |
| [`CONTRIBUTING.ar.md`](../CONTRIBUTING.ar.md) · [`CONTRIBUTING.md`](../CONTRIBUTING.md) | كيفاش تساهم: بلّغ على الأخطاء، قواعد ثنائي اللغة/بلا مكتبات، زيد سؤال |
| [`THREAT-MODEL.ar.md`](THREAT-MODEL.ar.md) · [`THREAT-MODEL.md`](THREAT-MODEL.md) | **نموذج التهديد:** الأصول، الفاعلون، القدرات، فرضيات الثقة، الهجمات، برّا النطاق |
| [`SECURITY.ar.md`](../SECURITY.ar.md) · [`SECURITY.md`](../SECURITY.md) | للقراءة فقط: بلا محفظة/عبارة/مفاتيح/توقيع/مكتبات؛ كيفاش تفحص |
| [`DISCLAIMER.ar.md`](../DISCLAIMER.ar.md) · [`DISCLAIMER.md`](../DISCLAIMER.md) | مستقل وغير رسمي؛ بلا نصيحة مالية؛ بلا وصاية؛ بلا ضمان |
| [`SOURCES.ar.md`](SOURCES.ar.md) · [`SOURCES.md`](SOURCES.md) | كل المصادر الرسمية بالاقتباسات الحرفية (§1–§16) |
| [`LICENSE`](../LICENSE) | MIT |

### Docs — أسئلة (سؤال لكل اعتراض)
| الملف | السؤال اللي يجاوب عليه |
|---|---|
| [`FAQ-RECIPIENT-CANNOT-TELL.ar.md`](FAQ-RECIPIENT-CANNOT-TELL.ar.md) · [EN](FAQ-RECIPIENT-CANNOT-TELL.md) | **«خلطت معدَّنة + مشرية وبعثت — المُرْسَل إليه ينجّم يشوف الفرق؟»** (برهان حتمي) |
| [`FAQ-CAN-CORE-TEAM-SET-PRICE.ar.md`](FAQ-CAN-CORE-TEAM-SET-PRICE.ar.md) · [EN](FAQ-CAN-CORE-TEAM-SET-PRICE.md) | **«الفريق ينجّم يفرض سعر مختلف/يمنع البيع؟»** (لا — على السلسلة) |
| [`FAQ-EXCHANGE-DEPOSIT-VERIFY.ar.md`](FAQ-EXCHANGE-DEPOSIT-VERIFY.ar.md) · [EN](FAQ-EXCHANGE-DEPOSIT-VERIFY.md) | **«رصيد المنصّة مدعوم؟»** → 3 ادّعاءات: A مثبت، B يُتحقّق، C موش مدّعى |
| [`FAQ-MICRO-PI-ID.ar.md`](FAQ-MICRO-PI-ID.ar.md) · [EN](FAQ-MICRO-PI-ID.md) | «كل micro-π عندها ID» |
| [`FAQ-MUXED-M-VS-G.ar.md`](FAQ-MUXED-M-VS-G.ar.md) · [EN](FAQ-MUXED-M-VS-G.md) | «المنصّات تستعمل عناوين `M` موش `G`» |
| [`MICA-WHITEPAPER.ar.md`](MICA-WHITEPAPER.ar.md) · [EN](MICA-WHITEPAPER.md) | «ورقة MiCA تقول Pi من التعدين برك» |
| [`FAQ-DONT-BUY-PI.ar.md`](FAQ-DONT-BUY-PI.ar.md) · [EN](FAQ-DONT-BUY-PI.md) | «Pi قالوا *ما تشريش Pi*» (Enclosed Mainnet؛ خلصت 2025-02-20) |
| [`FAQ-FUNGIBILITY-VS-PRICE.ar.md`](FAQ-FUNGIBILITY-VS-PRICE.ar.md) · [EN](FAQ-FUNGIBILITY-VS-PRICE.md) | «نفس العملة ≠ نفس السعر» |
| [`FAQ-UNOFFICIAL-REPO-SCAM.ar.md`](FAQ-UNOFFICIAL-REPO-SCAM.ar.md) · [EN](FAQ-UNOFFICIAL-REPO-SCAM.md) | «مستودع GitHub عشوائي = نصب/تصيّد» |
| [`FAQ-ALL-OBJECTIONS.ar.md`](FAQ-ALL-OBJECTIONS.ar.md) · [EN](FAQ-ALL-OBJECTIONS.md) | الفهرس الكامل لكل الاعتراضات المتبقية (مجموعات A–E) |

### Examples — براهين قابلة للتشغيل (بلا مكتبات)
| الملف | شنوّة يدير |
|---|---|
| [`provenance-check.mjs`](../examples/provenance-check.mjs) | يقرا معاملة حقيقية على السلسلة؛ يوريك **ما فماش خانة مصدر** |
| [`coin-id-check.mjs`](../examples/coin-id-check.mjs) | يوريك الرصيد **رقم واحد** — بلا ID لكل وحدة |
| [`verify-deposit.mjs`](../examples/verify-deposit.mjs) | يتحقّق إنّ تحويلًا **معيّنًا** دفعة Pi أصلية على Mainnet (الادّعاء B) |
| [`self-test.mjs`](../examples/self-test.mjs) | اختبارات آلية: بلا شبكة (قاعدة نفس العملية، بوّابة المعاملة الفاشلة) + أونلاين |
| [`model-check.mjs`](../examples/model-check.mjs) | نموذج سجلّ تنفيذي + فحص خصائص (2000 بذرة، بلا شبكة): حالة رقم واحد، «تاريخ→حالة» مش تعاكسية |
| [`exhaustive-check.mjs`](../examples/exhaustive-check.mjs) | فحص استنفادي محدود (بلا شبكة): يعدّد كل 1452 تاريخ؛ إخفاء المصدر لكل واحد |
| [`run-all.mjs`](../examples/run-all.mjs) | يشغّل كل الفحوصات ويطبع ملخّص (`--offline` لتخطّي الشبكة) |
| [`lib.mjs`](../examples/lib.mjs) | مساعدات مشتركة: عميل API متين (يعرض الحالة + الجسم عند الخطأ) وتحقيق صيغ strkey |
| [`regenerate-snapshots.mjs`](../examples/regenerate-snapshots.mjs) | أداة صيانة: تعيد كتابة لقطات `*-output.txt` كـUTF-8/LF نظيف |
| [`mixing-check.mjs`](../examples/mixing-check.mjs) | عرض حيّ: خلط → رصيد رقم واحد → دفعة **بلا مصدر** |
| [`app-payment-flow/frontend.html`](../examples/app-payment-flow/frontend.html) | مسار `Pi.createPayment` الرسمي (U2A) |
| [`app-payment-flow/server.js`](../examples/app-payment-flow/server.js) | سيرفر يعالج `PaymentDTO`؛ يطبع مفاتيحه |
| [`payment-dto-sample.json`](../examples/payment-dto-sample.json) | عيّنة `PaymentDTO` توري الخانة الناقصة (المصدر) |
| `*-output.txt` | مخرجات السكربتات المحفوظة (النتائج المتوقّعة) |

---

## الجزء 2 — حسب السؤال

| الاعتراض / السؤال | وين تلقى |
|---|---|
| هل Pi معدَّنة وPi منصّة نفس الشي؟ | [`README.ar.md`](../README.ar.md) الخلاصة · [`PROOF.ar.md`](../PROOF.ar.md) |
| المُرْسَل إليه ينجّم يفرّق (بعد الخلط)؟ | [`FAQ-RECIPIENT-CANNOT-TELL.ar.md`](FAQ-RECIPIENT-CANNOT-TELL.ar.md) |
| موش شبكة المعاملات تكشف المصدر؟ | [`SCOPE.ar.md`](SCOPE.ar.md) §4 · [`FAQ-RECIPIENT-CANNOT-TELL.ar.md`](FAQ-RECIPIENT-CANNOT-TELL.ar.md) §3 |
| كل micro-π عندها ID؟ | [`FAQ-MICRO-PI-ID.ar.md`](FAQ-MICRO-PI-ID.ar.md) |
| المنصّات تستعمل `M` موش `G`؟ | [`FAQ-MUXED-M-VS-G.ar.md`](FAQ-MUXED-M-VS-G.ar.md) |
| الفريق ينجّم يفرض سعر مختلف/يمنع البيع؟ | [`FAQ-CAN-CORE-TEAM-SET-PRICE.ar.md`](FAQ-CAN-CORE-TEAM-SET-PRICE.ar.md) |
| رصيد المنصّة مدعوم فعلاً؟ | [`FAQ-EXCHANGE-DEPOSIT-VERIFY.ar.md`](FAQ-EXCHANGE-DEPOSIT-VERIFY.ar.md) |
| ورقة MiCA تقول «من التعدين برك»؟ | [`MICA-WHITEPAPER.ar.md`](MICA-WHITEPAPER.ar.md) |
| «Pi قالوا ما تشريش Pi»؟ | [`FAQ-DONT-BUY-PI.ar.md`](FAQ-DONT-BUY-PI.ar.md) |
| نفس العملة بسعر مختلف؟ | [`FAQ-FUNGIBILITY-VS-PRICE.ar.md`](FAQ-FUNGIBILITY-VS-PRICE.ar.md) |
| هذا المستودع نصب/تصيّد؟ | [`FAQ-UNOFFICIAL-REPO-SCAM.ar.md`](FAQ-UNOFFICIAL-REPO-SCAM.ar.md) · [`SECURITY.ar.md`](../SECURITY.ar.md) · [`DISCLAIMER.ar.md`](../DISCLAIMER.ar.md) |
| شنوّة مثبت بالضبط — وشنوّة لا؟ | [`SCOPE.ar.md`](SCOPE.ar.md) |
| هل تمّ تدقيقه من طرف ثالث؟ | [`AUDIT-REQUEST.ar.md`](AUDIT-REQUEST.ar.md) |
| شكون ينجّم يهاجم، وشنوّة نفترضوا؟ | [`THREAT-MODEL.ar.md`](THREAT-MODEL.ar.md) |
| أي اعتراض آخر (قفل، KYC، حوكمة…)؟ | [`FAQ-ALL-OBJECTIONS.ar.md`](FAQ-ALL-OBJECTIONS.ar.md) |
| أي مصادر رسمية تسند كل هذا؟ | [`SOURCES.ar.md`](SOURCES.ar.md) |

---

## الجزء 3 — شغّل البراهين

```bash
node examples/run-all.mjs            # كل شي مرّة وحدة (+ ملخّص)؛ زيد --offline لتخطّي الشبكة

node examples/self-test.mjs          # اختبارات وحدة بلا شبكة + أونلاين (21 فحص)
node examples/model-check.mjs        # نموذج سجلّ + فحص خصائص بلا شبكة (2000 بذرة)
node examples/exhaustive-check.mjs   # فحص استنفادي محدود بلا شبكة (كل 1452 تاريخ)
node examples/provenance-check.mjs
node examples/coin-id-check.mjs
node examples/verify-deposit.mjs <TXID> [عنوان_المستلم]
node examples/mixing-check.mjs
node examples/mixing-check.mjs <حساب_المُرسِل>
```
Node 18+ · **بلا مكتبات** · **للقراءة فقط** (شوف [`SECURITY.ar.md`](../SECURITY.ar.md)).

---

> **π = π.** مثبت: الدفعة ما فيهاش **مصدر لكل عملة، مرصود**.
> موش مدّعى: السعر، إخفاء الهوية، تكافؤ IOU، تغطية الاحتياطي، تدقيق مستقل.
> شوف [`SCOPE.ar.md`](SCOPE.ar.md) · [`AUDIT-REQUEST.ar.md`](AUDIT-REQUEST.ar.md).
