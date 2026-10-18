---
layout: faq
faq_question: "Can't you just follow the transactions and see which Pi came from where?"
faq_answer: "No - the distinction is between the transaction and the coin. A transaction is fully public: source, destination, amount, memo, txid and ledger. An account is traceable as a graph too: address-level analysis can label accounts and measure flows between them. But an individual unit has no identity anywhere. Pi uses an Account/Balance model, so receiving Pi merges the amount into a single scalar balance and per-unit provenance is not hidden - it does not exist. You can prove that an account sent to an exchange; you cannot prove which Pi came back."
---
# FAQ — “You can’t trace the **coin** — only the **transaction**”

> **Objection (the over-claim in both directions):**
> *“This fungibility argument is overblown. A public blockchain is traceable — you can follow the money from an
> exchange right back to a mining reward. So you absolutely can tell where a π came from.”*
>
> **And the mirror image:** *“So Pi is untraceable / anonymous?”*
>
> **Short answer: you can trace the *transaction*, never the *coin*.** Those are two different questions, and only
> the first one has an answer on Pi. The second one is *not* a privacy claim (§5).

This is the single most important distinction in the whole repository. Nearly every bad argument — in **either**
direction — comes from confusing a **transaction** with a **coin**.

---

## 1. Three levels — and only two of them exist

| Level | The unit | Where it lives | Traceable? |
|---|---|---|---|
| **1 — Transaction / operation** | `txid`, operation index, `ledger` | the ledger | ✅ **Fully public.** Anyone can enumerate: source account, destination account, amount, asset type, memo, timestamp, success/failure. |
| **2 — Account** | `G…` (account) or `M…` (muxed, CAP-27) | the ledger | ✅ **As a graph.** You can label addresses (e.g. a known venue wallet) and measure flows between them. |
| **3 — Coin / unit** (one micro-π) | — | **nowhere** | ❌ **Not traceable, because it is not represented at all.** No field, no id, no list of units. |

The mistake is to assume that because levels **1** and **2** are traceable, level **3** must be traceable too.
On an **Account/Balance** ledger it is not — and it is not merely *hard*, it is **undefined**.

> **The precise sentence:** *a native Pi payment carries no observable per-unit mining origin on the Pi Mainnet
> ledger.* Not “it is concealed”. Not “it is obfuscated”. **It is not an observable.**

---

## 2. Why level 3 cannot exist: Account/Balance, not UTXO

| Model | How value is stored | Consequence for tracing |
|---|---|---|
| **UTXO** (Bitcoin) | a set of unspent outputs, each with a `txid:vout` | quasi-identity per piece → *probabilistic* tracing is possible, but limited: outputs merge and split |
| **Account/Balance** (Stellar, **Pi**) | **one scalar balance** per (account + asset) | there are **no pieces to trace** |

### Direct on-chain evidence

```json
// GET https://api.mainnet.minepi.com/accounts/<G...>
{
  "balance": "2.0000000",
  "asset_type": "native"
}
```

The balance is **one number**: `"2.0000000"`. There is no array of units, no `txid` per π, and no origin field.
Run [`examples/coin-id-check.mjs`](../examples/coin-id-check.mjs) to see it yourself.

### The formal statement

Receiving π **merges** the amount into the existing balance. The map from **history** to **state** is therefore
**non-injective**: many different histories produce the identical final state. Once that happens, “which π did I
just send?” has **no defined answer**.

This is not hand-waving — it is checked executably:

- [`examples/model-check.mjs`](../examples/model-check.mjs) — property check over **2 000 seeds** (offline).
- [`examples/exhaustive-check.mjs`](../examples/exhaustive-check.mjs) — enumerates **all 1 452 bounded histories**
  and confirms origin-invisibility for every one (offline).

### “Hidden” vs “does not exist”

| | Meaning | Consequence |
|---|---|---|
| **Hidden** | the information exists but is concealed | someone with the key/permission could recover it; a bug or a disclosure changes the answer |
| **Does not exist** | there is no fact of the matter to recover | **no one** can recover it — not you, not an exchange, not the Core Team, not a court order |

**Pi is the second case.** This is exactly why the argument does not depend on anyone’s goodwill, on a privacy
feature, or on the code being closed. It is a consequence of the data model.

---

## 3. A worked example — following the *money* is not following the *coins*

| Event | What the ledger shows | What it tells you |
|---|---|---|
| You send 100 π to an exchange | `payment 100 native` → `<venue G…>`, with a memo | ✅ that **your account** sent 100 π to **that address** |
| The venue credits you an internal balance | nothing on-chain | — |
| Weeks later you withdraw 100 π | `payment 100 native` → `<your G…>` | ✅ that **that address** sent 100 π to **your account** |
| *“the 100 π I withdrew are the 100 π I deposited”* | nothing on-chain | ❌ **not provable — and not merely unproven** |

The venue pools everyone’s deposits into the same balance. There is no unit-level link between what went in and
what came out, because there are **no units** — only balances. The link is a **bookkeeping entry inside the
venue**, not a fact on the ledger.

**Real material from this repository** (reproduce with
[`examples/verify-deposit.mjs`](../examples/verify-deposit.mjs)):

| Field | Value |
|---|---|
| `txid` | `e0916b2f64bef9da8ac6c2e784a98e48102637a77654a1a73055cb2b6927914c` |
| `ledger` | `27024280` |
| source | `GBWKGBVDEJO3JKRV7IUBHXMBE7A2JYHOGMUMKEO2XM5RFIRBRVSYHTZA` |
| operation | `payment` — `0.8000000` **`native`** |
| destination | `GC55LFCTGSDPDMNDIOHZVVA4CYCUF4IKI2SUGHWCJA2PCLPKH4HMDMIU` |
| memo | text `"VV352v94UwCxraXcrr75XYHSHUrT"` |

Everything in that table is **level 1** — completely public. **Nothing** in it is **level 3**.

---

## 4. What *is* traceable — stated honestly, so this is not over-claimed

To keep this page credible, here is everything an analyst *can* do:

| Available ✅ | Not available ❌ |
|---|---|
| Enumerate every transaction and its fields | Which specific units moved |
| Follow account-to-account flows (amounts, timing, memo) | Whether a withdrawn π equals a deposited π |
| Label addresses (venues publish deposit addresses; the graph shows them) | Any per-unit classification (“mined” vs “bought”) |
| Cluster and statistically infer: *“this account’s inputs come mostly from labeled venues”* | Any **fact** about a unit — only inferences about accounts |

> ⚠️ **Never say “untraceable”.** The accurate statement is: **transactions and accounts are traceable;
> per-unit origin is not an observable.** Anything an analyst says about *“where your money came from”* is an
> **inference about an account**, not a **fact about a coin**.

This is the same honest fence as [`SCOPE.md`](SCOPE.md) §3.2 — the repository never claims you can hide that you
*ever* used an exchange **at the account level**.

---

## 5. What this page does **not** claim

- ❌ **Not anonymity.** Address-level transaction-graph analysis remains possible (§4, [`SCOPE.md`](SCOPE.md) §3.2,
  [`THREAT-MODEL.md`](THREAT-MODEL.md)).
- ❌ **Not that a venue’s balance is backed.** Whether an exchange holds the π it owes you is an **off-chain**
  fact — Claim C, explicitly **not claimed** ([`FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](FAQ-EXCHANGE-DEPOSIT-VERIFY.md)).
- ❌ **Not a privacy feature, and not a vulnerability.** It is simply how an Account/Balance ledger works. Stellar
  is the same; Bitcoin is different (UTXO), where coin tracing exists but is **probabilistic and limited** because
  outputs merge and split.
- ❌ **Not a statement about price or value** ([`FAQ-FUNGIBILITY-VS-PRICE.md`](FAQ-FUNGIBILITY-VS-PRICE.md)).

---

## 6. The one-sentence version

> You can prove **who sent what to whom**. You can never prove **which unit arrived** — because the unit is not
> something the ledger records.

---

## Sources

- Stellar — Accounts (balance model; native asset with no issuer):
  https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts
- Stellar — muxed accounts (`M…`, CAP-27):
  https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos
- Pi Docs — Wallet / Payments: https://docs.minepi.com/use-native-features/Wallet
- MiCA Whitepaper — Pi Network, §F.2 (“native, fungible digital asset”):
  https://minepi.com/wp-content/uploads/2025/11/MiCA-Whitepaper-Pi-1.pdf
- Revisions of all of the above: [`SOURCES.md`](SOURCES.md) §0
- Live checks: [`examples/provenance-check.mjs`](../examples/provenance-check.mjs) ·
  [`examples/coin-id-check.mjs`](../examples/coin-id-check.mjs) ·
  [`examples/model-check.mjs`](../examples/model-check.mjs) ·
  [`examples/exhaustive-check.mjs`](../examples/exhaustive-check.mjs)
- Related: [`FAQ-MICRO-PI-ID.md`](FAQ-MICRO-PI-ID.md) · [`FAQ-RECIPIENT-CANNOT-TELL.md`](FAQ-RECIPIENT-CANNOT-TELL.md) ·
  [`FAQ-MUXED-M-VS-G.md`](FAQ-MUXED-M-VS-G.md) · [`SCOPE.md`](SCOPE.md) · [`PROOF.md`](../PROOF.md)
