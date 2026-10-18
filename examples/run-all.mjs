#!/usr/bin/env node
/**
 * run-all.mjs
 * ---------------------------------------------------------------------------
 * One command to run every reproducible check in this repo and print a summary.
 *
 *   node examples/run-all.mjs              # offline + online checks
 *   node examples/run-all.mjs --offline    # offline only (no network)
 *
 * Exit code 0 = all selected checks passed; 1 = at least one failed.
 * Zero dependencies. Read-only. See docs/AUDIT-REQUEST.md for the honest status.
 * ---------------------------------------------------------------------------
 */

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const OFFLINE = process.argv.includes("--offline");

// Each check: { script, offline, what }
const CHECKS = [
  { script: "model-check.mjs", offline: true, what: "ledger model + property check (2000 seeds)" },
  { script: "exhaustive-check.mjs", offline: true, what: "exhaustive bounded check (all 1452 histories)" },
  { script: "provenance-check.mjs", offline: false, what: "no origin field on a real on-chain payment" },
  { script: "memo-check.mjs", offline: false, what: "the memo is optional — not a provenance channel" },
  { script: "falsify-try.mjs", offline: false, what: "try to falsify F1/F3 — enumerate the whole API surface" },
  { script: "coin-id-check.mjs", offline: false, what: "balance is one scalar (no per-unit ID)" },
  { script: "mixing-check.mjs", offline: false, what: "mined+bought mixed -> origin-less payment" },
  { script: "verify-deposit.mjs", offline: false, what: "a specific transfer is native on Mainnet (Claim B)" },
  { script: "self-test.mjs", offline: false, what: "unit tests + transport failures + end-to-end (29 checks)" },
];

const selected = CHECKS.filter((c) => (OFFLINE ? c.offline : true));

const rule = (c = "=") => console.log(c.repeat(78));
rule();
console.log(`🧾  pi-fungibility — full check suite (${OFFLINE ? "OFFLINE" : "OFFLINE + ONLINE"})`);
console.log(`    node ${process.version} · ${process.platform}`);
rule();

const results = [];

for (const c of selected) {
  const label = `${c.offline ? "[offline]" : "[online ]"} ${c.script}`;
  process.stdout.write(`▶  ${label} … `);
  let ok = true;
  let detail = "";
  try {
    execFileSync(process.execPath, [join(HERE, c.script)], { encoding: "utf8", stdio: "pipe" });
    detail = "ok";
  } catch (err) {
    ok = false;
    const out = `${err.stdout || ""}${err.stderr || ""}`;
    const line = out.split(/\r?\n/).find((l) => /FAIL|ERROR|passed,/.test(l));
    detail = line ? line.trim() : `exit ${err.status}`;
  }
  console.log(ok ? "PASS ✅" : `FAIL ❌  (${detail})`);
  results.push({ ...c, ok, detail });
}

rule();
const passed = results.filter((r) => r.ok).length;
const failed = results.length - passed;

for (const r of results) {
  console.log(`  ${r.ok ? "✅" : "❌"}  ${r.script.padEnd(22)} ${r.what}`);
}

rule();
console.log(`  ${passed} passed, ${failed} failed  (${results.length} checks${OFFLINE ? ", offline only" : ""})`);
if (!OFFLINE) {
  console.log("  note: online checks depend on https://api.mainnet.minepi.com (read-only).");
}
rule();
console.log("");

process.exit(failed ? 1 : 0);
