#!/usr/bin/env node
/**
 * falsify-try.mjs
 * ---------------------------------------------------------------------------
 * Attempts to FALSIFY this repository's claim, against the live Pi Mainnet.
 *
 * The claim (SCOPE.md §1):
 *   "A native Pi payment carries no observable per-unit mining origin on the
 *    Pi Mainnet ledger."
 *
 * A negative-existential claim is tested by ENUMERATION, not by sampling.
 * This script walks the entire observable surface for one real payment — the
 * transaction record, its operations, its effects, and the resulting account —
 * collects EVERY key the API returns, and scans those keys for origin-like
 * tokens.
 *
 *   F1 — a per-unit origin field : this script
 *   F3 — a non-scalar balance    : this script (the account's native entry)
 *
 * If it finds an origin-like key, the claim is DEAD: it says so and exits
 * non-zero. If it finds none, that is ONE honest attempt, not a proof of
 * victory (see docs/FALSIFICATION.md §5).
 *
 * Zero dependencies (Node 18+ built-in fetch). Read-only. GET only.
 *
 * Usage:
 *   node examples/falsify-try.mjs
 *   node examples/falsify-try.mjs <TRANSACTION_HASH>
 *   node examples/falsify-try.mjs --help
 * ---------------------------------------------------------------------------
 */

import { api, rule, isTxHash, usageAndExit } from "./lib.mjs";

// A real Pi Mainnet transaction (the repo's 0.8 Pi sample payment).
const DEFAULT_TX =
  "e0916b2f64bef9da8ac6c2e784a98e48102637a77654a1a73055cb2b6927914c";

// Tokens that WOULD indicate per-unit origin if they appeared as a key segment.
// Matched as WHOLE segments (asset_type -> ["asset","type"]) so that
// account-level keys such as `source_account` (the sender) never false-positive.
const ORIGIN_TOKENS = [
  "origin", "mining", "mined", "provenance", "taint",
  "lot", "lots", "batch", "batches",
  "unit", "units", "coin", "coins",
  "serial", "allocation",
];

const HELP = [
  "falsify-try.mjs — try to falsify the claim (F1: a per-unit origin field)",
  "",
  "Usage:",
  "  node examples/falsify-try.mjs                       # built-in sample tx",
  "  node examples/falsify-try.mjs <TRANSACTION_HASH>    # a 64-char hex hash",
  "  node examples/falsify-try.mjs --help",
  "",
  "Walks EVERY key the live API returns for one real payment and scans them",
  "for origin-like tokens. Either it finds none, or it says so and exits 1.",
  "",
  "Read-only. No wallet, no keys. Node 18+.",
];

const argv = process.argv.slice(2);
if (argv.includes("--help") || argv.includes("-h")) usageAndExit(HELP, 0);

const arg = argv[0];
if (arg && !isTxHash(arg)) usageAndExit([`✗ invalid transaction hash: ${arg}`, "", ...HELP]);
const txid = arg || DEFAULT_TX;

/** Split a key into lower-case word segments: "asset_type" -> ["asset","type"]. */
function segments(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2") // camelCase -> snake_case
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Origin-like tokens present as whole segments of this key. */
function originHits(key) {
  const segs = new Set(segments(key));
  return ORIGIN_TOKENS.filter((t) => segs.has(t));
}

/** Walk a JSON value, collecting every key with the path that reached it. */
function walk(value, path, sink) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, `${path}[${i}]`, sink));
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      sink.push({ key: k, path: `${path}.${k}` });
      walk(v, `${path}.${k}`, sink);
    }
  }
}

const recordsOf = (body) => (body?._embedded?.records ?? []).length;

/** Print a comma-separated list, wrapped to a readable width. */
function wrapList(items, indent = "    ", width = 74) {
  let line = indent;
  for (const k of items) {
    if (line.length + k.length + 2 > width) {
      console.log(line.replace(/,\s*$/, ""));
      line = indent;
    }
    line += `${k}, `;
  }
  if (line.trim()) console.log(line.replace(/,\s*$/, ""));
}

async function main() {
  console.log("\n🔬  Falsification attempt — F1: is there any per-unit origin field?");
  console.log("    target :", txid);
  console.log("    method : enumerate EVERY key the live Mainnet API returns for one");
  console.log("             real payment, then scan those keys for origin-like tokens");
  console.log(`             (${ORIGIN_TOKENS.join(", ")})`);
  rule();

  // ---- fetch the whole surface -------------------------------------------
  const tx = await api(`/transactions/${txid}`);
  const source = tx.source_account;

  const targets = [
    { label: "transaction", body: tx },
    {
      label: "operations",
      body: await api(`/transactions/${txid}/operations`),
    },
    {
      label: "effects",
      body: await api(`/transactions/${txid}/effects`),
    },
  ];

  let account = null;
  try {
    account = await api(`/accounts/${source}`);
    targets.push({ label: `account ${source.slice(0, 6)}…`, body: account });
  } catch (err) {
    console.log(`ℹ️   (account lookup skipped: ${err.message})`);
  }

  // ---- enumerate every key ------------------------------------------------
  const allKeys = new Set();
  let paths = 0;
  const hits = [];

  console.log("  surface walked");
  for (const t of targets) {
    const sink = [];
    walk(t.body, "$", sink);
    const keys = new Set(sink.map((s) => s.key));
    for (const k of keys) allKeys.add(k);
    paths += sink.length;
    for (const s of sink) {
      const h = originHits(s.key);
      if (h.length) hits.push({ path: s.path, key: s.key, tokens: h });
    }
    const recs = recordsOf(t.body);
    const recLabel = recs ? `${recs} record${recs === 1 ? "" : "s"}` : "1 record";
    console.log(`    ${t.label.padEnd(18)} ${String(keys.size).padStart(3)} distinct keys   ${recLabel}`);
  }
  rule();

  console.log(`  distinct keys across the whole surface : ${allKeys.size}`);
  console.log(`  key paths walked                       : ${paths}`);
  rule();

  console.log("  every key observed (the full surface):");
  wrapList([...allKeys].sort());
  rule();

  // ---- F3: is the native balance one scalar? ------------------------------
  let balanceOk = null;
  if (account) {
    const balances = Array.isArray(account.balances) ? account.balances : [];
    const native = balances.filter((b) => b.asset_type === "native");
    console.log("  balance check (F3 — is the native balance one scalar?)");
    console.log(`    balance entries : ${balances.length}`);
    if (native.length === 1) {
      const n = native[0];
      const scalar = typeof n.balance === "string" && /^[0-9]+\.[0-9]{7}$/.test(n.balance);
      balanceOk = scalar;
      console.log(`    native entry    : balance=${JSON.stringify(n.balance)}  asset_type=${JSON.stringify(n.asset_type)}`);
      console.log(
        `    balance shape   : ${scalar ? "one scalar string (decimal, 7 places) — no lots, no IDs" : "NOT a scalar string"}`
      );
    } else {
      balanceOk = false;
      console.log(`    native entries  : ${native.length} (expected exactly 1)`);
    }
    rule();
  } else {
    console.log("  balance check (F3) : skipped (no account record)");
    rule();
  }

  // ---- verdict ------------------------------------------------------------
  console.log(`  origin-like keys : ${hits.length ? `${hits.length} FOUND` : "none"}`);

  if (hits.length) {
    rule();
    console.log("❌  F1 FALSIFIED — an origin-like key DOES exist on the live surface:");
    for (const h of hits) console.log(`      ${h.path}   (segment: ${h.tokens.join(", ")})`);
    rule();
    console.log("    This contradicts the claim. Report it — docs/FALSIFICATION.md §6 —");
    console.log("    and the claim must be corrected.");
    process.exit(1);
  }

  if (balanceOk === false) {
    rule();
    console.log("❌  F3 FALSIFIED — the native balance is not a single scalar string.");
    console.log("    The claim depends on this. Report it (docs/FALSIFICATION.md §6).");
    process.exit(1);
  }

  rule();
  console.log("✅  F1 and F3 were NOT falsified on this surface.");
  console.log("    That is one honest attempt, not a proof of victory.");
  console.log("    Standing status: docs/FALSIFICATION.md §5.");
  rule();
  console.log("");
}

main().catch((err) => {
  console.error("\n❌ ERROR:", err.message);
  process.exit(1);
});
