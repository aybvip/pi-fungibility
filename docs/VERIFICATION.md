# Verification status — what was run, when, where, and what it does **not** prove

> **Read this page first if you are evaluating the repository.**
>
> It answers one question: *"Has anyone actually run this, and did it work?"* — and it is deliberately
> explicit about the difference between
> **automated test results**, **live Mainnet reads**, and an **independent audit** (which this repo does **not** have).

---

## 1. What "verified" means here — and what it does not

| Term | Meaning in this repository |
|---|---|
| **Automated check** | A deterministic script assertion. Offline layers never touch the network, so they cannot be flaky. |
| **Live Mainnet read** | A real `GET` against the public Pi Mainnet API (`https://api.mainnet.minepi.com`). Read-only. Result depends on the API being reachable. |
| **Third-party audit** | An independent organisation reviewing the code and claims. ❌ **This repository has none.** |

> ⚠️ **"Verified" on this page never means "audited".** It means: *the commands below were executed, on the date
> shown, and the recorded output was produced.* Status and scope of an audit: [`AUDIT-REQUEST.md`](AUDIT-REQUEST.md).

---

## 2. Last verified

| | |
|---|---|
| **Date** | **2026-10-18** |
| **Local environment** | Node **v24.13.0** (Windows) |
| **Continuous integration** | Node **20.x** and **22.x** on `ubuntu-latest` |
| **Command run** | `node examples/run-all.mjs` |
| **Result** | ✅ **all checks passed**, exit code `0` |
| **Scope** | The repository state of **2026-10-18** |

Every push to `main` re-runs the full suite (offline **and** live Mainnet layers) on both Node versions:
[`.github/workflows/self-test.yml`](https://github.com/aybvip/pi-fungibility/blob/main/.github/workflows/self-test.yml) · status badge on the
[README](../README.md).

> **Where did the live Mainnet reads happen?** In **CI** (GitHub-hosted runner) and **locally**. The CI job runs
> `node examples/run-all.mjs` **without** `--offline`, so the online layers really do query
> `api.mainnet.minepi.com` on every push. They are **reachability-dependent**: a red build can mean the network
> was down, not that a claim broke — §6 explains how to tell the difference.

---

## 3. Results by layer

| # | Layer | Kind | Network? | Where it ran | Result |
|---|---|---|---|---|---|
| 0 | Input validation (`G…`, `M…`, txid shapes) | automated | no | local + CI | ✅ 7/7 |
| 1 | `evaluate()` decision rules (same-op rule, failed-tx gate) | automated | no | local + CI | ✅ 11/11 |
| 2 | **Transport failure handling** (HTTP 500/429, invalid JSON, connection failure, timeout) | automated | no (injected transport) | local + CI | ✅ 8/8 |
| 3 | End-to-end `verify-deposit.mjs` on a stable Mainnet tx | automated + **live read** | **yes** | local + CI | ✅ 3/3 |
| 4 | `provenance-check.mjs` — no origin field on a real payment | live read | **yes** | local + CI | ✅ |
| 5 | `memo-check.mjs` — `memo` is optional (200-tx sample, `memo_type: "none"`) | live read | **yes** | local + CI | ✅ |
| 6 | `coin-id-check.mjs` — balance is a single scalar | live read | **yes** | local + CI | ✅ |
| 7 | `mixing-check.mjs` — commingling → origin-less payment | live read | **yes** | local + CI | ✅ |
| 8 | `model-check.mjs` — ledger model + property check | automated | no | local + CI | ✅ 2 000 seeds |
| 9 | `exhaustive-check.mjs` — bounded exhaustive check | automated | no | local + CI | ✅ all 1 452 histories |
| 10 | `falsify-try.mjs` — enumerate the whole observable surface for an origin field (F1/F3) | live read | **yes** | local + CI | ✅ no origin-like key |

**Totals for the self-test file (rows 0–3): 29 checks, 29 passed, 0 failed** — 26 offline + 3 online.
The committed transcript is [`examples/self-test-output.txt`](../examples/self-test-output.txt).

---

## 4. The live Mainnet read, in full

The stable sample transaction is checked into the test as a reference point:

| Field | Value |
|---|---|
| **txid** | `e0916b2f64bef9da8ac6c2e784a98e48102637a77654a1a73055cb2b6927914c` |
| **ledger** | `27024280` |
| **source** | `GBWKGBVDEJO3JKRV7IUBHXMBE7A2JYHOGMUMKEO2XM5RFIRBRVSYHTZA` |
| **successful** | `true` |
| **memo** | text `"VV352v94UwCxraXcrr75XYHSHUrT"` |
| **operation** | `payment` — **0.8000000** `native` (Pi) |
| **destination** | `GC55LFCTGSDPDMNDIOHZVVA4CYCUF4IKI2SUGHWCJA2PCLPKH4HMDMIU` |
| **verdict** | **VERIFIED** — succeeded, and the **same** operation is **both** native **and** addressed to the expected recipient |

Reproduce it yourself:

```bash
node examples/verify-deposit.mjs \
  e0916b2f64bef9da8ac6c2e784a98e48102637a77654a1a73055cb2b6927914c \
  GC55LFCTGSDPDMNDIOHZVVA4CYCUF4IKI2SUGHWCJA2PCLPKH4HMDMIU
```

> The tool prints, in the same output, **what the ledger proves** (Claim B) and **what it cannot prove**
> (Claim C — that an exchange credited an internal balance, or that its liabilities are fully backed).

---

## 5. Automated checks are the load-bearing part

Because the offline layers are deterministic, they are the ones that actually hold the claims up:

- **Same-operation rule** — a foreign asset arriving *in the same transaction* as a native payment must never
  be reported as verified. Pinned by 2 opposite cases (rows 1, and multi-op cases).
- **Failed-transaction gate** — `successful=false` can **never** produce `VERIFIED`, even when the operation
  looks perfect. This is the anti-false-positive gate.
- **Transport failure handling** — an HTTP error, a non-JSON body, a connection failure or a hung socket must
  raise a **clear error**, never crash and never silently return `undefined`. Tested with an **injected
  transport**, so it needs no network and cannot be flaky.
- **Commingling** — after a merge, the recipient's view is independent of the sender's history.

A request that never answers is aborted after **15 s** (`DEFAULT_TIMEOUT_MS`) and reported as
`timeout after 15000ms -> …`, so no command can hang forever.

---

## 6. Continuous verification, and how to read a red build

Every push and pull request runs the same suite twice (Node 20 and 22):

```bash
node examples/run-all.mjs            # offline + live Mainnet layers
node examples/run-all.mjs --offline  # offline only — no network at all
```

| Symptom | Most likely cause |
|---|---|
| Offline layers (0, 1, 2, 7, 8) fail | **A real regression.** Investigate before anything else. |
| Only online layers (3–6) fail, with `network error` / `timeout after …` / `HTTP 5xx` | The public API was unreachable or rate-limited. Re-run; if it recurs, check the endpoint's status. |
| `HTTP 429` | Rate limited — wait and re-run. |

If you only want to confirm the logic without trusting any network, run:

```bash
node examples/run-all.mjs --offline
```

---

## 7. What is **not** verified here

- ❌ **No independent / third-party audit.** Everything is **self-verified and reproducible**.
- ❌ **Claim C — reserve backing.** That an exchange's internal balance equals on-chain π it holds is an
  **off-chain** fact; it is **never** asserted. See [`FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](FAQ-EXCHANGE-DEPOSIT-VERIFY.md).
- ❌ **Price, value, or future worth.** Fungibility is not a price claim — see
  [`FAQ-FUNGIBILITY-VS-PRICE.md`](FAQ-FUNGIBILITY-VS-PRICE.md).
- ❌ **Identity-level privacy.** Address-level transaction-graph analysis remains possible, as stated in
  [`SCOPE.md`](SCOPE.md) §3.2. Only **per-unit** provenance is undefined.
- ❌ **Exhaustiveness over the whole chain.** The checks are property checks on a model plus live spot checks on
  named transactions — not a scan of the entire ledger.

---

## 8. Reproduce everything in about a minute

```bash
git clone https://github.com/aybvip/pi-fungibility
cd pi-fungibility
node examples/run-all.mjs           # requires Node 18+; no dependencies to install
```

Then compare your output with the committed transcripts in [`examples/`](../examples)
(`*-output.txt`), which are stored as clean UTF-8 with LF endings so they are platform-stable.

---

## 9. Sources and their pinned revisions

The exact revision of every official source this repository relies on — including a **SHA-256 of the MiCA
whitepaper PDF** — is recorded in [`SOURCES.md`](SOURCES.md) §0.

---

## 10. Change log of this page

| Date | Change |
|---|---|
| 2026-10-18 | Page created. Added the offline **transport-failure** layer (HTTP 500/429, invalid JSON, connection failure, timeout) and a **15 s** request timeout; self-test grew from 21 to **29** checks. Added source revision pinning. |
