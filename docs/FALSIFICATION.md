# Falsification criterion — exactly what would kill this claim

> The claim is **falsifiable**, and this page states precisely what would falsify it — so anyone can
> attack the claim **directly** instead of reviewing the whole repository first.
>
> **The claim:** *“A native Pi payment carries no observable per-unit mining origin on the Pi Mainnet
> ledger.”* ([`SCOPE.md`](SCOPE.md) §1)

---

## 1. The claim is a *negative existential* — and that decides how to test it

It does not assert “X is true”. It asserts **“no X exists”** — specifically, that no field, in any
observable surface, carries per-unit origin.

That shape matters in two ways:

1. **It is decided by enumeration, not by sampling.** Testing more transactions adds *instances*, not
   *strength*. What raises confidence is covering the **whole observable surface** — and that surface is
   documented and finite (§3), so it can be walked end to end.
2. **One counterexample is enough.** A single field, a single protocol rule, a single transaction. This
   is the *weakest* form of claim to defend and the *easiest* to attack — which is exactly why it is the
   honest form to make.

If the claim were vague (“π is fungible, trust us”), it could not be tested. Because it is specific and
negative, it can be killed by anyone who looks. That is the point.

---

## 2. The four falsifiers

The claim **dies** if any one of these is shown to exist. **Any one is sufficient** — not all four.

| # | Falsifier | What it would look like | How to try it |
|---|---|---|---|
| **F1** | **A per-unit field** | Any key, in any observable surface — a ledger record, a Horizon API response, the Pi SDK, the Platform API `PaymentDTO`, or Soroban contract state — that carries per-unit origin / mining / lot / taint information | [`examples/falsify-try.mjs`](../examples/falsify-try.mjs) · [`FAQ-SDK-PLATFORM-API-FIELDS.md`](FAQ-SDK-PLATFORM-API-FIELDS.md) |
| **F2** | **A protocol allocation rule** | A documented rule that determines *which* units of a commingled scalar balance move in a payment (FIFO / LIFO / lot selection) — which would create per-unit provenance by construction | Read the protocol account/operation docs; none defines such a rule |
| **F3** | **A non-scalar balance** | Evidence that a Pi account's native balance is not one scalar — UTXO-style outputs, per-unit IDs, or a list of lots | [`examples/coin-id-check.mjs`](../examples/coin-id-check.mjs) |
| **F4** | **A counterexample transaction** | A **real Mainnet transaction** where a recipient — or any analyst — can determine the mining origin of the units received | Bring the `txid` → §6 |

> **Note on F3:** this is the one that, if it ever became true, would change everything. The whole
> argument rests on the balance being a number. `coin-id-check.mjs` reads it directly; if Pi ever moved
> to a UTXO or lot model, the script's assertion would fail and the claim with it.

---

## 3. The surface that has to be covered — and why it is finite

A skeptic's fair worry is: *“you only looked where it suited you.”* The answer is that the observable
surface is **not open-ended** — it is documented, and bounded:

| Surface | What is observable there | Checked by |
|---|---|---|
| **On-chain ledger state** | account balances (scalar), trustlines, sequence numbers | [`coin-id-check.mjs`](../examples/coin-id-check.mjs) |
| **Horizon API records** | transaction, operations, effects, account records | [`falsify-try.mjs`](../examples/falsify-try.mjs) |
| **Pi SDK** (`Pi.createPayment`) | the payment an app builds | [`app-payment-flow/`](../examples/app-payment-flow/frontend.html) |
| **Platform API** (`PaymentDTO`) | what a server receives after approval | [`payment-dto-sample.json`](../examples/payment-dto-sample.json) · [`FAQ-SDK-PLATFORM-API-FIELDS.md`](FAQ-SDK-PLATFORM-API-FIELDS.md) |
| **Soroban** (protocol 22+) | contract state — for a contract's **own** token, never native π | [`FAQ-SMART-CONTRACTS-AND-TOKENS.md`](FAQ-SMART-CONTRACTS-AND-TOKENS.md) |

Every one of these is **documented**, so “no origin field exists” is checkable **exhaustively** — not
merely probed. F1 walks the API surface, F3 walks the state, F2 walks the rules.

---

## 4. What does **not** falsify it (rejected counterexamples)

Most attempts to “refute” the claim are actually about something else. These are **not** falsifiers:

| Claimed counterexample | Why it is not one |
|---|---|
| “I can see the account received from a mining address.” | **Account-level**, not per-unit. A fact about an *account over time*, never about *units*. → [`SCOPE.md`](SCOPE.md) §4 |
| “The API might not reflect the ledger.” | **Self-defeating**: if the API is unreliable, the objection cannot read the ledger either. It is the *same* interface both sides use. → [`THREAT-MODEL.md`](THREAT-MODEL.md) §4 |
| “A venue's internal database knows where my π came from.” | **Off-chain** bookkeeping. Not a property of the ledger, and not observable by a recipient. → [`SCOPE.md`](SCOPE.md) §3.3 |
| “A wrapped / IOU token on a venue is traceable.” | A **different asset** entirely. Check `asset_type` + `issuer`. → [`SCOPE.md`](SCOPE.md) §3.5 |
| “An exchange could refuse or freeze my deposit.” | Account/address **policy**, not per-unit provenance. → [`FAQ-ALL-OBJECTIONS.md`](FAQ-ALL-OBJECTIONS.md) Group D |
| “Some π is locked / in a claimable balance.” | A difference of **state**, not of asset. → `README.md` “Limits” |
| “The chain is hard to read.” | Difficulty is not existence. |

If a proposed counterexample is one of the above, it is **not** a falsification — and saying so is not a
dodge, because §2 lists four things that *would* be.

---

## 5. Status — attempted, not found

| # | Falsifier | Attempted | Result |
|---|---|---|---|
| **F1** | per-unit field | [`falsify-try.mjs`](../examples/falsify-try.mjs) — enumerates **every key** on a real transaction, its operations, its effects, and the account | ❌ no such key |
| **F2** | allocation rule | protocol docs + [`SCOPE.md`](SCOPE.md) §7 | ❌ no such rule |
| **F3** | non-scalar balance | [`coin-id-check.mjs`](../examples/coin-id-check.mjs) | ❌ the balance is **one scalar** |
| **F4** | counterexample transaction | open invitation (§6) | ❌ none submitted |

**This is not a victory declaration.** It is the honest state of play: the falsifiers have been *tried*
and none has been *found*. The correct label remains **“self-verified, reproducible, not independently
audited”** — see [`AUDIT-REQUEST.md`](AUDIT-REQUEST.md).

The value of this page is that it converts the debate from *“prove it to me”* into *“here is exactly how
to break it.”* That is a far more productive question, and it is the one this repository can answer.

---

## 6. Submit a counterexample

If you have an F1–F4 case, open an issue with:

1. **Which falsifier** (F1 / F2 / F3 / F4).
2. **The surface** — the endpoint, the field name, or the document.
3. **The artefact** — the raw API response, the `txid`, or the quote with a link.
4. **Observed vs expected.**

If it holds up, the claim is dead and this repository will say so — in the README, not in a footnote.
That is the design ([`CONTRIBUTING.md`](../CONTRIBUTING.md)).

---

## Sources

- [`SCOPE.md`](SCOPE.md) §1 (the claim), §7 (the formal argument) · [`PROOF.md`](../PROOF.md)
- [`AUDIT-REQUEST.md`](AUDIT-REQUEST.md) §2 (what an adversarial review checks) · [`THREAT-MODEL.md`](THREAT-MODEL.md)
- [`SOURCES.md`](SOURCES.md) §0 (pinned revisions) · [`CONTRIBUTING.md`](../CONTRIBUTING.md) (falsifiable by design)
