# FAQ — “Every micro-π has its own ID, so you can tell them apart?”

## The claim
> “Every unit (micro-π) has a unique identifier, and through it you can trace units and tell mined Pi apart
> from exchange Pi.”

## The truth: the data model is misunderstood ❌

Pi Network (built on **Stellar**) does **not** use a **UTXO** model. It uses an **Account / Balance** model:

| Model | How it stores value | Example |
|---|---|---|
| **UTXO** (Bitcoin) | A list of “unspent outputs”, each with a `txid:vout` id | quasi-ID per piece |
| **Account/Balance** (Stellar/Pi) | **A single numeric balance** per (account + asset) | one number, no pieces |

### Direct on-chain evidence
```json
// GET https://api.mainnet.minepi.com/accounts/GC55...
{
  "balance": "2.0000000",
  "asset_type": "native"
}
```
👉 The balance is **"2.0000000"** — a single number. There is **no array of pieces, no per-unit ID, and no
`txid` for each π.**

Run `examples/coin-id-check.mjs` to see it for yourself.

---

## What does “micro-π” even mean? It’s just a decimal place, not an ID
- `1 π = 10,000,000 micro-π`.
- That’s **mathematical division** — like saying “1 dollar = 100 cents”. A cent has no unique ID.
- The balance is stored as a scaled integer inside the contract; **there is no field per decimal place**.

---

## The IDs that **do** exist on Pi/Stellar — and what each identifies
| Identifier | Form | Identifies |
|---|---|---|
| Account ID | `G...` | an **account** — not a coin |
| Muxed Account ID | `M...` | a **user inside a pooled account** — not a coin |
| Contract ID | `C...` | a **smart contract** |
| Transaction Hash | `txid` | a **transaction** |
| Operation ID | number | an **operation** |
| Claimable Balance ID | `0000...` | a **locked balance container** — not a coin |
| Ledger Sequence | number | a **ledger (block)** |

⚠️ **None of them is “a π unit ID”.**

---

## A common conflation
People merge three completely different things:

1. **Coin ID** — exists only in a UTXO model. ← **Not present in Pi.**
2. **Account ID (G/M)** — tells you **who**, not **where the coin came from**.
3. **Transaction ID (txid)** — tells you **which operation**, not the **origin of the units**.

---

## Why it wouldn’t help even if it existed
- In Bitcoin (a UTXO model) each output has a `txid:vout` — yet chain analysis is **probabilistic and limited**,
  because outputs get merged and split.
- In Pi (a balance model) the concept doesn’t exist at all: the moment you receive π, the amount **merges** into
  your balance as one number. There is no way to track “which π” you sent.

---

## Conclusion
- ✅ True: every **account** has an ID (`G`), and every **transaction** has an ID (`txid`).
- ❌ False: every **micro-π unit** has an ID. **No such thing exists.**
- **Result:** fungibility holds — a single native asset, with no origin and no tag.

---

## Sources
- Stellar — Accounts (balance model + native asset with no issuer):
  https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts
- UTXO vs Account model:
  https://www.alchemy.com/docs/utxo-vs-account-models
  https://bitcoin.stackexchange.com/questions/49853/utxo-model-vs-account-balance-model
- Live test: `examples/coin-id-check.mjs`
