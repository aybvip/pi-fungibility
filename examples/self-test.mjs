#!/usr/bin/env node
/**
 * self-test.mjs
 * ---------------------------------------------------------------------------
 * Automated checks for verify-deposit.mjs. Four layers:
 *
 *   LAYER 0 — OFFLINE (pure): input validation helpers in lib.mjs, plus the
 *     strkey codec and the CAP-27 muxed-address builder in exchange-wallets.mjs
 *     (checksum, ed25519 key extraction, and known-vector rebuilds).
 *
 *   LAYER 1 — OFFLINE (pure, no network): unit-test the exported `evaluate()`
 *     decision function with synthetic transactions. This pins the two
 *     correctness rules and cannot be flaky:
 *       (1) the SAME operation must be native AND reach the expected address;
 *       (2) a FAILED transaction (successful=false) can never be VERIFIED.
 *
 *   LAYER 2 — OFFLINE (no network): the HTTP client's failure handling, tested
 *     with an injected transport. Asserts that an HTTP error status, an invalid
 *     JSON body, a connection failure and a timeout each raise a clear Error
 *     instead of crashing or silently returning `undefined`.
 *
 *   LAYER 3 — ONLINE (read-only): run the real CLI against a known, stable Pi
 *     Mainnet transaction and assert the end-to-end result.
 *
 * Exit code 0 = all pass; 1 = at least one failure. Zero dependencies.
 * Requires network for Layer 3 only.
 *
 * Usage:  node examples/self-test.mjs
 * ---------------------------------------------------------------------------
 */

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { evaluate } from "./verify-deposit.mjs";
import { api, DEFAULT_TIMEOUT_MS, isTxHash, isGAddress, isMAddress, isAddress } from "./lib.mjs";
import { BITGET, OKX, decodeStrKey, muxedFromG, base32Decode, base32Encode } from "./exchange-wallets.mjs";

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
// LAYER 0b — offline tests of the strkey codec + muxed builder (exchange-wallets)
// ---------------------------------------------------------------------------
console.log("\nLayer 0b — offline codec (strkey checksum + CAP-27 muxed)\n");

{
  // The two pinned exchange addresses, decoded from scratch.
  const b = decodeStrKey(BITGET);
  const o = decodeStrKey(OKX);
  check(
    "Bitget address decodes as a valid G account (v0x30)",
    b.valid === true && b.crcOk === true && b.version === 0x30,
    JSON.stringify(b)
  );
  check(
    "Bitget ed25519 key matches the expected bytes",
    b.keyHex === "cadb1fd92a6a748d61635d49efb7e108a8552076f235f1abfd60958b8f4ba05b",
    b.keyHex
  );
  check(
    "OKX ed25519 key matches the expected bytes",
    o.keyHex === "1784953d9547ce94366e8d3e22defc899da02e2c8327d0a2b579afb42d59b6fb",
    o.keyHex
  );

  // A one-character corruption must flip the checksum — we never trust a shape.
  const corrupted = BITGET.slice(0, -1) + (BITGET.endsWith("5") ? "6" : "5");
  check(
    "a corrupted address fails the checksum",
    decodeStrKey(corrupted).crcOk === false && decodeStrKey(corrupted).valid === false
  );

  // Known vectors: M = G + uint64 id (CAP-27). Pinned so a drift is caught.
  const m1 = muxedFromG(BITGET, 7142514608);
  const m2 = muxedFromG(OKX, 2486605);
  check(
    "muxedFromG(Bitget, 7142514608) == pinned M address",
    m1 === "MDFNWH6ZFJVHJDLBMNOUT35X4EEKQVJAO3ZDL4NL7VQJLC4PJOQFWAAAAAA2TOQ7WBSJA",
    m1
  );
  check(
    "muxedFromG(OKX, 2486605) == pinned M address",
    m2 === "MALYJFJ5SVD45FBWN2GT4IW67SEZ3IBOFSBSPUFCWV427NBNLG3PWAAAAAAAAJPRJXINQ",
    m2
  );

  // Round-trip: the rebuilt M must be a valid M and carry the same key + id.
  const d = decodeStrKey(m1);
  check(
    "rebuilt M round-trips (valid, same key, same id)",
    d.valid === true && d.muxedId === "7142514608" && d.keyHex === b.keyHex,
    JSON.stringify(d)
  );

  // base32 is exact and lossless.
  const bytes = Buffer.from("00ff1020deadbeef", "hex");
  check("base32 encode/decode round-trips exactly", base32Decode(base32Encode(bytes)).equals(bytes));
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
// LAYER 2 — offline transport failure handling (injected fetch, no network)
// ---------------------------------------------------------------------------
console.log("\nLayer 2 — offline transport failures (injected fetch)\n");

const fakeOk = (body) => ({
  ok: true,
  status: 200,
  statusText: "OK",
  json: async () => body,
  text: async () => JSON.stringify(body),
});

const fakeHttp = (status, statusText, body) => ({
  ok: false,
  status,
  statusText,
  text: async () => body,
  json: async () => {
    throw new Error("not json");
  },
});

/** Assert that `fn()` rejects with an Error whose message matches `pattern`. */
async function expectThrow(name, fn, pattern) {
  try {
    await fn();
    check(name, false, "resolved instead of throwing");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const good = err instanceof Error && pattern.test(msg);
    check(name, good, good ? "" : `got ${JSON.stringify(msg).slice(0, 150)}`);
  }
}

/** Assert that `fn()` resolves and the value satisfies `predicate`. */
async function expectValue(name, fn, predicate) {
  try {
    const v = await fn();
    check(name, predicate(v), JSON.stringify(v).slice(0, 150));
  } catch (err) {
    check(name, false, `threw ${err.message}`);
  }
}

// The happy path must be unchanged by the timeout refactor.
await expectValue(
  "injected 200 + JSON -> parsed value",
  () => api("/ping", { fetch: async () => fakeOk({ hello: "world" }), timeoutMs: 0 }),
  (v) => v && v.hello === "world"
);

// HTTP 500 -> a clear error naming the status, with a snippet of the body.
await expectThrow(
  "HTTP 500 -> Error names status + shows body snippet",
  () =>
    api("/transactions/x", {
      fetch: async () => fakeHttp(500, "Internal Server Error", "upstream boom"),
      timeoutMs: 0,
    }),
  /^500 Internal Server Error -> \/transactions\/x[\s\S]*upstream boom$/
);

// HTTP 429 (rate limited) -> still a clear status error, never a silent pass.
await expectThrow(
  "HTTP 429 -> Error names status",
  () =>
    api("/transactions/x", {
      fetch: async () => fakeHttp(429, "Too Many Requests", "slow down"),
      timeoutMs: 0,
    }),
  /^429 Too Many Requests -> \/transactions\/x/
);

// 200 but the body is not JSON (e.g. an HTML error page from a proxy).
await expectThrow(
  "200 + non-JSON body -> invalid JSON error",
  () =>
    api("/transactions/x", {
      fetch: async () => ({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => {
          throw new SyntaxError("Unexpected token <");
        },
      }),
      timeoutMs: 0,
    }),
  /^invalid JSON -> \/transactions\/x/
);

// Connection failure (DNS / refused) -> network error naming the host.
await expectThrow(
  "connection failure -> network error names the host",
  () =>
    api("/transactions/x", {
      fetch: async () => {
        throw new Error("getaddrinfo ENOTFOUND api.mainnet.minepi.com");
      },
      timeoutMs: 0,
    }),
  /^network error -> https:\/\/api\.mainnet\.minepi\.com[\s\S]*ENOTFOUND/
);

// Timeout -> a hung socket is aborted and reported; the process never hangs.
const hangingFetch = (_url, { signal } = {}) =>
  new Promise((_resolve, reject) => {
    if (signal) {
      signal.addEventListener("abort", () =>
        reject(Object.assign(new Error("The operation was aborted"), { name: "AbortError" }))
      );
    }
  });

await expectThrow(
  "timeout -> aborted and reported, never hangs",
  () => api("/transactions/x", { fetch: hangingFetch, timeoutMs: 40 }),
  /^timeout after 40ms -> /
);

// The default budget must be a real, finite, positive number.
check(
  "default timeout is a finite positive budget",
  Number.isFinite(DEFAULT_TIMEOUT_MS) && DEFAULT_TIMEOUT_MS > 0,
  String(DEFAULT_TIMEOUT_MS)
);

// A custom base is honoured (this is what lets the failure tests run offline).
await expectValue(
  "custom base is honoured",
  () =>
    api("/ping", {
      base: "https://example.test",
      fetch: async () => fakeOk({ base: "example.test" }),
      timeoutMs: 0,
    }),
  (v) => v.base === "example.test"
);

// ---------------------------------------------------------------------------
// LAYER 3 — online end-to-end (real CLI on a stable tx)
// ---------------------------------------------------------------------------
console.log("\nLayer 3 — online end-to-end (real CLI)\n");

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
