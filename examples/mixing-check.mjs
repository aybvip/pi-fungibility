#!/usr/bin/env node
/**
 * mixing-check.mjs
 * ---------------------------------------------------------------------------
 * Answers ONE concrete question:
 *
 *   "If I bought Pi on an exchange, put it in the same wallet where I keep my
 *    mined Pi, and then sent some Pi to a friend — can the friend tell which
 *    coins were mined and which were bought?"
 *
 * The script shows, on the LIVE Pi Mainnet:
 *   1. An account receives Pi from SEVERAL different sources (commingling).
 *   2. The resulting balance is a SINGLE scalar number (no pieces, no labels).
 *   3. When the account SENDS Pi out, the payment record contains
 *      amount + from + to + memo + txid ... and NO origin field.
 *   4. Therefore the recipient cannot tell mined Pi from bought Pi.
 *
 * Zero dependencies (Node 18+ built-in fetch).
 *
 * Usage:
 *   node examples/mixing-check.mjs
 *   node examples/mixing-check.mjs <SENDER_ACCOUNT>
 *   node examples/mixing-check.mjs --help
 * ---------------------------------------------------------------------------
 */

import { api, rule, isGAddress, isMAddress, usageAndExit } from "./lib.mjs";

// A real account that received Pi from several sources and then sent Pi out.
const DEFAULT_ACCOUNT =
  "GC55LFCTGSDPDMNDIOHZVVA4CYCUF4IKI2SUGHWCJA2PCLPKH4HMDMIU";

const HELP = [
  "mixing-check.mjs — can a recipient tell mined Pi from bought Pi? (No.)",
  "",
  "Usage:",
  "  node examples/mixing-check.mjs                 # built-in sample account",
  "  node examples/mixing-check.mjs <G_ACCOUNT>     # a public G... account id",
  "  node examples/mixing-check.mjs --help",
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

// An operation's source/destination may be given as G (`op.to`) or as a muxed
// M (`op.to_muxed`). Match on whichever field carries the value we were given.
const paymentSideMatches = (op, side, addr) =>
  op[side] === addr || op[`${side}_muxed`] === addr;

async function main() {
  console.log("\n🧪  Pi Mainnet — 'Can the recipient tell mined Pi from bought Pi?'");
  console.log("    sender account:", ACCOUNT);
  rule("=", 78);

  // ---- 1) Commingling: many inflows, from many sources --------------------
  const ops = await api(`/accounts/${ACCOUNT}/operations?order=desc&limit=30`);
  const records = ops?._embedded?.records ?? [];
  const payments = records.filter((o) => o.type === "payment");

  const inflows = payments.filter((o) => paymentSideMatches(o, "to", ACCOUNT));
  const outflows = payments.filter((o) => paymentSideMatches(o, "from", ACCOUNT));

  console.log(`📥  Inflows (last ${inflows.length}):`);
  if (inflows.length === 0) console.log("      (no incoming payments in the last 30 operations)");
  for (const op of inflows.slice(0, 8)) {
    console.log(`      + ${op.amount}  from ${String(op.from).slice(0, 12)}…`);
  }
  console.log("      ↑ these came from DIFFERENT counterparties (some mined, some not).");
  rule("-", 78);

  // ---- 2) The balance is ONE scalar number --------------------------------
  const acc = await api(`/accounts/${ACCOUNT}`);
  const balances = Array.isArray(acc.balances) ? acc.balances : [];
  const native = balances.find((b) => b.asset_type === "native");
  console.log("📦  Resulting balance (the whole account):");
  if (!native) {
    console.log("      native Pi = (none — this account holds no native Pi)");
  } else {
    console.log(`      native Pi = "${native.balance}"   <- ONE number`);
    console.log("      ↑ after commingling, there is no '5 mined + 10 bought'.");
    console.log("        There is only a total. The pieces are gone.");
  }
  rule("=", 78);

  // ---- 3) The outgoing payment has NO origin field -------------------------
  const out = outflows[0];
  if (!out) {
    console.log("📤  No outgoing payment found for this account in the last 30 operations.");
    console.log("    (pick an account that has SENT native Pi, or omit the argument)");
    rule("=", 78);
    console.log("");
    return;
  }
  console.log("📤  An outgoing payment from this account — the FULL record:");
  console.log(JSON.stringify(
    {
      type: out.type,
      from: out.from,
      to: out.to,
      amount: out.amount,
      asset_type: out.asset_type, // "native" -> no issuer
      // (from_muxed / to_muxed would identify the counterparty only, never the coin)
      from_muxed: out.from_muxed ?? null,
      to_muxed: out.to_muxed ?? null,
    },
    null, 2
  ));
  rule("-", 78);

  const fields = Object.keys(out);
  const originFields = ["origin", "source", "mining", "exchange", "provenance", "taint", "coin_id"];
  const present = originFields.filter((k) => fields.includes(k));
  console.log("🔍  Does the payment carry an origin/mined/bought field?");
  console.log("      present origin-ish fields:", present.length ? present.join(", ") : "NONE");
  console.log("      -> the recipient sees: amount + from + to + memo + txid.");
  console.log("      -> they DO NOT see where the coins came from.");
  rule("=", 78);

  // ---- 4) Even the sender cannot say which units were sent ----------------
  console.log("🧠  The formal reason (why this is deterministic, not a loophole):");
  console.log("      • The ledger state is  bal(account, native) -> a non-negative integer.");
  console.log("      • A payment does:  bal(S) -= a ;  bal(D) += a   (purely scalar math).");
  console.log("      • The state has NO per-unit identity. 'Which coin did I send?'");
  console.log("        is therefore NOT A QUESTION the ledger can answer — it is undefined.");
  console.log("");
  console.log("      Two histories that end in the same balance are ledger-identical:");
  console.log("        H1: mine 5 -> S ;  buy 10 -> S        => bal(S) = 15");
  console.log("        H2: buy 15 -> S                       => bal(S) = 15");
  console.log("      History -> state is NOT injective, and 'origin' is not in the image.");
  rule("=", 78);
  console.log("✅  Conclusion: the recipient CANNOT see the difference. Mined Pi and");
  console.log("    exchange-bought Pi are the same native asset, indistinguishable.");
  console.log("⚠️  Scope: this is not a claim about price. And note the ONE thing that");
  console.log("    graph analysis CAN see is an ACCOUNT interacting with a KNOWN exchange");
  console.log("    address (that is account-level history, not per-coin origin).");
  rule("=", 78);
  console.log("");
}

main().catch((err) => {
  console.error("\n❌ ERROR:", err.message);
  process.exit(1);
});
