# Index — every file, and what question it answers

🌍 **English** · [العربية](INDEX.ar.md)

A map of the repository. Two layers:
- **Part 1 — By file** (what each file is).
- **Part 2 — By question** (find the answer to a specific objection).

Every document exists in **English** and **Arabic** (`*.ar.md`).

---

## Part 1 — By file

### Root
| File | What it is |
|---|---|
| [`README.md`](../README.md) · [`README.ar.md`](../README.ar.md) | **Start here.** TL;DR, official sources, 3-layer proof, FAQ table, scope, runnable code |
| [`PROOF.md`](../PROOF.md) · [`PROOF.ar.md`](../PROOF.ar.md) | Step-by-step proof that an app owner cannot tell where π came from |
| [`SCOPE.md`](SCOPE.md) · [`SCOPE.ar.md`](SCOPE.ar.md) | **Precise scope:** what is proven vs **not** claimed (+ independent verification) |
| [`SECURITY.md`](../SECURITY.md) · [`SECURITY.ar.md`](../SECURITY.ar.md) | Read-only by design: no wallet/passphrase/keys/signing/deps; how to audit |
| [`DISCLAIMER.md`](../DISCLAIMER.md) · [`DISCLAIMER.ar.md`](../DISCLAIMER.ar.md) | Independent & unofficial; no financial advice; no custody; no warranty |
| [`SOURCES.md`](SOURCES.md) · [`SOURCES.ar.md`](SOURCES.ar.md) | All official sources, with verbatim quotes (§1–§16) |
| [`LICENSE`](../LICENSE) | MIT |

### Docs — FAQ (one per objection)
| File | Question it answers |
|---|---|
| [`FAQ-RECIPIENT-CANNOT-TELL.md`](FAQ-RECIPIENT-CANNOT-TELL.md) · [.ar](FAQ-RECIPIENT-CANNOT-TELL.ar.md) | **“I mixed mined + bought π, then sent some — can the recipient tell?”** (deterministic proof) |
| [`FAQ-CAN-CORE-TEAM-SET-PRICE.md`](FAQ-CAN-CORE-TEAM-SET-PRICE.md) · [.ar](FAQ-CAN-CORE-TEAM-SET-PRICE.ar.md) | **“Can the Core Team set a different price by origin, or block sales?”** (no — on-chain) |
| [`FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](FAQ-EXCHANGE-DEPOSIT-VERIFY.md) · [.ar](FAQ-EXCHANGE-DEPOSIT-VERIFY.ar.md) | **“Is an exchange’s balance really backed?”** → three claims: A fungibility (proven), B a specific deposit (verifiable), C reserve backing (not claimed) |
| [`FAQ-MICRO-PI-ID.md`](FAQ-MICRO-PI-ID.md) · [.ar](FAQ-MICRO-PI-ID.ar.md) | “Every micro-π has its own ID” |
| [`FAQ-MUXED-M-VS-G.md`](FAQ-MUXED-M-VS-G.md) · [.ar](FAQ-MUXED-M-VS-G.ar.md) | “Exchanges use `M` addresses, not `G`” |
| [`MICA-WHITEPAPER.md`](MICA-WHITEPAPER.md) · [.ar](MICA-WHITEPAPER.ar.md) | “The MiCA whitepaper says Pi comes only from mining” |
| [`FAQ-DONT-BUY-PI.md`](FAQ-DONT-BUY-PI.md) · [.ar](FAQ-DONT-BUY-PI.ar.md) | “Pi once said *don’t buy Pi*” (Enclosed Mainnet; ended 2025-02-20) |
| [`FAQ-FUNGIBILITY-VS-PRICE.md`](FAQ-FUNGIBILITY-VS-PRICE.md) · [.ar](FAQ-FUNGIBILITY-VS-PRICE.ar.md) | “Same coin ≠ same price” |
| [`FAQ-UNOFFICIAL-REPO-SCAM.md`](FAQ-UNOFFICIAL-REPO-SCAM.md) · [.ar](FAQ-UNOFFICIAL-REPO-SCAM.ar.md) | “It’s an unofficial GitHub repo — must be a scam/phishing” |
| [`FAQ-ALL-OBJECTIONS.md`](FAQ-ALL-OBJECTIONS.md) · [.ar](FAQ-ALL-OBJECTIONS.ar.md) | Full catalog of every remaining objection (groups A–E) |

### Examples — runnable proofs (zero dependencies)
| File | What it does |
|---|---|
| [`provenance-check.mjs`](../examples/provenance-check.mjs) | Reads a real tx on-chain; shows there is **no origin field** |
| [`coin-id-check.mjs`](../examples/coin-id-check.mjs) | Shows the balance is **one scalar** — no per-unit ID |
| [`mixing-check.mjs`](../examples/mixing-check.mjs) | Live demo: commingling → scalar balance → **origin-less** payment |
| [`verify-deposit.mjs`](../examples/verify-deposit.mjs) | Verifies a **specific** transfer is a real native Pi payment on Mainnet (Claim B) |
| [`self-test.mjs`](../examples/self-test.mjs) | Automated check of the per-operation match (correct → VERIFIED, wrong → NOT VERIFIED) |
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
| Exchanges use `M`, not `G`? | [`FAQ-MUXED-M-VS-G.md`](FAQ-MUXED-M-VS-G.md) |
| Can the Core Team set a different price / block sales? | [`FAQ-CAN-CORE-TEAM-SET-PRICE.md`](FAQ-CAN-CORE-TEAM-SET-PRICE.md) |
| Is an exchange’s on-chain balance really backed? | [`FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](FAQ-EXCHANGE-DEPOSIT-VERIFY.md) |
| The MiCA whitepaper says “only through mining”? | [`MICA-WHITEPAPER.md`](MICA-WHITEPAPER.md) |
| “Pi said don’t buy Pi”? | [`FAQ-DONT-BUY-PI.md`](FAQ-DONT-BUY-PI.md) |
| Same coin but different price? | [`FAQ-FUNGIBILITY-VS-PRICE.md`](FAQ-FUNGIBILITY-VS-PRICE.md) |
| Is this repo a scam / phishing? | [`FAQ-UNOFFICIAL-REPO-SCAM.md`](FAQ-UNOFFICIAL-REPO-SCAM.md) · [`SECURITY.md`](../SECURITY.md) · [`DISCLAIMER.md`](../DISCLAIMER.md) |
| What exactly is proven — and not? | [`SCOPE.md`](SCOPE.md) |
| Any other objection (lockups, KYC, governance…)? | [`FAQ-ALL-OBJECTIONS.md`](FAQ-ALL-OBJECTIONS.md) |
| Which official sources back all this? | [`SOURCES.md`](SOURCES.md) |

---

## Part 3 — Run the proofs

```bash
node examples/provenance-check.mjs
node examples/coin-id-check.mjs
node examples/mixing-check.mjs
node examples/mixing-check.mjs <SENDER_ACCOUNT>
```
Node 18+ · **zero dependencies** · **read-only** (see [`SECURITY.md`](../SECURITY.md)).

---

> **π = π.** Proven: a payment carries **no observable per-coin origin**.
> Not claimed: price, identity-hiding, IOU equivalence. See [`SCOPE.md`](SCOPE.md).
