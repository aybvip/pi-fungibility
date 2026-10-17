#!/usr/bin/env node
/**
 * provenance-check.mjs
 * ---------------------------------------------------------------------------
 * يفحص معاملة على بلوكشين Pi Mainnet ويبيّن بالضبط:
 *   - شنو ينفع أي تطبيق/منصّة تعرفو (amount, from, to, asset_type, memo)
 *   - شنو ما ينفعش تعرفو (مصدر العملة: تعدين؟ منصّة؟ تطبيق؟)
 *
 * بلا أي اعتماديات (يستعمل fetch الأصلي في Node 18+).
 *
 * التشغيل:
 *   node examples/provenance-check.mjs
 *   node examples/provenance-check.mjs <TRANSACTION_HASH>
 * ---------------------------------------------------------------------------
 */

const BASE = "https://api.mainnet.minepi.com";

// معاملة حقيقية على Pi Mainnet (payment بحجم 0.8 Pi) كنموذج افتراضي.
const DEFAULT_TX =
  "e0916b2f64bef9da8ac6c2e784a98e48102637a77654a1a73055cb2b6927914c";

const txid = process.argv[2] || DEFAULT_TX;

async function api(path) {
  const res = await fetch(BASE + path, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} -> ${path}`);
  return res.json();
}

const rule = () => console.log("─".repeat(72));

async function main() {
  console.log("\n🔎  Pi Mainnet — Coin Provenance Check");
  console.log("    txid:", txid);
  rule();

  const tx = await api(`/transactions/${txid}`);
  console.log("📄  Transaction");
  console.log("    hash       :", tx.hash);
  console.log("    ledger     :", tx.ledger);
  console.log("    source     :", tx.source_account);
  console.log("    memo       :", tx.memo_type, tx.memo ? JSON.stringify(tx.memo) : "—");
  console.log("    successful :", tx.successful);
  rule();

  const ops = await api(`/transactions/${txid}/operations`);
  const records = ops._embedded.records;
  console.log(`⚙️   Operations (${records.length})`);
  for (const op of records) {
    console.log("    type        :", op.type);
    if (op.type === "payment") {
      console.log("      from      :", op.from);
      console.log("      to        :", op.to);
      console.log("      amount    :", op.amount);
      const kind = op.asset_type === "native"
        ? 'native  (Pi — no issuer, cannot be traced to an origin)'
        : `${op.asset_code}/${op.asset_issuer}  (custom token)`;
      console.log("      asset     :", kind);
    }
  }
  rule();

  console.log("✅  ما ينفع أي تطبيق/منصّة تعرفو (Available to the app):");
  console.log("      • المبلغ (amount)");
  console.log("      • عنوان المرسل (from_address)");
  console.log("      • عنوان المستلم (to_address)");
  console.log("      • المذكرة (memo)");
  console.log("      • معرّف المعاملة (txid)");
  console.log('      • نوع الأصل = "native"');
  rule();

  console.log("🚫  ما ينفعش تعرفو إطلاقاً (NOT available — impossible):");
  console.log("      • هل العملة معدّنة أم مسحوبة من OKX/Bitget");
  console.log("      • أي \"مصدر\" أو \"وسم\" أو \"taint\" للعملة");
  console.log("      • تاريخ التعدين لكل وحدة");
  console.log("      ← لأنه ببساطة ما فيه هك الحقل لا في السلسلة ولا في الـ SDK.");
  rule();
  console.log("");
}

main().catch((err) => {
  console.error("\n❌ ERROR:", err.message);
  process.exit(1);
});
