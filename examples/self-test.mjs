#!/usr/bin/env node
/**
 * self-test.mjs
 * ---------------------------------------------------------------------------
 * A tiny automated check of verify-deposit.mjs.
 *
 * It runs the tool three times against a known, stable Pi Mainnet transaction
 * and ASSERTS the difference:
 *   1. correct recipient   -> "VERIFIED" (same op is native AND to the address)
 *   2. wrong recipient     -> "NOT VERIFIED" (the fix: we must not mix facts)
 *   3. no address given    -> reports the number of native payment(s)
 *
 * Exit code 0 = all pass; 1 = at least one failure. Zero dependencies.
 * Requires network (read-only) like the other tools.
 *
 * Usage:  node examples/self-test.mjs
 * ---------------------------------------------------------------------------
 */

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const TOOL = join(HERE, "verify-deposit.mjs");

// A known, stable native payment on Pi Mainnet (0.8 Pi).
const TX = "e0916b2f64bef9da8ac6c2e784a98e48102637a77654a1a73055cb2b6927914c";
const GOOD = "GC55LFCTGSDPDMNDIOHZVVA4CYCUF4IKI2SUGHWCJA2PCLPKH4HMDMIU"; // actual recipient
const BAD = "GBYXQJ6ZHXNLR6EFVLYW5DJPKLACXTYS2ZL4U3YF66R3UQEA7D5LSEYU"; // not the recipient

let pass = 0;
let fail = 0;
function check(name, cond) {
  if (cond) {
    console.log(`  PASS ✅  ${name}`);
    pass++;
  } else {
    console.error(`  FAIL ❌  ${name}`);
    fail++;
  }
}

function run(...args) {
  return execFileSync(process.execPath, [TOOL, ...args], { encoding: "utf8" });
}

console.log("\n🧪  self-test: verify-deposit.mjs\n");

const outGood = run(TX, GOOD);
check(
  "correct recipient -> VERIFIED (same op is native AND to the address)",
  /VERIFIED: a SINGLE operation/.test(outGood) && !/NOT VERIFIED/.test(outGood)
);

const outBad = run(TX, BAD);
check(
  "wrong recipient -> NOT VERIFIED (this is the bug fix)",
  /NOT VERIFIED: no single operation/.test(outBad)
);

const outNoAddr = run(TX);
check(
  "no address -> reports the number of native payment(s)",
  /contains \d+ native Pi payment\(s\)/.test(outNoAddr)
);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
