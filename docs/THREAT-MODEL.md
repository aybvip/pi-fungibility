# Threat model

> Who could try to break the claim, what they control, and why they cannot — stated in the standard
> **assets / actors / capabilities / assumptions / out-of-scope** form an auditor expects.

This file does **not** add a new claim. It makes explicit the **assumptions** behind the claim in
[`SCOPE.md`](SCOPE.md) §1, so an auditor knows exactly where to push.

---

## 1. Asset and goal

- **Asset under analysis:** a **native** Pi unit on **Pi Mainnet** (the ledger’s native asset;
  `asset_type: "native"`).
- **Security goal (the claim):** *origin-unlinkability at the unit level* — a recipient, app, or exchange
  **cannot** determine whether a given received π was mined, bought, or sent by another app. Equivalently:
  **a native Pi payment carries no observable per-unit mining origin** on the ledger.
- **Non-goal:** hiding **account-level** history, defeating **KYC**, or proving an exchange’s **reserves**
  (see §6).

---

## 2. Actors

| Actor | What they are | Relevance |
|---|---|---|
| **Recipient / merchant** | An app owner or person receiving π (Pi SDK + Platform API access) | The party who would *want* to distinguish origin |
| **Exchange / custodian** | A centralized venue holding pooled balances (OKX, Bitget, …) | Source of “exchange π”; can also be an observer |
| **On-chain analyst** | Anyone reading the public ledger / Horizon | Can perform transaction-graph analysis |
| **Issuer / Core Team** | Pi Network (as a centralized organization) | Controls app/Wallet policy, off-chain |
| **Network / infrastructure** | The Pi Mainnet + the public API endpoint | Assumed honest-by-design (§4) |
| **Smart-contract author (Soroban)** | A developer deploying a contract on Pi (protocol 22+) | Can define state/rules for **its own token/contract**; cannot read native π’s per-unit origin |

---

## 3. Capabilities — can vs cannot

| Actor | **CAN** | **CANNOT** |
|---|---|---|
| Recipient / merchant | Read `amount, from, to, memo, metadata, txid`; observe `asset_type`; run graph analysis on what they see | See **any** per-unit field: there is **none** in the state or in `PaymentDTO` |
| Exchange / custodian | Label **its own** deposit addresses; keep a **private** internal ledger; choose what it credits | Write a per-unit origin onto the **protocol**; make the ledger store one |
| On-chain analyst | Link **accounts** over time (if an address is publicly labeled); cluster heuristics | Attribute a **specific unit** to a past source — the state has no units |
| Issuer / Core Team | Set **app-layer / Wallet policy**; run KYC; operate infrastructure | Freeze or re-label **native** balances **on-chain** (no issuer controls — MiCA G.3 / G.11); set a **price by origin** |
| Network / API | Serve canonical ledger data | (assumed correct — see §4) |
| Smart-contract author (Soroban) | Hold **contract state**; define **rules for its own token**; use the token interface’s scalars (`balance`/`allowance`/`transfer_from`) | Read or write a **per-unit origin** for **native** π (the token interface exposes only scalars); make the ledger store one |

---

## 4. Trust assumptions (what we *do* trust)

If any of these is false, the claim must be revisited:

1. **Ledger integrity** — Pi Mainnet correctly records scalar balances and does not attach per-unit
   provenance. (Supported by the Account/Balance model + on-chain reads.)
2. **Official documentation is authentic** — the quotes in [`SOURCES.md`](SOURCES.md) (docs.minepi.com, the
   MiCA whitepaper, the Platform API docs) say what is attributed to them.
3. **The API reflects the ledger** — `https://api.mainnet.minepi.com` returns canonical data
   (Horizon-compatible).
4. **No hidden per-unit feature** — no undocumented protocol feature adds per-unit origin. (This is the
   highest-value thing for an auditor to falsify — see [`AUDIT-REQUEST.md`](AUDIT-REQUEST.md).)

> We do **not** assume the exchange, the Core Team, or the analyst is honest — only the **protocol-level**
> data model.

---

## 5. Attack scenarios and outcomes

| # | Attack / objection | Outcome |
|---|---|---|
| 5.1 | “Sell **premium mined π**” (label units by origin) | ❌ **Fails** — no per-unit origin exists to label; a recipient cannot verify it |
| 5.2 | “Apply **taint / segregation** to incoming π” | ❌ **Undefined** — balances are scalar; there is nothing to tag |
| 5.3 | “Follow the **transaction graph** to a labeled exchange wallet” | ⚠️ **Succeeds at account level** — *out of scope*: it links **accounts**, never **coins** (§4 of `SCOPE.md`) |
| 5.4 | “Use **KYC** to link a person” | ⚠️ **Off-chain** — links a **human**, not an **origin to a unit** (*out of scope*) |
| 5.5 | “Present a **wrapped / IOU** token as native π” | ⚠️ **Real risk** — a token is a **different asset**; check `asset_type` + `issuer` (Claim C, out of scope) |
| 5.6 | “Issuer **freezes / re-labels** native π” | ❌ **Not on-chain** — native has no issuer; no freeze authority (MiCA G.3, G.11) |
| 5.7 | “Set a **different price** for mined vs exchange π” | ❌ **Not on-chain** — no origin and no price field (see [`FAQ-CAN-CORE-TEAM-SET-PRICE.md`](FAQ-CAN-CORE-TEAM-SET-PRICE.md)) |
| 5.8 | “**Re-identify** an origin by internal exchange logs” | ⚠️ **Private/off-chain** — a venue’s own ledger is not the protocol (Claim C, out of scope) |
| 5.9 | “Deploy a **Soroban contract** to build a **taint / origin overlay**” | ❌ for native π / ⚠️ as an overlay — a contract sees only **its own** deposits (an **account-level** graph) and must **trust its own rules**; it cannot observe native π’s per-unit origin (none exists) |
| 5.10 | “**Ecosystem tokens / Pi Launchpad** (PiRC1) differentiate Pi units” | ⚠️ **Different asset** — launched units are **separate tokens**; Pi is used as the **staked/liquidity asset** by scalars. Check issuer/contract id (Group C, out of scope) |

Legend: ❌ blocked by the claim · ⚠️ real but **explicitly out of scope**.

---

## 6. Out of scope (deliberately)

- **Claim B** (a *specific* deposit is native on Mainnet) — verifiable per case, not a blanket fact.
- **Claim C** (a venue’s reserves back all internal balances) — a **counterparty** claim, not a protocol fact.
- Price / market value · identity hiding / anti-KYC · legal/regulatory conclusions.

See [`FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](FAQ-EXCHANGE-DEPOSIT-VERIFY.md).

---

## 7. Residual risk and what would change the analysis

- **Protocol change:** if Pi (or its Stellar base) ever added per-unit provenance, the claim would break.
  Re-check [`SOURCES.md`](SOURCES.md) dates and re-run the tests.
- **Protocol additions are not provenance:** Pi’s **Soroban smart-contract** layer (protocol 22; PiRC1/PiRC2,
  official blog 2026-04-17) adds a contract platform and **ecosystem tokens** — **separate assets** — but the
  contract-facing token interface exposes only **scalars** (`balance`/`allowance`/`transfer`). Re-check on
  future protocol upgrades ([`FAQ-SMART-CONTRACTS-AND-TOKENS.md`](FAQ-SMART-CONTRACTS-AND-TOKENS.md)).
- **Undocumented behavior:** a hidden per-unit feature would invalidate assumption §4.4.
- **Data-integrity failure:** if the public API diverged from the ledger, the tests would mislead — this is
  why every claim is also tied to **documented semantics**, not only to live reads.
- **No independent audit yet** — see [`AUDIT-REQUEST.md`](AUDIT-REQUEST.md) (this is the honest status).

---

## 8. How to test the model

Run the reproducible checks (see [`CONTRIBUTING.md`](../CONTRIBUTING.md)):

```bash
node examples/model-check.mjs        # 2000 seeds: scalar state, non-injective history, origin-invisible
node examples/exhaustive-check.mjs   # ALL 1452 bounded histories: origin-invisible for every one
node examples/verify-deposit.mjs <TXID> [TO_ADDRESS]   # Claim B: a specific transfer is native on Mainnet
```

Or everything at once:

```bash
node examples/run-all.mjs            # full suite + summary   (--offline to skip network checks)
```
