# SCOPE — What this repository proves (and what it does **not**)

> A standalone, precise statement of the exact claims made here, their limits, and how **anyone** can verify
> them **independently** — without trusting the author.

---

## 0. Purpose

This file exists to draw a **sharp line** between:

- **what is actually proven** (a structural, checkable property of the Pi/Stellar data model), and
- **what is *not* claimed** (price, hiding your identity, evading law enforcement, etc.).

Every claim below is either (a) a **verbatim official source**, or (b) a **live on-chain test you can run**
yourself with zero dependencies.

---

## 1. The precise claim (one sentence)

> **“A native Pi payment carries no observable per-unit mining origin on the Pi Mainnet ledger.”**
> Mined π and exchange-bought π are the **same native asset**, and **no data** available to a recipient,
> an app, or an exchange distinguishes them.

That is the whole claim. No more, no less. (The Arabic rendering is in [`SCOPE.ar.md`](SCOPE.ar.md).)

### 1.1 Three different claims — do not blend them
| # | Claim | Status |
|---|---|---|
| **A** | **Protocol fungibility** — no observable per-unit mining origin | ✅ **Proven** (this file) |
| **B** | **A specific transfer is real** — a given deposit is a native Pi payment on Mainnet | ✅ **Verifiable per case** — [`FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](FAQ-EXCHANGE-DEPOSIT-VERIFY.md) |
| **C** | **Reserve backing** — the venue’s whole internal balance is fully backed on-chain | ❌ **Not claimed** (off-chain) |

See [`FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](FAQ-EXCHANGE-DEPOSIT-VERIFY.md) for the full separation.

---

## 2. What IS proven ✅

| # | Claim | Basis |
|---|---|---|
| 2.1 | Pi is a **native asset** with **no issuer** and **no contract** | Official docs + on-chain (`asset_type: "native"`) |
| 2.2 | The ledger stores a **single scalar balance** per (account, asset) — there are **no “pieces”** | Live API (`"balance": "2.0000000"`) |
| 2.3 | There is **no per-unit identity**, so **per-coin origin is not an observable** | Information-theoretic (see §7) |
| 2.4 | An app/recipient **cannot tell** mined π from exchange π | Pi SDK + Platform API `PaymentDTO` (no origin field) |
| 2.5 | Commingling is **deterministic**, not a loophole: after mixing, attribution is **undefined** | Account/Balance model (§7) |
| 2.6 | The issuer (Pi) itself classifies Pi as **“native, fungible”**, in a **Functionally Fungible Group**, **immutable**, with **no transfer restrictions** | MiCA whitepaper (F.2, F.14, G.3, G.11) |

---

## 3. What is **NOT** claimed ❌

| # | Non-claim | Why it is excluded |
|---|---|---|
| 3.1 | **No price / no future-value claim.** | Fungibility is about *asset identity*, not *market price*. (See [`FAQ-FUNGIBILITY-VS-PRICE.md`](FAQ-FUNGIBILITY-VS-PRICE.md).) |
| 3.2 | **Not** “you can hide that you *ever* used an exchange **at the account level**.” | If an exchange address is **publicly labeled**, transaction-graph analysis may link **accounts** — never **coins**. |
| 3.3 | **Not** a guarantee against **law enforcement / identity (KYC)**. | KYC links an **identity to a human** (off-chain), not an **origin to a unit**. |
| 3.4 | **No claim of independent audit.** | Instead: **fully reproducible** — official sources + runnable code. |
| 3.5 | **Not** a claim about any **specific exchange’s IOU** being native. | An **IOU/wrapped token** *is* a different asset (see §5, Group C). Always check `asset_type` + `issuer`. |

---

## 4. The three levels — do not confuse them

This is the distinction that resolves the most common objection
(*“but you can follow the transactions between addresses”*).

| Level | What it is | Observable? |
|---|---|---|
| **Unit-level provenance** | *which π units* are mined / bought | ❌ **Undefined** — the model has no units |
| **Account-level history** | *which accounts* a given account transacted with | ✅ Observable from the tx graph |
| **Identity (KYC)** | *who owns* an account | ⚠️ Off-chain, partial |

> **Yes**: an analyst can see *“account `S` received from exchange hot-wallet `X` at time `t`”* — **if** `X` is
> labeled. That is a fact about the **account over time**, **not** about the **coins it sends**.
> Per-coin origin is a different, **non-existent** thing.

---

## 5. Every objection, grouped (with answers)

| Group | Theme | Representative objection | Answer |
|---|---|---|---|
| **A** | Identifier / address | “Every micro-π has an ID” · “exchanges use `M`, not `G`” | → [`FAQ-MICRO-PI-ID.md`](FAQ-MICRO-PI-ID.md) · [`FAQ-MUXED-M-VS-G.md`](FAQ-MUXED-M-VS-G.md) |
| **B** | Analysis / tracing | “You can follow the tx graph to infer origin” | → §4 above + [`FAQ-RECIPIENT-CANNOT-TELL.md`](FAQ-RECIPIENT-CANNOT-TELL.md) |
| **C** | State / type / network | “locked π is different” · “wrapped/token π is traceable” | → [`FAQ-ALL-OBJECTIONS.md`](FAQ-ALL-OBJECTIONS.md) (Group C) |
| **D** | Off-chain | “the exchange/Core Team knows” · “KYC links it” | → [`FAQ-ALL-OBJECTIONS.md`](FAQ-ALL-OBJECTIONS.md) (Group D) |
| **E** | Governance / technical | “the issuer can freeze/modify” | → [`MICA-WHITEPAPER.md`](MICA-WHITEPAPER.md) (G.3 immutable, G.11) |
| **F** | The concrete scenario | “I mixed mined + bought, then sent — can they tell?” | → [`FAQ-RECIPIENT-CANNOT-TELL.md`](FAQ-RECIPIENT-CANNOT-TELL.md) |
| **G** | Policy | “Pi once said *don’t buy Pi*” | → [`FAQ-DONT-BUY-PI.md`](FAQ-DONT-BUY-PI.md) (Enclosed Mainnet; ended 2025-02-20) |
| **H** | Economics | “same coin ≠ same price” | → [`FAQ-FUNGIBILITY-VS-PRICE.md`](FAQ-FUNGIBILITY-VS-PRICE.md) |

Full catalog: [`FAQ-ALL-OBJECTIONS.md`](FAQ-ALL-OBJECTIONS.md).

---

## 6. Independent verification (reproduce everything, trust no one)

**A. Read the official sources.**
[`SOURCES.md`](SOURCES.md) — every quote is transcribed verbatim with a link.

**B. Run the live on-chain tests** (Node 18+, **zero dependencies**):
```bash
node examples/provenance-check.mjs              # no origin field on a real payment
node examples/coin-id-check.mjs                 # balance is one scalar (no per-unit ID)
node examples/mixing-check.mjs                  # mined+bought mixed -> scalar -> origin-less output
node examples/mixing-check.mjs <SENDER_ACCOUNT> # your own account
```
Expected outputs are committed in `examples/*-output.txt`.

**C. Check the structural property** (no code needed): the Pi blockchain uses the **Account/Balance** model.
Read the Stellar protocol/accounts docs and the Pi SDK + Platform API — none of them has a per-unit or
per-origin field.

> If any of A/B/C is wrong, the claim is wrong. That is the invitation: **falsify it.**

---

## 7. Formal appendix (why it is deterministic)

**State.** `bal : (Account × Asset) → ℕ` (stroops; `1 π = 10,000,000`). For native Pi, the only value is
`bal(A, native)`. No per-unit structure exists.

**Operation.** `payment(S, D, a) : bal(S) -= a ; bal(D) += a` — purely scalar.

**Non-injectivity.** Two histories ending in the same state are ledger-identical:
```
H1 : mine 5 → S ; buy 10 → S   ⇒  bal(S) = 15
H2 :            buy 15 → S     ⇒  bal(S) = 15
```
The map `history → state` is **not injective**, and **“origin” ∉ image**. Hence no observable derived from the
state can distinguish them: the distinguishing information was **never recorded**. This is
**information-theoretic**, not probabilistic.

**Corollary (the scenario).** After `mine m` + `buy e` pool in `S`, a payment `send a : S → F` yields
`bal(S) = m+e−a`, `bal(F) += a`, with no inverse to attribute `a` to `m` or `e`. The recipient observes
`{amount, asset_type: native, from, to, memo, txid}` — **no origin**. ∎

---

## 8. Conclusion

```
history → ledger state   is NOT injective
"origin"                 ∉ image of that map
⇒ per-coin origin        is not an observable
⇒ mined π ≡ exchange π   (same native asset)
```

**Proven:** a payment carries **no observable per-coin origin**.
**Not claimed:** price, identity-hiding, or IOU equivalence.
**Verifiable:** by anyone, from official sources and runnable code.

**π = π.**
