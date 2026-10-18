---
layout: faq
faq_question: "If 'tainted' Pi — Pi bought on an exchange, or Pi from a disputed source — touches my wallet, doesn't the taint spread through my whole balance and make all my Pi different?"
faq_answer: "No. The ledger records a scalar balance per account and has no taint field, so there is nothing for contamination to propagate through. Taint is an inference an analyst makes about accounts, not a property the ledger assigns to units. If taint propagated transitively, then after enough hops every Pi in existence would be tainted — a property everything has distinguishes nothing."
---
# FAQ — "If tainted Pi touches my wallet, doesn't the taint spread to everything I own?"

---

## 1. The scenario

You receive 10 π from an exchange. Later you receive 100 π that you mined yourself. They sit in one wallet.
Someone claims the exchange π has "tainted" the wallet — that the taint has *spread* to the mined π, so that
anything you now send is partly tainted.

This is the most intuitive-sounding of all the objections, because "contagion" is a real pattern in the
physical world: dye spreads in water, rust spreads through metal, a disease spreads on contact.

The question is whether it spreads **in a ledger**. It does not — for two independent reasons, either of
which is sufficient on its own.

---

## 2. Part A — There is no taint field

Contagion requires two things:

1. a **marked object** — something that carries the mark, and
2. a **propagation rule** — a mechanism that copies the mark from one object to another.

The Pi Mainnet ledger supplies **neither**.

The ledger state for the native asset is:

```
bal(account, native) -> a non-negative integer
```

That is the entire state. There is no `taint` field, no tag list, no origin vector, no set of previous
holders attached to a balance. A payment is:

```
bal(S) -= a ;  bal(D) += a
```

Pure scalar arithmetic. Nothing is copied between accounts except the number `a`.

So the mark has nowhere to live, and there is no rule that could move it. The contagion model does not
merely fail to apply — the objects it needs are **absent from the data model**.

> This is the *same* argument that defeats every "origin" claim, applied to a different word. There is no
> `origin` field to be *wrong about*, and there is no `taint` field to be *spread around*. Changing the
> vocabulary does not add a field to the ledger.

---

## 3. Part B — Even granting taint, it cannot be allocated

Assume for the sake of argument that taint exists. Now make it concrete:

| | |
|---|---|
| You mined | 100 π |
| You withdrew from an exchange | 10 π |
| **Balance** | **110 π** |

You send **10 π** to a merchant. Which 10?

| Rule | Would send | Resulting taint |
|---|---|---|
| FIFO (first in, first out) | the 10 mined π | merchant receives "tainted" π |
| LIFO (last in, first out) | the 10 exchange π | merchant receives "clean" π |
| Largest first | 10 of the mined π | merchant receives "tainted" π |
| Random | either | either |

**The ledger endorses none of these.** It does not record the order of inflows for spending purposes, it
does not track "lots", and it does not know which units are which. It simply subtracts 10 from 110 and
stores 100.

This is not a gap that better analytics would close. To make taint *computable* at all, the ledger would
have to maintain per-lot accounting — which is a UTXO model or an explicit lot register. Pi uses an
**Account/Balance** model instead. The question "which coins did you send?" is not *unanswered*; it is
**undefined**, because there are no "which coins".

> **This is exactly the well-known problem of tracing the US dollar.** A dollar that passed through a
> ransom payment is not observably different from any other dollar, and no rule exists to say which dollar
> you spent. Fungibility is what makes that question ill-formed — and it is the same reason it is ill-formed
> here.

---

## 4. Part C — The reductio: transitive taint taints everything

Now take the contagion rule seriously and follow it to the end.

Say taint spreads on contact: A is tainted → A pays B → B is now tainted → B pays C → C is tainted.

The Pi network is heavily connected, and exchanges are pervasive counterparties. Follow the rule forward:

```
exchange → you → merchant → their supplier → …
```

Every hop propagates the mark. After enough hops — which for a widely-used asset is a *short* number of
hops — **every π in existence is tainted.**

And here the argument collapses under its own weight:

> **A property that everything possesses distinguishes nothing.**

If all Pi is tainted, then "tainted" partitions the set into `{all}` versus `{}`. The label carries **zero
information**. It cannot separate one coin from another, because there is no unmarked remainder to compare
against. Calling some Pi "tainted" would be like calling all water "wet" — true, and useless as a
classification.

### The dichotomy — why there is no escape

| If taint is… | then… | consequence |
|---|---|---|
| **non-transitive** (stops at your wallet) | it dies at the first commingling | **Part B**: it cannot be allocated to any specific unit |
| **transitive** (spreads on contact) | it reaches every Pi in existence | **Part C**: it is universal, therefore vacuous |

There is **no consistent third option**. Either taint fails as a *measurement* or it fails as a *distinction*.
Both roads end at the same place: no per-unit property, no difference.

---

## 5. Part D — What is honestly true at the account level

It would be dishonest to stop at Part C, because something adjacent **is** real.

**Address-level flagging works — and it is why AML works at all.**

If an address is publicly labelled (a sanctioned entity, a known illicit service), an exchange can and does
freeze funds reaching it. That is a genuine, enforced mechanism. But notice precisely what it operates on:

| | What it acts on | Is it a per-coin property? |
|---|---|---|
| Address labelling | an **account** | ❌ No |
| Chain analysis | **accounts** and **transaction edges** | ❌ No |
| KYC / AML records | a **person's identity** | ❌ No |
| The ledger | a **scalar balance** | — has no per-coin property at all |

So the honest statement is:

- ✅ An **account** can be linked to an exchange, a mixer, or a sanctioned entity.
- ✅ That link can have real consequences for the **account holder**.
- ❌ That does **not** make the units a different asset, a different amount, or observably distinct in any
  subsequent payment.

The mark attaches to **who you are**, not to **what you hold**. Those are different things, and conflating
them is the entire error this page addresses.

Full treatment of the account-level boundary: [`FAQ-RECIPIENT-CANNOT-TELL.md`](FAQ-RECIPIENT-CANNOT-TELL.md) §3.

---

## 6. Part E — Verify it yourself (runnable, live Mainnet)

**Zero dependencies, read-only, `GET` only.** No wallet, no passphrase, no keys, no signing.

```bash
node examples/mixing-check.mjs          # live Mainnet read
node examples/model-check.mjs           # 2 000 randomised histories
node examples/exhaustive-check.mjs      # every history over the model
```

What each layer shows for *this* objection:

| Script | Result | What it establishes here |
|---|---|---|
| `mixing-check.mjs` | ✅ live Mainnet, exit `0` | Real inflows from **different** counterparties collapse into **one number**. The full outgoing payment record contains **no** origin/taint field. |
| `model-check.mjs` | **2 000 seeds — 2 000 non-injective** | No random history reconstructs per-unit origin. There is no hidden arrangement to be contaminated. |
| `exhaustive-check.mjs` | **1 452 histories**, 204 groups — **2 passed, 0 failed** | Every possible history in the model yields **one state and one view**. Exhaustive, not sampled. |

The `mixing-check.mjs` output states the mechanism directly:

```
The ledger state is  bal(account, native) -> a non-negative integer.
A payment does:  bal(S) -= a ;  bal(D) += a   (purely scalar math).
The state has NO per-unit identity. 'Which coin did I send?'
  is therefore NOT A QUESTION the ledger can answer — it is undefined.
```

---

## 7. ⚠️ A bad argument to avoid

> ❌ **Do not say:** *"All Pi tokens were created at the same time, so they cannot have different origins."*

**This is factually false and it will be used against you.** Mined π is created **over time** as miners
earn it — units genuinely have different creation times, and the ledger records transaction timestamps.

The claim does not need it, and is better without it. The sound premise is different and simpler:

> ✅ **There is no origin field, and the balance is a scalar.**

Creation-time differences do not produce provenance tracking. A ledger that records *when a transaction
happened* is not a ledger that records *which units moved*. Timestamps are properties of **transactions**,
not of **coins** — which is the same distinction the whole repo rests on.

---

## 8. Scope — what this does and does not prove

**Proves:**
- The native Pi ledger assigns **no per-unit taint or origin property**, because its state is a scalar
  balance with no such field.
- Taint is therefore **not computable** for any unit (Part B), and **vacuous** if made transitive (Part C).

**Does not prove:**
- That chain analysis is useless. It is effective **at the account level**, and this repo does not dispute
  that (Part D).
- That exchanges are solvent, that Pi has any particular price, or that any specific deposit is native.
- That off-chain records (KYC, AML, exchange databases) are absent or irrelevant. They are real, and they
  operate on **identities and accounts**.

Claims A / B / C in full: [`SCOPE.md`](SCOPE.md).

---

## Sources

- [Pi Docs — official](https://docs.minepi.com/)
- [Pi Wallet & SDK](https://docs.minepi.com/use-native-features/Wallet)
- [Stellar — Accounts (Account/Balance model)](https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts)
- [Stellar — Muxed accounts (CAP-27)](https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos)
- [MiCA Whitepaper (PDF)](https://minepi.com/wp-content/uploads/2025/11/MiCA-Whitepaper-Pi-1.pdf) — "native, fungible"

Exact pinned revision of every source: [`SOURCES.md`](SOURCES.md) §0.

---

**Back to the [FAQ index](INDEX.md) · [repository](https://github.com/aybvip/pi-fungibility)**
