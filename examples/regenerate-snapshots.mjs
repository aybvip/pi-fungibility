#!/usr/bin/env node
/**
 * regenerate-snapshots.mjs
 * ---------------------------------------------------------------------------
 * MAINTENANCE TOOL (not a proof, not part of the check suite).
 *
 * Runs each example script and rewrites its committed `*-output.txt` snapshot
 * as clean UTF-8 with LF line endings — so the snapshots are platform-stable
 * and never end up UTF-16 (which Windows shells produce with `>`).
 *
 * Usage:
 *   node examples/regenerate-snapshots.mjs
 *
 * Requires network (some scripts read the live Pi Mainnet API).
 * ---------------------------------------------------------------------------
 */

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

// [ script, snapshot ]
const MAP = [
  ["coin-id-check.mjs", "coin-id-output.txt"],
  ["provenance-check.mjs", "provenance-check-output.txt"],
  ["mixing-check.mjs", "mixing-check-output.txt"],
  ["verify-deposit.mjs", "verify-deposit-output.txt"],
  ["model-check.mjs", "model-check-output.txt"],
  ["exhaustive-check.mjs", "exhaustive-check-output.txt"],
  ["self-test.mjs", "self-test-output.txt"],
  ["exchange-wallets.mjs", "exchange-wallets-output.txt"],
  ["run-all.mjs", "run-all-output.txt"],
];

let failed = 0;
for (const [script, snapshot] of MAP) {
  try {
    const text = execFileSync(process.execPath, [join(HERE, script)], { encoding: "utf8" });
    // Normalise to LF so snapshots do not depend on the author's OS.
    writeFileSync(join(HERE, snapshot), text.replace(/\r\n/g, "\n"), "utf8");
    console.log(`✔  examples/${snapshot}`);
  } catch (err) {
    failed++;
    console.error(`✗  ${script} failed: ${err.message}`);
  }
}

console.log(failed ? `\n${failed} snapshot(s) FAILED\n` : "\nall snapshots regenerated\n");
process.exit(failed ? 1 : 0);
