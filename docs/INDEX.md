# Index — every file, and what question it answers

A map of the repository. Two layers:
- **Part 1 — By file** (what each file is).
- **Part 2 — By question** (find the answer to a specific objection).

Every document is written in **English** (`*.md`).

---

## Part 1 — By file

### Root
| File | What it is |
|---|---|
| [`README.md`](../README.md) | **Start here.** TL;DR, official sources, 4-layer proof, FAQ table, scope, runnable code |
| [`PROOF.md`](../PROOF.md) | Step-by-step proof that an app owner cannot tell where π came from |
| [`SCOPE.md`](SCOPE.md) | **Precise scope:** what is proven vs **not** claimed (+ independent verification) |
| [`AUDIT-REQUEST.md`](AUDIT-REQUEST.md) | **Audit status:** not independently audited — what that means, and how to do one |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) | How to contribute: report findings, zero-dep rules, add a FAQ |
| [`THREAT-MODEL.md`](THREAT-MODEL.md) | **Threat model:** assets, actors, capabilities, trust assumptions, attacks, out-of-scope |
| [`SECURITY.md`](../SECURITY.md) | Read-only by design: no wallet/passphrase/keys/signing/deps; how to audit |
| [`DISCLAIMER.md`](../DISCLAIMER.md) | Independent & unofficial; no financial advice; no custody; no warranty |
| [`SOURCES.md`](SOURCES.md) | All official sources, with verbatim quotes (§1–§22) |
| [`index.html`](index.html) | Website landing page (GitHub Pages) |
| [`llms.txt`](llms.txt) | Machine-readable index for AI tools / LLM crawlers (site copy) |
| [`CITATION.cff`](../CITATION.cff) | Citation metadata (GitHub “Cite this repository”) |
| [`llms.txt`](../llms.txt) | Machine-readable index for AI tools / LLM crawlers (repo copy) |
| [`LICENSE`](../LICENSE) | MIT |

### Docs — FAQ (one per objection)
| File | Question it answers |
|---|---|
| [`FAQ-RECIPIENT-CANNOT-TELL.md`](FAQ-RECIPIENT-CANNOT-TELL.md) | **“I mixed mined + bought π, then sent some — can the recipient tell?”** (deterministic proof) |
| [`FAQ-CAN-CORE-TEAM-SET-PRICE.md`](FAQ-CAN-CORE-TEAM-SET-PRICE.md) | **“Can the Core Team set a different price by origin, or block sales?”** (no — on-chain) |
| [`FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](FAQ-EXCHANGE-DEPOSIT-VERIFY.md) | **“Is an exchange’s balance really backed?”** → three claims: A fungibility (proven), B a specific deposit (verifiable), C reserve backing (not claimed) |
| [`FAQ-MICRO-PI-ID.md`](FAQ-MICRO-PI-ID.md) | “Every micro-π has its own ID” |
| [`FAQ-SDK-PLATFORM-API-FIELDS.md`](FAQ-SDK-PLATFORM-API-FIELDS.md) | **“Doesn’t the SDK / Platform API expose where the π came from?”** (no — full field enumeration) |
| [`FAQ-SMART-CONTRACTS-AND-TOKENS.md`](FAQ-SMART-CONTRACTS-AND-TOKENS.md) | **“Pi now has Soroban smart contracts and ecosystem tokens — so you can tag a coin’s origin now?”** (no — scalars only; tokens are a different asset) |
| [`FAQ-MUXED-M-VS-G.md`](FAQ-MUXED-M-VS-G.md) | “Exchanges use `M` addresses, not `G`” |
| [`MICA-WHITEPAPER.md`](MICA-WHITEPAPER.md) | “The MiCA whitepaper says Pi comes only from mining” |
| [`FAQ-DONT-BUY-PI.md`](FAQ-DONT-BUY-PI.md) | “Pi once said *don’t buy Pi*” (Enclosed Mainnet; ended 2025-02-20) |
| [`FAQ-FUNGIBILITY-VS-PRICE.md`](FAQ-FUNGIBILITY-VS-PRICE.md) | “Same coin ≠ same price” |
| [`FAQ-UNOFFICIAL-REPO-SCAM.md`](FAQ-UNOFFICIAL-REPO-SCAM.md) | “It’s an unofficial GitHub repo — must be a scam/phishing” |
| [`FAQ-ALL-OBJECTIONS.md`](FAQ-ALL-OBJECTIONS.md) | Full catalog of every remaining objection (groups A–E) |

### Examples — runnable proofs (zero dependencies)
| File | What it does |
|---|---|
| [`provenance-check.mjs`](../examples/provenance-check.mjs) | Reads a real tx on-chain; shows there is **no origin field** |
| [`coin-id-check.mjs`](../examples/coin-id-check.mjs) | Shows the balance is **one scalar** — no per-unit ID |
| [`mixing-check.mjs`](../examples/mixing-check.mjs) | Live demo: commingling → scalar balance → **origin-less** payment |
| [`verify-deposit.mjs`](../examples/verify-deposit.mjs) | Verifies a **specific** transfer is a real native Pi payment on Mainnet (Claim B) |
| [`self-test.mjs`](../examples/self-test.mjs) | Automated checks: offline unit tests (same-op rule, failed-tx gate) + online end-to-end |
| [`model-check.mjs`](../examples/model-check.mjs) | Executable ledger model + property check (2000 seeds, offline): scalar state, non-injective history→state |
| [`exhaustive-check.mjs`](../examples/exhaustive-check.mjs) | Exhaustive bounded check (offline): enumerates all 1452 histories; origin-invisibility for every one |
| [`run-all.mjs`](../examples/run-all.mjs) | Runs every check and prints a summary (`--offline` to skip network) |
| [`lib.mjs`](../examples/lib.mjs) | Shared helpers: robust API client (status + body on error) and strkey validation |
| [`regenerate-snapshots.mjs`](../examples/regenerate-snapshots.mjs) | Maintenance tool: rewrites the `*-output.txt` snapshots as clean UTF-8/LF |
| [`app-payment-flow/frontend.html`](../examples/app-payment-flow/frontend.html) | Official `Pi.createPayment` flow (U2A) |
| [`app-payment-flow/server.js`](../examples/app-payment-flow/server.js) | Backend handling `PaymentDTO`; prints its keys |
| [`payment-dto-sample.json`](../examples/payment-dto-sample.json) | Sample `PaymentDTO` showing the missing origin field |
| `*-output.txt` | Committed outputs of the scripts (expected results) |

---

## Part 2 — By question

| The objection / question | Where to look |
|---|---|
| Are mined π and exchange π the same? | [`README.md`](../README.md) TL;DR · [`PROOF.md`](../PROOF.md) |
| Can the recipient tell mined from bought (after mixing)? | [`FAQ-RECIPIENT-CANNOT-TELL.md`](FAQ-RECIPIENT-CANNOT-TELL.md) |
| Doesn’t the transaction graph reveal the origin? | [`SCOPE.md`](SCOPE.md) §4 · [`FAQ-RECIPIENT-CANNOT-TELL.md`](FAQ-RECIPIENT-CANNOT-TELL.md) §3 |
| Every micro-π has an ID? | [`FAQ-MICRO-PI-ID.md`](FAQ-MICRO-PI-ID.md) |
| Doesn’t the SDK / Platform API expose the origin? | [`FAQ-SDK-PLATFORM-API-FIELDS.md`](FAQ-SDK-PLATFORM-API-FIELDS.md) |
| Do Soroban smart contracts / ecosystem tokens change fungibility? | [`FAQ-SMART-CONTRACTS-AND-TOKENS.md`](FAQ-SMART-CONTRACTS-AND-TOKENS.md) |
| Exchanges use `M`, not `G`? | [`FAQ-MUXED-M-VS-G.md`](FAQ-MUXED-M-VS-G.md) |
| Can the Core Team set a different price / block sales? | [`FAQ-CAN-CORE-TEAM-SET-PRICE.md`](FAQ-CAN-CORE-TEAM-SET-PRICE.md) |
| Is an exchange’s on-chain balance really backed? | [`FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](FAQ-EXCHANGE-DEPOSIT-VERIFY.md) |
| The MiCA whitepaper says “only through mining”? | [`MICA-WHITEPAPER.md`](MICA-WHITEPAPER.md) |
| “Pi said don’t buy Pi”? | [`FAQ-DONT-BUY-PI.md`](FAQ-DONT-BUY-PI.md) |
| Same coin but different price? | [`FAQ-FUNGIBILITY-VS-PRICE.md`](FAQ-FUNGIBILITY-VS-PRICE.md) |
| Is this repo a scam / phishing? | [`FAQ-UNOFFICIAL-REPO-SCAM.md`](FAQ-UNOFFICIAL-REPO-SCAM.md) · [`SECURITY.md`](../SECURITY.md) · [`DISCLAIMER.md`](../DISCLAIMER.md) |
| What exactly is proven — and not? | [`SCOPE.md`](SCOPE.md) |
| Has this been independently audited? | [`AUDIT-REQUEST.md`](AUDIT-REQUEST.md) |
| Who could attack this, and what do we assume? | [`THREAT-MODEL.md`](THREAT-MODEL.md) |
| Any other objection (lockups, KYC, governance…)? | [`FAQ-ALL-OBJECTIONS.md`](FAQ-ALL-OBJECTIONS.md) |
| Which official sources back all this? | [`SOURCES.md`](SOURCES.md) |

---

## Part 3 — Run the proofs

```bash
node examples/run-all.mjs            # everything at once (+ summary); add --offline to skip network

node examples/self-test.mjs          # offline unit tests + online end-to-end (21 checks)
node examples/model-check.mjs        # offline ledger model + property check (2000 seeds)
node examples/exhaustive-check.mjs   # offline exhaustive bounded check (all 1452 histories)
node examples/provenance-check.mjs
node examples/coin-id-check.mjs
node examples/verify-deposit.mjs <TXID> [TO_ADDRESS]
node examples/mixing-check.mjs
node examples/mixing-check.mjs <SENDER_ACCOUNT>
```
Node 18+ · **zero dependencies** · **read-only** (see [`SECURITY.md`](../SECURITY.md)).

---

> **π = π.** Proven: a payment carries **no observable per-coin origin**.
> Not claimed: price, identity-hiding, IOU equivalence, reserve backing, independent audit.
> See [`SCOPE.md`](SCOPE.md) · [`AUDIT-REQUEST.md`](AUDIT-REQUEST.md).
