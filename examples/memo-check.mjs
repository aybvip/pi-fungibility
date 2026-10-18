#!/usr/bin/env node
/**
 * memo-check.mjs
 * ---------------------------------------------------------------------------
 * Settles ONE narrow factual question, empirically, on the LIVE Pi Mainnet:
 *
 *   "Is the memo required for a Pi payment?"
 *
 *   No. It is optional, sender-written data.
 *
 * Why it matters: a common objection is that the `memo` field is a provenance
 * channel — the thing that tells a recipient (or an exchange) *where the Pi came
 * from*. Two independent facts defeat that:
 *
 *   1. `memo` is OPTIONAL. Real Mainnet transactions routinely carry none
 *      (`memo_type: "none"`). A field that is usually absent cannot be the
 *      channel through which every payment carries its origin.
 *
 *   2. When a memo IS present it is free text written by the SENDER. It has no
 *      validation, no standard vocabulary, and no tie to the ledger state. It
 *      is a note attached to a *transaction*, never a property of a *coin*.
 *
 * The script measures (1) directly and prints the shape of (2).
 *
 * Zero dependencies (Node 18+ built-in fetch). Read-only. GET only.
 *
 * Usage:
 *   node examples/memo-check.mjs
 *   node examples/memo-check.mjs --sample 400
 *   node examples/memo-check.mjs --help
 *
 * Exit 0 = at least one real Mainnet transaction carried no memo (optionality
 *          demonstrated). Exit 1 = the sample was inconclusive or the API failed.
 * ---------------------------------------------------------------------------
 */

import { api, rule } from "./lib.mjs";

// A real Pi Mainnet transaction that DOES carry a memo (the repo's sample tx).
const SAMPLE_TX_WITH_MEMO =
  "e0916b2f64bef9da8ac6c2e784a98e48102637a77654a1a73055cb2b6927914c";

const HELP = [
  "memo-check.mjs — is the memo required for a Pi payment? (No.)",
  "",
  "Usage:",
  "  node examples/memo-check.mjs                  # default sample (200 recent txs)",
  "  node examples/memo-check.mjs --sample 400     # larger sample (max 200 per page)",
  "  node examples/memo-check.mjs --help",
  "",
  "Read-only. No wallet, no keys. Node 18+.",
];

const argv = process.argv.slice(2);
if (argv.includes("--help") || argv.includes("-h")) {
  console.log(HELP.join("\n"));
  process.exit(0);
}

// --sample N  (N >= 1; the API pages at 200, so we walk pages when needed)
let wanted = 200;
const si = argv.indexOf("--sample");
if (si !== -1) {
  const v = Number(argv[si + 1]);
  if (!Number.isFinite(v) || v < 1) {
    console.error(`✗ --sample expects a positive number, got: ${argv[si + 1] ?? "(nothing)"}`);
    console.error("");
    console.error(HELP.join("\n"));
    process.exit(2);
  }
  wanted = Math.min(Math.floor(v), 1000);
}

/** Walk `/transactions` newest-first, collecting up to `n` records. */
async function collect(n) {
  const out = [];
  let cursor = null;
  while (out.length < n) {
    const page = Math.min(200, n - out.length);
    const path = cursor
      ? `/transactions?limit=${page}&order=desc&cursor=${encodeURIComponent(cursor)}`
      : `/transactions?limit=${page}&order=desc`;
    const body = await api(path);
    const recs = body?._embedded?.records ?? [];
    if (!recs.length) break;
    out.push(...recs);
    const next = body?._links?.next?.href;
    if (!next) break;
    // Horizon cursor = the paging_token of the last record.
    cursor = recs[recs.length - 1].paging_token;
    if (!cursor) break;
  }
  return out.slice(0, n);
}

// `memo_type: "none"` is the protocol's explicit, canonical way of saying
// "this transaction carries no memo". Use it as the criterion so the headline
// count and the memo_type breakdown can never disagree.
const noMemo = (tx) => (tx.memo_type ?? "none") === "none";

async function main() {
  console.log("\n📝  Pi Mainnet — Is the memo required?");
  rule();
  console.log("    question : is `memo` mandatory on a Pi payment?");
  console.log("    method   : sample real Mainnet transactions, count how many carry none");
  console.log("    network  : https://api.mainnet.minepi.com  (read-only)");
  rule();

  const txs = await collect(wanted);
  if (!txs.length) throw new Error("the API returned no transactions to sample");

  let none = 0;
  let some = 0;
  const byType = new Map();
  let exampleNone = null;

  for (const tx of txs) {
    const type = tx.memo_type ?? "(absent)";
    byType.set(type, (byType.get(type) ?? 0) + 1);
    if (noMemo(tx)) {
      none++;
      if (!exampleNone && tx.successful) exampleNone = tx;
    } else {
      some++;
    }
  }

  console.log(`📊  Sampled ${txs.length} real Mainnet transactions\n`);
  console.log(`      no memo  (memo_type "none") : ${none}`);
  console.log(`      memo present                : ${some}`);
  console.log("");
  console.log("    memo_type breakdown:");
  for (const [t, c] of [...byType.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`      ${String(t).padEnd(8)} : ${c}`);
  }
  rule();

  if (exampleNone) {
    console.log("🔎  A concrete example WITH NO MEMO (a real, successful payment):");
    console.log("      txid        :", exampleNone.id);
    console.log("      memo        :", JSON.stringify(exampleNone.memo));
    console.log("      memo_type   :", JSON.stringify(exampleNone.memo_type));
    console.log("      successful  :", exampleNone.successful);
    console.log("      ledger      :", exampleNone.ledger);
    console.log("      fee_charged :", exampleNone.fee_charged);
    console.log("");
    console.log("      -> the payment is valid and settled, and it carries no memo at all.");
    rule();
  }

  // The other half of the argument: a memo, when present, is sender-chosen text.
  try {
    const withMemo = await api(`/transactions/${SAMPLE_TX_WITH_MEMO}`);
    console.log("🔎  And when a memo IS present (the repo's sample tx):");
    console.log("      txid        :", withMemo.id);
    console.log("      memo        :", JSON.stringify(withMemo.memo));
    console.log("      memo_type   :", JSON.stringify(withMemo.memo_type));
    console.log("");
    console.log("      -> free text written by the sender. No schema, no validation,");
    console.log("         no standard meaning. It is a note about a *transaction*,");
    console.log("         never a property of a *coin*.");
    rule();
  } catch (err) {
    console.log(`ℹ️   (could not re-fetch the memo sample tx: ${err.message})`);
    rule();
  }

  console.log("🏁  Conclusion");
  if (none > 0) {
    console.log(`      memo is OPTIONAL — ${none} of ${txs.length} sampled transactions carried none.`);
    console.log("      A field that is routinely absent cannot be the channel that carries");
    console.log("      every payment's mining origin. And when it is present, it is");
    console.log("      sender-written text with no tie to the ledger state.");
    console.log("");
    console.log("      Neither case adds a per-unit origin field. The distinction this repo");
    console.log("      rests on — transactions are public, individual coins are not tracked —");
    console.log("      is unaffected either way.");
  } else {
    console.log("      INCONCLUSIVE — every sampled transaction carried a memo.");
    console.log("      That does not make the memo required; widen the sample with --sample.");
    rule();
    process.exit(1);
  }
  rule();
  console.log("");
}

main().catch((err) => {
  console.error("\n❌ ERROR:", err.message);
  process.exit(1);
});
