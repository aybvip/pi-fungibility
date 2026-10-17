/**
 * server.js — باكند التطبيق (Node + Express)
 * المصدر: https://docs.minepi.com/accept-payment/Payments
 *
 * الدليل:
 *   بعد ما تكمّل الدفع، الباكند يعمل GET /v2/payments/{paymentId} ويرجّع PaymentDTO.
 *   هذا الردّ الكامل — ونطبع مفاتيحه — ليثبت أنه لا يحتوي أي حقل "مصدر".
 *
 * ⚠️ ملاحظة: PI_API_KEY سيرفر فقط — لا تكتبه في الفرونت.
 *
 * التشغيل:
 *   npm i express
 *   PI_API_KEY=xxx node examples/app-payment-flow/server.js
 */

const express = require("express");
const app = express();
app.use(express.json());

const PI_API_BASE = "https://api.minepi.com/v2";
const PI_API_KEY = process.env.PI_API_KEY; // <-- من Pi Developer Portal

// ── المصادقة على الباكند ────────────────────────────────────────────────────
const piHeaders = () => ({ Authorization: `Key ${PI_API_KEY}` });

// ── الموافقة على الدفع (Phase I) ────────────────────────────────────────────
app.post("/api/payments/approve", async (req, res) => {
  const { paymentId } = req.body;
  try {
    const r = await fetch(`${PI_API_BASE}/payments/${paymentId}/approve`, {
      method: "POST",
      headers: piHeaders(),
    });
    res.status(r.status).json(await r.json());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ── إكمال الدفع (Phase III) + طباعة حقول PaymentDTO ──────────────────────────
app.post("/api/payments/complete", async (req, res) => {
  const { paymentId, txid } = req.body;
  try {
    const r = await fetch(`${PI_API_BASE}/payments/${paymentId}/complete`, {
      method: "POST",
      headers: { ...piHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ txid }),
    });
    const payment = await r.json();

    if (r.ok) {
      // هذه هي البيانات الكاملة المتاحة للتطبيق عن الدفعة:
      console.log("\n===== PaymentDTO الكامل من Platform API =====");
      console.dir(payment, { depth: null });

      const keys = Object.keys(payment);
      console.log("\nالحقول المتوفرة:", keys.join(", "));
      console.log(
        "\n🚫 هل يوجد حقل للمصدر (origin/mining/exchange)؟ ->",
        ["origin", "source", "mining", "exchange", "provenance"].some((k) => keys.includes(k))
          ? "نعم"
          : "لا — غير موجود"
      );
      console.log(
        "👉 التطبيق يشوف فقط: amount + from_address + to_address + memo + txid."
      );
      console.log(
        "👉 ما يقدرش يعرف: هل الـπ معدّنة أم مسحوبة من OKX/Bitget.\n"
      );

      // هنا تسلّم المنتج الرقمي بعد التأكيد فقط
    }

    res.status(r.status).json(payment);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
