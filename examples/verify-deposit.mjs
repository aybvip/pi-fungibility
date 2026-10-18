#!/usr/bin/env node
/**
 * verify-deposit.mjs
 * ---------------------------------------------------------------------------
 * Verifies ONE specific claim: that a given transaction is a real **native Pi
 * payment on Pi Mainnet** — e.g. a deposit into an exchange's on-chain address.
 *
 * It proves what the LEDGER can prove:
 *   - an operation of type "payment" with asset_type "native"
 *   - from address -> to address, and the amount
 *   - optionally, that the **same operation** goes TO a specific address
 *
 * It does NOT (and cannot) prove what is off-chain:
 *   - that an exchange credited the corresponding internal balance,
 *   - that the exchange's total internal liabilities are fully backed on-chain.
 *   (Those are counterparty/reserve claims — see docs/FAQ-EXCHANGE-DEPOSIT-VERIFY.md.)
 *
 * NOTE ON CORRECTNESS (important):
 *   A Stellar/Pi transaction can contain MULTIPLE operations. Therefore we must
 *   NOT test "is there a native payment?" and "does some op reach the expected
 *   address?" as two independent facts — that could be misleading. Instead, we
 *   require the SAME single operation to be BOTH native AND directed to the
 *   expected recipient (when one is given).
 *
 * Zero dependencies (Node 18+ built-in fetch).
 *
 * Usage:
 *   node examples/verify-deposit.mjs                       # uses a default sample tx
 *   node examples/verify-deposit.mjs <TXID>
 *   node examples/verify-deposit.mjs <TXID> <TO_ADDRESS>   # also require the same op to reach TO_ADDRESS
 * ---------------------------------------------------------------------------
 */

const BASE = "https://api.mainnet.minepi.com";

// A real Pi Mainnet transaction (native payment) used as the default sample.
const DEFAULT_TX =
  "e0916b2f64bef9da8ac6c2e784a98e48102637a77654a1a73055cb2b6927914c";

const txid = process.argv[2] || DEFAULT_TX;
const toAddress = process.argv[3] || null; // optional: expected recipient (e.g. exchange deposit address)

async function api(path) {
  const res = await fetch(BASE + path, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} -> ${path}`);
  return res.json();
}

const rule = (c = "-") => console.log(c.repeat(78));

// Does THIS operation deliver to the expected address? Accept both the plain
// `G...` account and the muxed `M...` form (CAP-27).
function goesTo(op, addr) {
  if (!addr) return false;
  return op.to === addr || op.to_muxed === addr;
}

async function main() {
  console.log("\n🔗  Pi Mainnet — verify one native Pi payment (e.g. a deposit)");
  console.log("    txid:", txid);
  if (toAddress) console.log("    expected recipient:", toAddress);
  rule("=");

  const tx = await api(`/transactions/${txid}`);
  console.log("📄  Transaction");
  console.log("    hash       :", tx.hash);
  console.log("    ledger     :", tx.ledger);
  console.log("    source     :", tx.source_account);
  console.log("    successful :", tx.successful);
  console.log("    memo       :", tx.memo_type, tx.memo ? JSON.stringify(tx.memo) : "-");
  rule();

  const ops = await api(`/transactions/${txid}/operations`);
  const records = ops._embedded.records;
  console.log(`⚙️   Operations (${records.length}) — matched PER OPERATION`);

  // Correctness: a single flag for "the SAME operation is native and (if asked)
  // goes to the expected recipient". Never split this across two variables.
  let sameOpVerified = false; // Claim B, per the caller's request
  let nativePayments = 0;

  for (const op of records) {
    if (op.type !== "payment") {
      console.log("    -", op.type);
      continue;
    }
    const isNative = op.asset_type === "native";
    if (isNative) nativePayments++;

    const toExpected = goesTo(op, toAddress);
    const ok = isNative && (!toAddress || toExpected);
    if (ok) sameOpVerified = true;

    console.log(`    - payment ${op.amount} ${isNative ? "native (Pi)" : op.asset_code}`);
    console.log(`        from : ${op.from}`);
    console.log(`        to   : ${op.to}`);
    if (op.to_muxed) console.log(`        to(M): ${op.to_muxed} # ${op.to_muxed_id}`);
    console.log(`        native=${isNative}  to_expected=${toAddress ? toExpected : "n/a"}  =>  ${ok ? "MATCH ✅" : "no"}`);
  }
  rule("=");

  console.log("✅  What the LEDGER proves (Claim B):");
  if (!toAddress) {
    console.log(
      `    • this transaction contains ${nativePayments} native Pi payment(s) on Pi Mainnet.`
    );
    console.log("    • (pass a TO_ADDRESS to require that the SAME op reaches it)");
  } else {
    if (sameOpVerified) {
      console.log("    • VERIFIED: a SINGLE operation is BOTH a native Pi payment");
      console.log("      AND directed to the expected recipient.");
    } else {
      console.log("    • NOT VERIFIED: no single operation is both a native Pi payment");
      console.log("      and directed to the expected recipient.");
      console.log("      (a native payment elsewhere in the tx does NOT count.)");
    }
  }
  rule();

  console.log("🚫  What the LEDGER cannot prove (Claim C — off-chain):");
  console.log("    • that an exchange credited an internal balance for this deposit;");
  console.log("    • that the venue's total internal liabilities are fully backed on-chain.");
  console.log("    -> those are counterparty/reserve claims, not protocol facts.");
  rule();

  console.log("ℹ️  Scope note:");
  console.log("    Claim A (fungibility): a native Pi payment carries no observable");
  console.log("      per-unit mining origin on the ledger — see docs/SCOPE.md.");
  console.log("    Claim B (this tool): a specific transfer IS a real on-chain native payment;");
  console.log("      it is checked PER OPERATION (the same op must be native AND to the address).");
  console.log("    Claim C: reserve backing — NOT claimed here.");
  rule();
  console.log("");
}

main().catch((err) => {
  console.error("\n❌ ERROR:", err.message);
  process.exit(1);
});
