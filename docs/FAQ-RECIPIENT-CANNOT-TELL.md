# FAQ — “I mixed mined Pi with Pi bought on an exchange, then sent some to a friend. Can they tell the difference?”

> This file is the **direct answer** to the one concrete question:
> *buy on an exchange → put it in the same wallet as your mined Pi → send Pi to someone.*
> **Can the recipient see which coins were mined and which were bought?**
>
> Short answer: **No — and this is a deterministic property of the protocol, not a loophole.**

---

## 1. The scenario

1. You **mine** `m` Pi (say 5) → your wallet `S`.
2. You **buy** `e` Pi on an exchange (say 10) → withdraw to the **same** wallet `S`.
3. Your wallet now holds `m + e = 15` Pi.
4. You **send** `a = 3` Pi to a friend `F`.
5. **Question:** can `F` tell whether those 3 Pi were *mined* or *bought*?

**Answer:** No. Neither `F`, nor the exchange, nor a block explorer, nor the Pi Core Team — **from the ledger data**.
Not because of secrecy, but because **the protocol does not represent “coins” at all**: the only state is a
**scalar balance per (account, asset)**. “Which coin did I send?” is **not a question the ledger can answer**.

> Analogy: a jug holds 5 L of water you fetched from the well + 10 L you bought. It now holds 15 L. When you
> pour 3 L, **no one can say** whether those 3 L were the “well water” or the “bought water”. That is not
> hiding — **the distinction stopped existing the moment they mixed.**

---

## 2. Part A — The formal proof (why it is deterministic, not a heuristic)

### 2.1 The state model
Define an account’s state as a function:
```
bal : (Account × Asset) → ℕ        (non-negative integers, in stroops; 1 Pi = 10,000,000)
```
For the native asset, the only relevant value is `bal(A, native)`. **The state has no per-unit structure.**
On the wire it is literally:
```json
{ "balance": "15.0000000", "asset_type": "native" }
```

### 2.2 The operation
A payment is defined **purely on scalars**:
```
payment(S, D, a) :  bal(S) -= a ;  bal(D) += a
```

### 2.3 Two histories, one ledger (the information-theoretic core)
Consider two different histories that end in the same state:
```
H1 :  mine 5 → S   ;   buy 10 → S      ⇒  bal(S) = 15
H2 :  buy 15 → S                       ⇒  bal(S) = 15
```
Both produce the **identical ledger state** and therefore the **identical set of observables**.
Formally: the map `history → ledger state` is **not injective**, and **“origin” is not in its image**.
No observable derived from the state can distinguish `H1` from `H2`. This is an **information-theoretic**
statement (the distinguishing information was never recorded), not a probabilistic one.

### 2.4 After the send
```
send 3 : S → F   ⇒   bal(S) = 12,  bal(F) += 3
```
`F` receives the record: `{ amount: 3, asset_type: "native", from: S, to: F, memo, txid }`.
There is no origin field, and there is **no inverse function** to recover which deposits financed those 3 Pi.

### 2.5 Even *you* cannot tell
If your wallet held `5 mined + 10 bought` and you send 3, the ledger has **no FIFO/LIFO rule** and no
“coin selection”. It simply subtracts 3. So the statement *“I sent the mined ones”* is **not even
representable** in the protocol. The sender’s intent is not part of the data.

---

## 3. Part B — The honest part: what chain analysis CAN and CANNOT do

This answers the fair objection: *“the absence of an origin field doesn’t prove tracing is impossible —
you can follow transactions between addresses.”* **Partly true — but it proves a different thing.**

| Level | What it is | Observable? |
|---|---|---|
| **Unit-level provenance** | *which π units* are mined / bought | ❌ **Undefined** — the model has no units |
| **Account-level history** | *which accounts* a given account transacted with | ✅ Observable from the tx graph |
| **Identity (KYC)** | *who owns* an account | ⚠️ Off-chain, partial |

**Yes**, an analyst can see: *“account `S` received from exchange hot-wallet `X` at time `t`”* — **if** `X`
is publicly labeled. That is a fact about the **account `S` over time**, **not** about the coins `S` sends.

Why it does **not** restore per-coin origin:

1. **The recipient doesn’t get the sender’s history.** The payment carries `amount/from/to/memo/txid` — not
   the sender’s past deposits.
2. **Commingling is at the scalar level.** Once inflows are pooled into one number, the received 3 Pi
   **cannot be attributed to any specific deposit**. Any attribution is an *arbitrary assumption* (FIFO/LIFO),
   not a fact the ledger asserts.
3. **Labels are partial.** Exchanges rotate hot wallets; many addresses are unlabeled.
4. **The accounting itself has no per-unit answer** — so even a perfect observer cannot manufacture one.

> This is exactly how a **bank account** works. The statement lists deposits and withdrawals, but **no bank
> records which specific banknote you withdrew**. Cash is fungible *structurally*, not by policy — same for Pi.

---

## 4. Part C — Scope: what this DOES and does NOT prove

**What it proves ✅**
- The units a recipient receives carry **no observable origin**.
- You **cannot distinguish** mined Pi from exchange-bought Pi **in the payment / ledger / SDK / Platform-API data**.
- Pi is **fungible** (native asset, no per-unit identity, no transfer restrictions).

**What it does NOT prove ❌**
- It does **not** prove anything about Pi’s **price** or future value. (See
  [`FAQ-FUNGIBILITY-VS-PRICE.md`](FAQ-FUNGIBILITY-VS-PRICE.md) — fungibility ≠ price.)
- It does **not** claim you can hide that you *ever* used an exchange **at the account level**; if an
  exchange address is labeled, graph analysis may link **accounts** (never *coins*).

> Precise statement: **“A payment carries no observable per-coin origin.”** That is what is proven — no more,
> no less. This explicit scope answers the critique that “some conclusions are broader than the proof.”

---

## 5. Part D — Verify it yourself (runnable, live Mainnet)

```bash
node examples/mixing-check.mjs
node examples/mixing-check.mjs <SENDER_ACCOUNT>
```

It shows, on the live chain:
- an account with **many inflows from different counterparties** (commingling),
- the resulting **single scalar balance**,
- an **outgoing payment with zero origin fields**,
- and the formal argument above.

Real output is in [`examples/mixing-check-output.txt`](../examples/mixing-check-output.txt).
The default account received `5.0 + 1.0 + …` yet its balance is `2.0` — proving you **cannot reconstruct**
which inflow financed which outflow.

---

## 6. Independent verification

Nothing here relies on trusting the author. Every claim is checkable:
- **Official sources** only: [`SOURCES.md`](SOURCES.md).
- **Live on-chain tests** you run yourself (no dependencies).
- The statement is a **structural property** of the Account/Balance model (Stellar protocol that Pi uses),
  verifiable by reading the protocol, the SDK, and the Platform API.

---

## 7. Conclusion

```
history → ledger state   is NOT injective
"origin"                 ∉ image of that map
⇒ per-coin origin        is not an observable
⇒ the recipient          CANNOT see the difference
```

Mined Pi and exchange-bought Pi are **the same native asset**. Mix them in one wallet and the distinction
is not *hidden* — it is **undefined**. **π = π.**

---

## Sources
- Pi Docs — Payments: https://docs.minepi.com/accept-payment/Payments
- Pi Platform API (`PaymentDTO`): https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md
- Stellar — Accounts (single scalar balance; native asset has no issuer):
  https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts
- UTXO vs Account model: https://www.alchemy.com/docs/utxo-vs-account-models
- MiCA Whitepaper — “native, fungible”, “Functionally Fungible Group”:
  https://minepi.com/wp-content/uploads/2025/11/MiCA-Whitepaper-Pi-1.pdf
- Live test: [`examples/mixing-check.mjs`](../examples/mixing-check.mjs)
