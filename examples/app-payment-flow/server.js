/**
 * server.js — the app backend (Node + Express)
 * Source: https://docs.minepi.com/accept-payment/Payments
 *
 * The proof:
 *   After a payment completes, the backend calls GET /v2/payments/{paymentId} and receives the
 *   returned PaymentDTO. This is the complete response — and we print its keys — to show it
 *   contains no "origin" field whatsoever.
 *
 * ⚠️ Note: PI_API_KEY is server-only — never put it in the frontend.
 *
 * Usage:
 *   npm i express
 *   PI_API_KEY=xxx node examples/app-payment-flow/server.js
 */

const express = require("express");
const app = express();
app.use(express.json());

const PI_API_BASE = "https://api.minepi.com/v2";
const PI_API_KEY = process.env.PI_API_KEY; // <-- from the Pi Developer Portal

// -- Backend authentication -------------------------------------------------
const piHeaders = () => ({ Authorization: `Key ${PI_API_KEY}` });

// -- Approve the payment (Phase I) ------------------------------------------
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

// -- Complete the payment (Phase III) + print the PaymentDTO fields ----------
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
      // This is the complete data the app has about the payment:
      console.log("\n===== Full PaymentDTO from the Platform API =====");
      console.dir(payment, { depth: null });

      const keys = Object.keys(payment);
      console.log("\nAvailable fields:", keys.join(", "));
      console.log(
        "\n🚫 Is there an origin field (origin/mining/exchange)? ->",
        ["origin", "source", "mining", "exchange", "provenance"].some((k) => keys.includes(k))
          ? "Yes"
          : "No - not present"
      );
      console.log(
        "👉 The app sees only: amount + from_address + to_address + memo + txid."
      );
      console.log(
        "👉 It cannot know: whether the pi was mined or withdrawn from OKX/Bitget.\n"
      );

      // Deliver the digital product only after confirmation, here.
    }

    res.status(r.status).json(payment);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
