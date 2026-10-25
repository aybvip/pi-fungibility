# Examples — Runnable proofs

All examples are **read-only**, have **zero dependencies**, and run with Node.js `>= 18`.

## Quick start

```bash
# Run every check (live + offline). Exits 0 only if all pass.
npm test

# Run only offline/deterministic checks (no network calls)
npm run offline

# Run the full self-test suite (37 checks)
npm run verify

# Explicit falsification attempt (looks for any origin field on-chain)
npm run falsify
```

## Reference table

| Script | Type | What it proves / does | Notes |
| --- | --- | --- | --- |
| [`run-all.mjs`](run-all.mjs) | Orchestrator | Runs the full suite and prints a single summary. Accepts `--offline`. | Best starting point. Also saves `run-all-output.txt`. |
| [`self-test.mjs`](self-test.mjs) | Offline + online | 37 checks: failed-tx gating, transport-failure handling (HTTP 500/429, invalid JSON, timeout/connection), correct/wrong verification. | The CI gate (`.github/workflows/self-test.yml`). Saves `self-test-output.txt`. |
| [`provenance-check.mjs`](provenance-check.mjs) | **Live (read-only)** | Queries Horizon and shows **no** `origin`, `mining`, or provenance field exists anywhere in account/payment/operation data. Can target a specific TXID. | Saves `provenance-check-output.txt`. |
| [`falsify-try.mjs`](falsify-try.mjs) | **Live (read-only)** | Actively tries to *falsify* the claim: scans every key returned by Horizon for a real payment (transaction, operations, effects, account). Exits non-zero if anything origin-like is found. | Strongest "try to break it" test. |
| [`coin-id-check.mjs`](coin-id-check.mjs) | Live + explanation | Proves Pi uses an **Account/Balance** model, not UTXO. No per-micro-π ID exists. | Saves `coin-id-output.txt`. |
| [`mixing-check.mjs`](mixing-check.mjs) | **Live (read-only)** | Demonstrates "mined + bought → mixed → sent": commingling produces a single scalar balance and an origin-less payment. | Directly matches the common objection. Saves `mixing-check-output.txt`. |
| [`verify-deposit.mjs`](verify-deposit.mjs) | **Live (read-only)** | Verifies a *specific* native Pi transfer exists on Mainnet (Claim B). Explicitly states it **cannot** prove reserve backing (Claim C). | Usage: `node examples/verify-deposit.mjs <TXID> [TO_ADDRESS]`. Saves `verify-deposit-output.txt`. |
| [`memo-check.mjs`](memo-check.mjs) | **Live (read-only)** | Samples real Mainnet payments and shows the vast majority carry `memo_type: "none"`. Memo is **optional, sender-written**, not a provenance channel. | Informational evidence for Layer 2. |
| [`exchange-wallets.mjs`](exchange-wallets.mjs) | **Live (read-only)** | Observes labeled venue addresses (e.g. Bitget/OKX) and shows native payments with `to_muxed_id` identify the **user**, not the **coin origin**. | Reproduces the concrete example from the README. Saves `exchange-wallets-output.txt`. |
| [`model-check.mjs`](model-check.mjs) | **Offline (deterministic)** | Executable model of Account/Balance: `history → state` is **non-injective**. 2000 random histories show origin is not recoverable from state. | Information-theoretic proof. Saves `model-check-output.txt`. |
| [`exhaustive-check.mjs`](exhaustive-check.mjs) | **Offline (deterministic)** | Exhaustively checks **all 1,452** histories in a bounded domain. Origin-invisibility holds for every single one. | Stronger than sampling. Saves `exhaustive-check-output.txt`. |
| [`lib.mjs`](lib.mjs) | Shared | Robust Horizon client (status/body on errors), StrKey validation, small helpers. Used by live examples. | Not meant to be run directly. |
| [`regenerate-snapshots.mjs`](regenerate-snapshots.mjs) | Utility | Regenerates the `*-output.txt` snapshots from current code. | Dev-only. |
| [`app-payment-flow/`](app-payment-flow/) | Demo | Minimal U2A flow using `Pi.createPayment` + a backend that inspects `PaymentDTO` (shows **no** origin field). | Reference only, not required to verify the claim. |

## Notes on verification

- **Live checks** hit `https://api.mainnet.minepi.com`. Network issues can make a run fail independently of the claim.
- **Offline checks** (`--offline` / model/exhaustive/self-test's offline layers) are fully deterministic and are the parts that actually hold up under falsification.
- **Read-only by design:** none of these scripts sign, send, or write to the ledger. They only `GET` public data.
- **"Trace transactions, not coins":** you can trace accounts/txids, but there is no per-unit identity to trace.
