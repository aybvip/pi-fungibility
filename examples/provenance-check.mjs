#!/usr/bin/env node
/**
 * provenance-check.mjs
 * ---------------------------------------------------------------------------
 * Inspects a transaction on the Pi Mainnet blockchain and shows exactly:
 *   - what any app/exchange CAN know (amount, from, to, asset_type, memo)
 *   - what it CANNOT know (the coin's origin: mined? exchange? app?)
 *
 * Zero dependencies (uses Node's built-in fetch, Node 18+).
 *
 * Usage:
 *   node examples/provenance-check.mjs
 *   node examples/provenance-check.mjs <TRANSACTION_HASH>
 * ---------------------------------------------------------------------------
 */

const BASE = "https://api.mainnet.minepi.com";

// A real Pi Mainnet transaction (a 0.8 Pi payment) as the default sample.
const DEFAULT_TX =
  "e0916b2f64bef9da8ac6c2e784a98e48102637a77654a1a73055cb2b6927914c";

const txid = process.argv[2] || DEFAULT_TX;

async function api(path) {
  const res = await fetch(BASE + path, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} -> ${path}`);
  return res.json();
}

const rule = () => console.log("-".repeat(74));

async function main() {
  console.log("\n🔎  Pi Mainnet — Coin Provenance Check");
  console.log("    txid:", txid);
  rule();

  const tx = await api(`/transactions/${txid}`);
  console.log("📄  Transaction");
  console.log("    hash       :", tx.hash);
  console.log("    ledger     :", tx.ledger);
  console.log("    source     :", tx.source_account);
  console.log("    memo       :", tx.memo_type, tx.memo ? JSON.stringify(tx.memo) : "-");
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
        ? 'native  (Pi - no issuer, cannot be traced to an origin)'
        : `${op.asset_code}/${op.asset_issuer}  (custom token)`;
      console.log("      asset     :", kind);
      // Muxed fields (CAP-27): identify the *counterparty* only, never the coin's origin.
      // (Stellar: muxed accounts don't exist on the ledger.)
      if (op.from_muxed) console.log("      from(M)   :", op.from_muxed, "#", op.from_muxed_id);
      if (op.to_muxed) console.log("      to(M)     :", op.to_muxed, "#", op.to_muxed_id);
    }
  }
  rule();

  console.log("✅  What any app/exchange CAN see:");
  console.log("      • amount");
  console.log("      • sender address (from_address)");
  console.log("      • recipient address (to_address)");
  console.log("      • memo");
  console.log("      • transaction id (txid)");
  console.log('      • asset type = "native"');
  rule();

  console.log("🚫  What it CANNOT know (impossible):");
  console.log("      • whether the coin was mined or withdrawn from OKX/Bitget");
  console.log('      • any "origin", "tag" or "taint" of the coin');
  console.log("      • a mining date per unit");
  console.log("      <- simply because no such field exists on-chain or in the SDK.");
  rule();
  console.log("ℹ️  Note on M addresses (Muxed Accounts, CAP-27):");
  console.log("      • M = a G address + a number; it does not exist on the ledger (only G is real).");
  console.log("      • The network treats it exactly as if no muxing were used (same native pi).");
  console.log("      • If from_muxed/to_muxed appear, they identify the counterparty only,");
  console.log("        not the coin's origin. Differentiation remains impossible.");
  rule();
  console.log("");
}

main().catch((err) => {
  console.error("\n❌ ERROR:", err.message);
  process.exit(1);
});
