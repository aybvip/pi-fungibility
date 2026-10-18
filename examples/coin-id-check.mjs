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
 *   node examples/coin-id-check.mjs --help
 * ---------------------------------------------------------------------------
 */

import { api, rule, isGAddress, isMAddress, usageAndExit } from "./lib.mjs";

const DEFAULT_ACCOUNT =
  "GC55LFCTGSDPDMNDIOHZVVA4CYCUF4IKI2SUGHWCJA2PCLPKH4HMDMIU";

const HELP = [
  "coin-id-check.mjs — does every unit (micro-pi) have its own ID? (No.)",
  "",
  "Usage:",
  "  node examples/coin-id-check.mjs                 # built-in sample account",
  "  node examples/coin-id-check.mjs <G_ACCOUNT>     # a public G... account id",
  "  node examples/coin-id-check.mjs --help",
  "",
  "Note: an M... muxed address cannot be queried directly — use its G account.",
  "Read-only. No wallet, no keys. Node 18+.",
];

const argv = process.argv.slice(2);
if (argv.includes("--help") || argv.includes("-h")) usageAndExit(HELP, 0);

const arg = argv[0];
if (arg && isMAddress(arg)) {
  usageAndExit([
    `✗ ${arg} is a muxed (M...) address; the ledger only stores the underlying G... account.`,
    "  Re-run with that G... account (or omit the argument for the sample).",
  ]);
}
if (arg && !isGAddress(arg)) {
  usageAndExit([`✗ invalid account: ${arg}`, "", ...HELP]);
}
const ACCOUNT = arg || DEFAULT_ACCOUNT;

async function main() {
  console.log("\n🪙  Pi / Stellar — does every unit (micro-pi) have its own ID?");
  console.log("    account:", ACCOUNT);
  rule();

  // 1) Balance: just one number - no list of pieces, no IDs.
  const acc = await api(`/accounts/${ACCOUNT}`);
  const balances = Array.isArray(acc.balances) ? acc.balances : [];
  console.log("📦  raw balances (straight from the chain):");
  console.log(JSON.stringify(balances, null, 2));
  rule();

  const native = balances.find((b) => b.asset_type === "native");
  if (!native) {
    console.log("🧮  Native balance (native pi):");
    console.log("      (none — this account holds no native Pi)");
  } else {
    console.log("🧮  Native balance (native pi):");
    console.log(`      balance = "${native.balance}"   <- a single number only`);
    console.log("      <- no array of pieces, no per-unit ID, no txid for each pi.");
  }
  rule();

  // 2) Operations: amounts are plain scalars, not references to pieces.
  const ops = await api(`/accounts/${ACCOUNT}/operations?order=desc&limit=5`);
  const records = ops?._embedded?.records ?? [];
  console.log("🔁  Last 5 operations (amounts are plain scalars):");
  if (records.length === 0) console.log("      (no operations)");
  for (const op of records) {
    const amt = op.amount
      ? `${op.amount} ${op.asset_type === "native" ? "pi" : op.asset_code}`
      : op.type;
    console.log(`      id=${op.id}  type=${op.type}  amount=${amt}`);
  }
  console.log("      <- this id identifies the *operation*, not a *coin*.");
  rule();

  // 3) The IDs that actually exist - and what each identifies.
  console.log("🆔  IDs that really exist on Pi/Stellar (and their purpose):");
  console.log("      • G...   Account ID        -> identifies an *account*, not a piece");
  console.log("      • M...   Muxed Account ID  -> a *user inside a pooled account* (G + id)");
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
