#!/usr/bin/env node
/**
 * exhaustive-check.mjs
 * ---------------------------------------------------------------------------
 * EXHAUSTIVE (bounded) verification of the ledger model — no randomness.
 * Where model-check.mjs SAMPLES random histories, this script enumerates ALL
 * histories up to a bound and checks the properties for every one of them.
 * That is the strongest thing we can offer without a proof assistant.
 *
 * Domain (small on purpose, so it is fully enumerable):
 *   - accounts A (payer) and B (recipient)
 *   - a history is: k incoming credits to A (k = 1..3), each amount in {1,2,3}
 *     and each origin in {mined, bought}, followed by ONE transfer A -> B of
 *     some amount 1..sum.
 *
 * Properties proven exhaustively over that domain:
 *   P1  ORIGIN-INVISIBLE: for every fixed (amounts, transfer), ALL 2^k origin
 *       labellings give the SAME ledger state AND the SAME recipient view.
 *   P2  NON-INJECTIVE: distinct histories (different amount sequences) can map
 *       to the SAME state — so the state does not determine the history.
 *   P3  NO ORIGIN FIELD: no state string ever contains "mined"/"bought"/"origin".
 *
 * Honest scope: exhaustive over a BOUNDED domain — not an unbounded proof and
 * not a machine-checked formalisation (see docs/SCOPE.md §7, docs/AUDIT-REQUEST.md).
 *
 * Exit code 0 = all properties hold; 1 = a counterexample was found.
 * Usage:  node examples/exhaustive-check.mjs
 * ---------------------------------------------------------------------------
 */

class Ledger {
  constructor() {
    this.bal = new Map(); // account -> integer (the ONLY state)
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
}

function run(history) {
  const L = new Ledger();
  for (const op of history) {
    if (op.op === "credit") L.credit(op.account, op.amount);
    else L.transfer(op.from, op.to, op.amount);
  }
  return L;
}

function recipientView(history) {
  const pay = [...history].reverse().find((op) => op.op === "transfer");
  return JSON.stringify({ from: pay.from, to: pay.to, amount: pay.amount, memo: pay.memo ?? null });
}

// Enumerate every sequence of `length` items drawn from `alphabet` (odometer).
function* sequences(alphabet, length) {
  const idx = new Array(length).fill(0);
  for (;;) {
    yield idx.map((i) => alphabet[i]);
    let p = length - 1;
    while (p >= 0 && idx[p] === alphabet.length - 1) {
      idx[p] = 0;
      p--;
    }
    if (p < 0) break;
    idx[p]++;
  }
}

const A = "A";
const B = "B";
const ORIGINS = ["mined", "bought"];
const AMOUNTS = [1, 2, 3];

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

console.log("\n🧪  exhaustive-check: verify EVERY bounded history (no randomness)");
console.log("     (bounded exhaustive verification — see docs/SCOPE.md §7)\n");

// ---------------------------------------------------------------------------
// P1 — for every (amounts, transfer), every origin labelling is indistinguishable
// ---------------------------------------------------------------------------
let p1Histories = 0;
let p1Groups = 0; // (amounts, transfer) combos
let p1Violations = [];

// P2 — collect state -> set of "shapes" (the amounts/transfer, ignoring origins)
const stateToShapes = new Map();
let totalHistories = 0;

for (let k = 1; k <= 3; k++) {
  for (const amounts of sequences(AMOUNTS, k)) {
    const sum = amounts.reduce((s, x) => s + x, 0);
    for (let payAmount = 1; payAmount <= sum; payAmount++) {
      p1Groups++;

      // Build ALL 2^k origin labellings for this exact (amounts, transfer).
      const states = new Set();
      const views = new Set();
      for (const origins of sequences(ORIGINS, k)) {
        const history = amounts.map((amount, i) => ({
          op: "credit",
          account: A,
          amount,
          origin: origins[i],
        }));
        history.push({ op: "transfer", from: A, to: B, amount: payAmount, memo: "deposit" });

        const L = run(history);
        states.add(L.state());
        views.add(recipientView(history));
        p1Histories++;
        totalHistories++;

        // P3 — no origin leaks into the state
        if (/mined|bought|origin/i.test(L.state())) p1Violations.push("origin leaked into state");

        const shape = `${amounts.join("+")}=>${payAmount}`;
        if (!stateToShapes.has(L.state())) stateToShapes.set(L.state(), new Set());
        stateToShapes.get(L.state()).add(shape);
      }
      // P1: all labellings must collapse to ONE state and ONE view
      if (states.size !== 1) p1Violations.push(`state varies by origin for ${amounts}=>${payAmount}`);
      if (views.size !== 1) p1Violations.push(`view varies by origin for ${amounts}=>${payAmount}`);
    }
  }
}

const p1Exhaustive = p1Violations.length === 0;
check(
  `P1 origin-invisible: all ${p1Histories} histories over ${p1Groups} groups -> one state & one view`,
  p1Exhaustive,
  p1Violations.slice(0, 3).join("; ")
);

// ---------------------------------------------------------------------------
// P2 — distinct histories (shapes) collapsing to the same state
// ---------------------------------------------------------------------------
const collidingStates = [...stateToShapes.entries()].filter(([, shapes]) => shapes.size > 1);
check(
  `P2 non-injective: ${collidingStates.length} states reached by >1 distinct history`,
  collidingStates.length > 0
);

// Show one concrete collision as evidence.
let example = null;
if (collidingStates.length) {
  const [state, shapes] = collidingStates[0];
  example = { state, shapes: [...shapes].slice(0, 3) };
}

console.log(`\n  histories enumerated: ${totalHistories}`);
console.log(`  distinct states:      ${stateToShapes.size}`);
console.log(`  colliding states:     ${collidingStates.length}`);
if (example) {
  console.log(`\n  example collision:`);
  console.log(`    state:  ${example.state}`);
  for (const s of example.shapes) console.log(`    reached by history: ${s}`);
}

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
