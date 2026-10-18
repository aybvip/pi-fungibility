#!/usr/bin/env node
/**
 * verify-deposit.mjs
 * ---------------------------------------------------------------------------
 * Verifies ONE specific claim: that a given transaction is a real **native Pi
 * payment on Pi Mainnet** — e.g. a deposit into an exchange's on-chain address.
 *
 * It proves what the LEDGER can prove:
 *   - the transaction SUCCEEDED (tx.successful === true), AND
 *   - an operation of type "payment" with asset_type "native", AND
 *   - from address -> to address, and the amount, AND
 *   - optionally, that the **same operation** goes TO a specific address
 *
 * It does NOT (and cannot) prove what is off-chain:
 *   - that an exchange credited the corresponding internal balance,
 *   - that the exchange's total internal liabilities are fully backed on-chain.
 *   (Those are counterparty/reserve claims — see docs/FAQ-EXCHANGE-DEPOSIT-VERIFY.md.)
 *
 * TWO CORRECTNESS RULES (important):
 *   (1) A Stellar/Pi transaction can contain MULTIPLE operations. So we must NOT
 *       test "is there a native payment?" and "does some op reach the expected
 *       address?" as two independent facts. The SAME single operation must be
 *       BOTH native AND directed to the expected recipient.
 *   (2) A FAILED transaction still returns its operations from Horizon, but they
 *       did NOT take effect. So `tx.successful` is a REQUIRED gate, not merely
 *       displayed. A failed tx can never yield "VERIFIED".
 *
 * Zero dependencies (Node 18+ built-in fetch).
 *
 * Usage:
 *   node examples/verify-deposit.mjs                       # uses a default sample tx
 *   node examples/verify-deposit.mjs <TXID>
 *   node examples/verify-deposit.mjs <TXID> <TO_ADDRESS>   # require the same op to reach TO_ADDRESS
 *   node examples/verify-deposit.mjs --help
 *
 * The pure decision function `evaluate()` is exported so it can be unit-tested
 * offline (see examples/self-test.mjs).
 * ---------------------------------------------------------------------------
 */

import { pathToFileURL } from "node:url";
import { api, rule as ruleLine, isTxHash, isAddress, usageAndExit } from "./lib.mjs";

const rule = (c = "-") => ruleLine(c, 78);

// A real Pi Mainnet transaction (native payment) used as the default sample.
const DEFAULT_TX =
  "e0916b2f64bef9da8ac6c2e784a98e48102637a77654a1a73055cb2b6927914c";

const HELP = [
  "verify-deposit.mjs — is a transaction a real native Pi payment on Mainnet?",
  "",
  "Usage:",
  "  node examples/verify-deposit.mjs                       # built-in sample tx",
  "  node examples/verify-deposit.mjs <TXID>                # a 64-char hex hash",
  "  node examples/verify-deposit.mjs <TXID> <TO_ADDRESS>   # require the SAME op to reach TO_ADDRESS",
  "  node examples/verify-deposit.mjs --help",
  "",
  "  <TO_ADDRESS>  a G... account or an M... muxed address (CAP-27)",
  "",
  "Proves Claim B (the tx is native on-chain). Cannot prove Claim C (reserve",
  "backing / an internal credit) — that is off-chain. Read-only. Node 18+.",
];

// Does THIS operation deliver to the expected address? Accept both the plain
// `G...` account and the muxed `M...` form (CAP-27).
function goesTo(op, addr) {
  if (!addr) return false;
  return op.to === addr || op.to_muxed === addr;
}

/**
 * Pure decision function — no network. Given the transaction record, its
 * operations, and an optional expected recipient, return the verdict.
 *
 * @returns {{
 *   txOk: boolean,
 *   nativePayments: number,
 *   sameOpVerified: boolean,
 *   ops: Array<object>,
 *   verdict: "VERIFIED"|"NOT_VERIFIED_TX_FAILED"|"NOT_VERIFIED"|"NATIVE_PRESENT"|"NO_NATIVE_PAYMENT"
 * }}
 */
export function evaluate(tx, records, toAddress) {
  const list = Array.isArray(records) ? records : [];
  const txOk = Boolean(tx) && tx.successful === true;

  let nativePayments = 0;
  let sameOpVerified = false;
  const ops = [];

  for (const op of list) {
    if (!op || op.type !== "payment") {
      ops.push({ type: op ? op.type : "(unknown)" });
      continue;
    }
    const isNative = op.asset_type === "native";
    if (isNative) nativePayments++;

    // RULE (1): the SAME operation must satisfy both conditions.
    const toExpected = goesTo(op, toAddress);
    const matches = isNative && (!toAddress || toExpected);
    if (matches) sameOpVerified = true;

    ops.push({
      type: "payment",
      isNative,
      amount: op.amount,
      asset_code: op.asset_code,
      from: op.from,
      to: op.to,
      to_muxed: op.to_muxed,
      to_muxed_id: op.to_muxed_id,
      toExpected,
      matches,
    });
  }

  // RULE (2): a failed transaction can never be VERIFIED.
  let verdict;
  if (!txOk) {
    verdict = "NOT_VERIFIED_TX_FAILED";
  } else if (!toAddress) {
    verdict = nativePayments > 0 ? "NATIVE_PRESENT" : "NO_NATIVE_PAYMENT";
  } else {
    verdict = sameOpVerified ? "VERIFIED" : "NOT_VERIFIED";
  }

  return { txOk, nativePayments, sameOpVerified, ops, verdict };
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) usageAndExit(HELP, 0);

  const txid = argv[0] || DEFAULT_TX;
  const toAddress = argv[1] || null; // optional: expected recipient

  if (!isTxHash(txid)) {
    usageAndExit([`✗ invalid transaction hash: ${txid}`, "", ...HELP]);
  }
  if (toAddress && !isAddress(toAddress)) {
    usageAndExit([`✗ invalid address (expected G... or M...): ${toAddress}`, "", ...HELP]);
  }

  console.log("\n🔗  Pi Mainnet — verify one native Pi payment (e.g. a deposit)");
  console.log("    txid:", txid);
  if (toAddress) console.log("    expected recipient:", toAddress);
  rule("=");

  const tx = await api(`/transactions/${txid}`);
  console.log("📄  Transaction");
  console.log("    hash       :", tx.hash);
  console.log("    ledger     :", tx.ledger);
  console.log("    source     :", tx.source_account);
  console.log("    successful :", tx.successful, tx.successful === true ? "(REQUIRED for VERIFIED)" : "(FAILED — cannot be VERIFIED)");
  console.log("    memo       :", tx.memo_type, tx.memo ? JSON.stringify(tx.memo) : "-");
  rule();

  const ops = await api(`/transactions/${txid}/operations`);
  const records = ops?._embedded?.records ?? [];

  const r = evaluate(tx, records, toAddress);

  console.log(`⚙️   Operations (${records.length}) — matched PER OPERATION`);
  for (const op of r.ops) {
    if (op.type !== "payment") {
      console.log("    -", op.type);
      continue;
    }
    console.log(`    - payment ${op.amount} ${op.isNative ? "native (Pi)" : op.asset_code}`);
    console.log(`        from : ${op.from}`);
    console.log(`        to   : ${op.to}`);
    if (op.to_muxed) console.log(`        to(M): ${op.to_muxed} # ${op.to_muxed_id}`);
    console.log(
      `        native=${op.isNative}  to_expected=${toAddress ? op.toExpected : "n/a"}  =>  ${op.matches ? "MATCH ✅" : "no"}`
    );
  }
  rule("=");

  console.log("✅  What the LEDGER proves (Claim B):");
  switch (r.verdict) {
    case "VERIFIED":
      console.log("    • VERIFIED: the transaction SUCCEEDED, and a SINGLE operation is BOTH a");
      console.log("      native Pi payment AND directed to the expected recipient.");
      break;
    case "NOT_VERIFIED_TX_FAILED":
      console.log("    • NOT VERIFIED: the transaction did NOT succeed (successful=false).");
      console.log("      Horizon still returns its operations, but they DID NOT take effect.");
      break;
    case "NOT_VERIFIED":
      console.log("    • NOT VERIFIED: no single operation is both a native Pi payment");
      console.log("      and directed to the expected recipient.");
      console.log("      (a native payment elsewhere in the tx does NOT count.)");
      break;
    case "NATIVE_PRESENT":
      console.log(`    • this SUCCEEDED transaction contains ${r.nativePayments} native Pi payment(s) on Pi Mainnet.`);
      console.log("    • (pass a TO_ADDRESS to require that the SAME op reaches it)");
      break;
    case "NO_NATIVE_PAYMENT":
      console.log("    • this transaction contains NO native Pi payment.");
      break;
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
  console.log("    Claim B (this tool): the tx must SUCCEED, and the SAME op must be");
  console.log("      native AND to the address (checked PER OPERATION).");
  console.log("    Claim C: reserve backing — NOT claimed here.");
  rule();
  console.log("");
}

// Only run main() when executed directly (so `evaluate` stays importable/testable).
const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch((err) => {
    console.error("\n❌ ERROR:", err.message);
    process.exit(1);
  });
}
