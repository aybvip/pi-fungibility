#!/usr/bin/env node
/**
 * coin-id-check.mjs
 * ---------------------------------------------------------------------------
 * Proves that the Pi / Stellar blockchain has NO per-unit (micro-pi) ID.
 *
 * The model is Account / Balance (a single numeric balance per account),
 * NOT UTXO (an ID per coin).
 *
 * Zero dependencies (uses Node's built-in fetch, Node 18+).
 *
 * Usage:
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

const rule = () => console.log("-".repeat(74));

async function main() {
  console.log("\n🪙  Pi / Stellar — does every unit (micro-pi) have its own ID?");
  console.log("    account:", ACCOUNT);
  rule();

  // 1) Balance: just one number - no list of pieces, no IDs.
  const acc = await api(`/accounts/${ACCOUNT}`);
  console.log("📦  raw balances (straight from the chain):");
  console.log(JSON.stringify(acc.balances, null, 2));
  rule();

  const native = acc.balances.find((b) => b.asset_type === "native");
  console.log("🧮  Native balance (native pi):");
  console.log(`      balance = "${native.balance}"   <- a single number only`);
  console.log("      <- no array of pieces, no per-unit ID, no txid for each pi.");
  rule();

  // 2) Operations: amounts are plain scalars, not references to pieces.
  const ops = await api(`/accounts/${ACCOUNT}/operations?order=desc&limit=5`);
  console.log("🔁  Last 5 operations (amounts are plain scalars):");
  for (const op of ops._embedded.records) {
    const amt = op.amount ? `${op.amount} ${op.asset_type === "native" ? "pi" : op.asset_code}` : op.type;
    console.log(`      id=${op.id}  type=${op.type}  amount=${amt}`);
  }
  console.log("      <- this id identifies the *operation*, not a *coin*.");
  rule();

  // 3) The IDs that actually exist - and what each identifies.
  console.log("🆔  IDs that really exist on Pi/Stellar (and their purpose):");
  console.log("      • G...   Account ID        -> identifies an *account*, not a piece");
  console.log("      • M...   Muxed Account ID  -> identifies a *user inside a pooled account*");
  console.log("      • C...   Contract ID       -> identifies a *contract*");
  console.log("      • txid   Transaction Hash  -> identifies a *transaction*");
  console.log("      • op.id  Operation ID      -> identifies an *operation*");
  console.log("      • cb-id  Claimable Balance -> identifies a *locked balance container* (not a piece)");
  console.log("      • ledger Ledger Sequence   -> identifies a *block*");
  console.log("      <- none of them is a 'pi unit ID'.");
  rule();

  // 4) Conclusion.
  console.log("✅  Conclusion:");
  console.log("      • Pi uses an Account/Balance model (like a bank: balance = a number).");
  console.log("      • It has no UTXO (like Bitcoin: an ID per output).");
  console.log("      • 1 pi = 10,000,000 micro-pi = merely a *decimal place*, not an ID.");
  console.log("      • So 'every micro-pi has an ID' is false, and origin differentiation is impossible.");
  rule();
  console.log("");
}

main().catch((err) => {
  console.error("\n❌ ERROR:", err.message);
  process.exit(1);
});
