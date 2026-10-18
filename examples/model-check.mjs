#!/usr/bin/env node
/**
 * model-check.mjs
 * ---------------------------------------------------------------------------
 * An EXECUTABLE, ILLUSTRATIVE model of the Pi account/balance ledger, plus a
 * deterministic property check (no network, no dependencies, reproducible).
 *
 * What it demonstrates — mechanically, not by prose:
 *   1. The ledger state of an account is a SINGLE SCALAR (one integer), so there
 *      is literally no field in which a per-unit origin could be stored.
 *   2. `history -> state` is NON-INJECTIVE: many different histories (different
 *      origins) end in the SAME state.
 *   3. A recipient's observable (from, to, amount, memo) is IDENTICAL across
 *      those histories — i.e. "origin" is not in the image of the observation.
 *
 * Honest scope: this is a MODEL of the documented account/balance semantics
 * (see docs/SOURCES.md). It is an illustration and a regression guard — NOT a
 * machine-checked proof in a proof assistant, and it does not replace the
 * information-theoretic argument in docs/SCOPE.md §7.
 *
 * Exit code 0 = all properties hold; 1 = at least one failed.
 * Usage:  node examples/model-check.mjs
 * ---------------------------------------------------------------------------
 */

// Deterministic PRNG (mulberry32) — same output on every machine/run.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// The model: a ledger is a plain map account -> scalar balance (integers, in
// micro-π). There is NO per-unit structure and NO origin field. That absence is
// the whole point, so it is enforced structurally by this class.
// ---------------------------------------------------------------------------
class Ledger {
  constructor() {
    this.bal = new Map(); // account -> integer
  }
  get(a) {
    return this.bal.get(a) || 0;
  }
  credit(a, amt) {
    this.bal.set(a, this.get(a) + amt);
  }
  debit(a, amt) {
    if (this.get(a) < amt) throw new Error("insufficient balance");
    this.bal.set(a, this.get(a) - amt);
  }
  transfer(from, to, amt) {
    this.debit(from, amt);
    this.credit(to, amt);
  }
  state() {
    return JSON.stringify([...this.bal.entries()].sort());
  }
  total() {
    let s = 0;
    for (const v of this.bal.values()) s += v;
    return s;
  }
}

// A history is a list of ops. Each op is either a credit (an incoming amount,
// e.g. a mining migration OR an on-chain transfer from an exchange) or a
// transfer (a payment). Labels like `origin` are attached to the HISTORY only —
// never to the ledger — exactly as on-chain reality is.
function run(history) {
  const L = new Ledger();
  for (const op of history) {
    if (op.op === "credit") L.credit(op.account, op.amount);
    else L.transfer(op.from, op.to, op.amount);
  }
  return L;
}

// What the RECIPIENT can actually observe for the final payment.
function recipientView(history) {
  const pay = [...history].reverse().find((op) => op.op === "transfer");
  if (!pay) return null;
  return JSON.stringify({
    from: pay.from,
    to: pay.to,
    amount: pay.amount,
    memo: pay.memo ?? null,
  });
}

// ---------------------------------------------------------------------------
// Property checks
// ---------------------------------------------------------------------------
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

console.log("\n🧪  model-check: the account/balance ledger carries no per-unit origin");
console.log("     (executable illustration — see docs/SCOPE.md §7 for the proof)\n");

const SEEDS = 2000;
const P = "PAYER_ACCOUNT";
const R = "RECIPIENT_ACCOUNT";

let nonInjectiveFound = 0;
let conservationOk = true;
let observableOk = true;
let scalarOk = true;

for (let seed = 1; seed <= SEEDS; seed++) {
  const rnd = mulberry32(seed);

  // The payer receives several incoming credits, each with a random origin
  // label ("mined" or "bought") — the label lives ONLY on the history.
  const creditCount = 1 + Math.floor(rnd() * 4);
  const incoming = [];
  for (let i = 0; i < creditCount; i++) {
    incoming.push({
      op: "credit",
      account: P,
      amount: 1 + Math.floor(rnd() * 1000), // micro-π
      origin: rnd() < 0.5 ? "mined" : "bought",
    });
  }
  const S = incoming.reduce((sum, c) => sum + c.amount, 0);
  const payAmount = 1 + Math.floor(rnd() * S);

  const build = (labeler) => {
    const credits = incoming.map((c) => ({ ...c, origin: labeler(c) }));
    return [
      ...credits,
      { op: "transfer", from: P, to: R, amount: payAmount, memo: "deposit" },
    ];
  };

  const allMined = build(() => "mined");
  const allBought = build(() => "bought");
  const mixed = build((c) => c.origin);

  const Lm = run(allMined);
  const Lb = run(allBought);
  const Lx = run(mixed);

  // (1) SCALAR: the payer's balance is a single number; nothing to attach an
  //     origin to. (If someone tried, it would not be part of the state.)
  const balP = Lm.get(P);
  if (typeof balP !== "number" || !Number.isInteger(balP)) scalarOk = false;

  // (2) NON-INJECTIVE: three DIFFERENT histories, SAME state.
  if (Lm.state() === Lb.state() && Lb.state() === Lx.state()) {
    if (allMined[0].origin !== allBought[0].origin) nonInjectiveFound++;
  }

  // (3) OBSERVABLE: the recipient's view is identical regardless of origins.
  const v1 = recipientView(allMined);
  const v2 = recipientView(allBought);
  const v3 = recipientView(mixed);
  if (!(v1 === v2 && v2 === v3)) observableOk = false;

  // Conservation: total coins constant under transfers (credits add, rest moves).
  const expectedTotal = S; // credits in, then a transfer (no mint/burn)
  if (Lm.total() !== expectedTotal) conservationOk = false;
}

// Structural check: the state string never mentions an origin.
const sample = run([
  { op: "credit", account: P, amount: 500, origin: "mined" },
  { op: "credit", account: P, amount: 300, origin: "bought" },
  { op: "transfer", from: P, to: R, amount: 800 },
]);
const stateHasNoOrigin =
  !/mined|bought|origin/i.test(sample.state()) && sample.get(R) === 800;

check("state is a single scalar per account (no per-unit structure)", scalarOk);
check("history -> state is NON-INJECTIVE (distinct origins, same state)", nonInjectiveFound > 0, `${nonInjectiveFound}/${SEEDS}`);
check("recipient observable is independent of origin (from,to,amount,memo)", observableOk);
check("balances conserve under transfers", conservationOk);
check("the ledger state contains no 'origin'/'mined'/'bought' field", stateHasNoOrigin);

console.log(`\n  seeds tested: ${SEEDS} · non-injective cases: ${nonInjectiveFound}`);
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
