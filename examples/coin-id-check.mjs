#!/usr/bin/env node
/**
 * coin-id-check.mjs
 * ---------------------------------------------------------------------------
 * يثبت إنّ بلوكشين Pi / Stellar ما عندهاش «معرّف لكل وحدة» (micro-π).
 *
 * النموذج المستعمل = Account / Balance  (رصيد رقمي واحد لكل حساب)
 *                    مو UTXO              (معرّف لكل قطعة نقدية)
 *
 * بلا أي اعتماديات (fetch الأصلي في Node 18+).
 *
 * التشغيل:
 *   node examples/coin-id-check.mjs
 *   node examples/coin-id-check.mjs <G_ACCOUNT>
 * ---------------------------------------------------------------------------
 */

const BASE = "https://api.mainnet.minepi.com";
const ACCOUNT =
  process.argv[2] || "GC55LFCTGSDPDMNDIOHZVVA4CYCUF4IKI2SUGHWCJA2PCLPKH4HMDMIU";

async function api(path) {
  const res = await fetch(BASE + path, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} -> ${path}`);
  return res.json();
}

const rule = () => console.log("─".repeat(74));

async function main() {
  console.log("\n🪙  Pi / Stellar — هل لكل وحدة (micro-π) معرّف خاص؟");
  console.log("    account:", ACCOUNT);
  rule();

  // 1) الرصيد: رقم واحد فقط — لا قائمة قطع ولا معرّفات.
  const acc = await api(`/accounts/${ACCOUNT}`);
  console.log("📦  raw balances (مباشرة من السلسلة):");
  console.log(JSON.stringify(acc.balances, null, 2));
  rule();

  const native = acc.balances.find((b) => b.asset_type === "native");
  console.log("🧮  الرصيد الأصلي (native π):");
  console.log(`      balance = "${native.balance}"   ← رقم واحد فقط`);
  console.log("      ← ما فيهش مصفوفة قطع، ولا معرّف لأي وحدة، ولا txid لكل π.");
  rule();

  // 2) العمليات: المبالغ أرقام مجرّدة (scalars)، مو مراجع لقطع.
  const ops = await api(`/accounts/${ACCOUNT}/operations?order=desc&limit=5`);
  console.log("🔁  آخر 5 عمليات (المبالغ مجرّدة):");
  for (const op of ops._embedded.records) {
    const amt = op.amount ? `${op.amount} ${op.asset_type === "native" ? "π" : op.asset_code}` : op.type;
    console.log(`      id=${op.id}  type=${op.type}  amount=${amt}`);
  }
  console.log("      ← الـid هنا معرّف *العملية*، مو معرّف *قطعة نقدية*.");
  rule();

  // 3) المعرّفات اللي توجد فعلاً — وشنو تعرّف.
  console.log("🆔  المعرّفات الموجودة فعلاً في Pi/Stellar (ومهمّتها):");
  console.log("      • G...   Account ID        → يعرّف *حساب*، مو قطعة");
  console.log("      • M...   Muxed Account ID  → يعرّف *مستخدم داخل حساب مجمّع*");
  console.log("      • C...   Contract ID       → يعرّف *عقد*");
  console.log("      • txid   Transaction Hash  → يعرّف *معاملة*");
  console.log("      • op.id  Operation ID      → يعرّف *عملية*");
  console.log("      • cb-id  Claimable Balance → يعرّف *صندوق رصيد مقفول* (مو قطعة)");
  console.log("      • ledger Ledger Sequence   → يعرّف *كتلة*");
  console.log("      ← مافيش أي واحد منهم = «معرّف وحدة π».");
  rule();

  // 4) الخلاصة.
  console.log("✅  الخلاصة:");
  console.log("      • Pi تستعمل نموذج Account/Balance (مثل بنك: رصيد = رقم).");
  console.log("      • ما فيهاش UTXO (مثل بيتكوين: معرّف لكل مخرج).");
  console.log("      • 1 π = 10,000,000 micro-π = مجرّد *خانة عشرية*، مو معرّف.");
  console.log("      • لذلك «كل micro-π عندها ID» غلط، والتفرقة بالمصدر مستحيلة.");
  rule();
  console.log("");
}

main().catch((err) => {
  console.error("\n❌ ERROR:", err.message);
  process.exit(1);
});
