#!/usr/bin/env node
/**
 * self-test.mjs
 * ---------------------------------------------------------------------------
 * Automated checks for verify-deposit.mjs. Three layers:
 *
 *   LAYER 0 — OFFLINE (pure): input validation helpers in lib.mjs.
 *
 *   LAYER 1 — OFFLINE (pure, no network): unit-test the exported `evaluate()`
 *     decision function with synthetic transactions. This pins the two
 *     correctness rules and cannot be flaky:
 *       (1) the SAME operation must be native AND reach the expected address;
 *       (2) a FAILED transaction (successful=false) can never be VERIFIED.
 *
 *   LAYER 2 — ONLINE (read-only): run the real CLI against a known, stable Pi
 *     Mainnet transaction and assert the end-to-end result.
 *
 * Exit code 0 = all pass; 1 = at least one failure. Zero dependencies.
 * Requires network for Layer 2 only.
 *
 * Usage:  node examples/self-test.mjs
 * ---------------------------------------------------------------------------
 */

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { evaluate } from "./verify-deposit.mjs";
import { isTxHash, isGAddress, isMAddress, isAddress } from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const TOOL = join(HERE, "verify-deposit.mjs");

// A known, stable native payment on Pi Mainnet (0.8 Pi).
const TX = "e0916b2f64bef9da8ac6c2e784a98e48102637a77654a1a73055cb2b6927914c";
const GOOD = "GC55LFCTGSDPDMNDIOHZVVA4CYCUF4IKI2SUGHWCJA2PCLPKH4HMDMIU"; // actual recipient
const BAD = "GBYXQJ6ZHXNLR6EFVLYW5DJPKLACXTYS2ZL4U3YF66R3UQEA7D5LSEYU"; // not the recipient
const OTHER = "GBWKGBVDEJO3JKRV7IUBHXMBE7A2JYHOGMUMKEO2XM5RFIRBRVSYHTZA"; // some other account

let pass = 0;
let fail = 0;
function check(name, cond, extra) {
  if (cond) {
    console.log(`  PASS ✅  ${name}`);
    pass++;
  } else {
    console.error(`  FAIL ❌  ${name}${extra ? `  -> ${extra}` : ""}`);
    fail++;
  }
}

const nativePay = (from, to, amount = "1.0000000", extra = {}) => ({
  type: "payment",
  asset_type: "native",
  amount,
  from,
  to,
  ...extra,
});

console.log("\n🧪  self-test: verify-deposit.mjs\n");

// ---------------------------------------------------------------------------
// LAYER 0 — offline tests of the shared helpers (lib.mjs)
// ---------------------------------------------------------------------------
console.log("Layer 0 — offline helpers (input validation)\n");

{
  const TX = "e0916b2f64bef9da8ac6c2e784a98e48102637a77654a1a73055cb2b6927914c";
  const M = "M" + "A".repeat(68);
  check("isTxHash accepts a 64-hex hash", isTxHash(TX) === true);
  check("isTxHash rejects a short string", isTxHash("deadbeef") === false);
  check("isGAddress accepts the sample G...", isGAddress(GOOD) === true);
  check("isGAddress rejects an M... value", isGAddress(M) === false);
  check("isMAddress accepts a 69-char M...", isMAddress(M) === true);
  check("isAddress accepts both G... and M...", isAddress(GOOD) === true && isAddress(M) === true);
  check("isAddress rejects garbage", isAddress("hello") === false);
}

// ---------------------------------------------------------------------------
// LAYER 1 — offline unit tests of evaluate()
// ---------------------------------------------------------------------------
console.log("\nLayer 1 — offline unit tests (evaluate)\n");

// 1) succeeded + native payment to expected address
{
  const tx = { successful: true };
  const r = evaluate(tx, [nativePay(OTHER, GOOD)], GOOD);
  check("succeeded + native to expected -> VERIFIED", r.verdict === "VERIFIED", r.verdict);
}

// 2) succeeded + native payment to a DIFFERENT address
{
  const tx = { successful: true };
  const r = evaluate(tx, [nativePay(OTHER, OTHER)], GOOD);
  check("succeeded + native to wrong address -> NOT_VERIFIED", r.verdict === "NOT_VERIFIED", r.verdict);
}

// 3) THE NEW GATE: FAILED tx with a native payment to the expected address
{
  const tx = { successful: false };
  const r = evaluate(tx, [nativePay(OTHER, GOOD)], GOOD);
  check(
    "FAILED tx (successful=false) -> NOT_VERIFIED_TX_FAILED (gate)",
    r.verdict === "NOT_VERIFIED_TX_FAILED",
    r.verdict
  );
}

// 4) MULTI-OP: one op is native (to elsewhere), another op reaches GOOD but is NOT native
{
  const tx = { successful: true };
  const records = [
    nativePay(OTHER, OTHER), // native, but wrong destination
    { type: "payment", asset_type: "credit_alphanum4", asset_code: "USDC", amount: "5.0000000", from: OTHER, to: GOOD },
  ];
  const r = evaluate(tx, records, GOOD);
  check(
    "multi-op: native elsewhere + non-native to expected -> NOT_VERIFIED (same-op rule)",
    r.verdict === "NOT_VERIFIED",
    r.verdict
  );
}

// 5) multi-op: SAME op is native AND to expected -> VERIFIED
{
  const tx = { successful: true };
  const records = [
    { type: "payment", asset_type: "credit_alphanum4", asset_code: "USDC", amount: "5.0000000", from: OTHER, to: OTHER },
    nativePay(OTHER, GOOD),
  ];
  const r = evaluate(tx, records, GOOD);
  check("multi-op: same op native + to expected -> VERIFIED", r.verdict === "VERIFIED", r.verdict);
}

// 6) no address given: succeeded tx with a native payment -> NATIVE_PRESENT
{
  const tx = { successful: true };
  const r = evaluate(tx, [nativePay(OTHER, GOOD)], null);
  check("no address + succeeded + native -> NATIVE_PRESENT", r.verdict === "NATIVE_PRESENT", r.verdict);
}

// 7) no address given + no native payment -> NO_NATIVE_PAYMENT
{
  const tx = { successful: true };
  const r = evaluate(
    tx,
    [{ type: "payment", asset_type: "credit_alphanum4", asset_code: "USDC", amount: "1.0000000", from: OTHER, to: GOOD }],
    null
  );
  check("no address + only non-native -> NO_NATIVE_PAYMENT", r.verdict === "NO_NATIVE_PAYMENT", r.verdict);
}

// 8) muxed M... recipient accepted
{
  const tx = { successful: true };
  const M = "MAAAAAAAAAAAAAAAABBBBCCCCDDDDEEEEFFFFGGGGHHHHIIIIJJJJKKKKLLLLMMMM";
  const r = evaluate(tx, [nativePay(OTHER, OTHER, "1.0000000", { to_muxed: M })], M);
  check("muxed M... recipient accepted -> VERIFIED", r.verdict === "VERIFIED", r.verdict);
}

// 9) robustness: undefined tx -> TX_FAILED (never VERIFIED)
{
  const r = evaluate(undefined, [nativePay(OTHER, GOOD)], GOOD);
  check("undefined tx -> NOT_VERIFIED_TX_FAILED", r.verdict === "NOT_VERIFIED_TX_FAILED", r.verdict);
}

// 10) robustness: missing operations do not crash
{
  const r = evaluate({ successful: true }, undefined, null);
  check("undefined records + no address -> NO_NATIVE_PAYMENT", r.verdict === "NO_NATIVE_PAYMENT", r.verdict);
}

// 11) robustness: a null entry inside operations is tolerated
{
  const r = evaluate({ successful: true }, [null, nativePay(OTHER, GOOD)], GOOD);
  check("null op entry tolerated -> VERIFIED", r.verdict === "VERIFIED", r.verdict);
}

// ---------------------------------------------------------------------------
// LAYER 2 — online end-to-end (real CLI on a stable tx)
// ---------------------------------------------------------------------------
console.log("\nLayer 2 — online end-to-end (real CLI)\n");

function run(...args) {
  return execFileSync(process.execPath, [TOOL, ...args], { encoding: "utf8" });
}

const outGood = run(TX, GOOD);
check(
  "correct recipient -> VERIFIED (and SUCCEEDED)",
  /VERIFIED: the transaction SUCCEEDED/.test(outGood) && !/NOT VERIFIED/.test(outGood)
);

const outBad = run(TX, BAD);
check("wrong recipient -> NOT VERIFIED", /NOT VERIFIED: no single operation/.test(outBad));

const outNoAddr = run(TX);
check(
  "no address -> reports the number of native payment(s)",
  /contains \d+ native Pi payment\(s\)/.test(outNoAddr)
);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
