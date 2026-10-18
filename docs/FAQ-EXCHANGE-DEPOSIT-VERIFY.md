# FAQ — Three different claims: don’t blend them

> A precise separation of what is **proven**, what is **verifiable case-by-case**, and what is **not claimed**.
> This answers the fair objection: *“fungibility is not the same as proving an exchange’s balance is real.”*

---

## The three claims

| # | Claim | What it needs | Status here |
|---|---|---|---|
| **A** | **Protocol fungibility:** a native Pi payment carries **no observable per-unit mining origin** on the Pi Mainnet ledger. | Read the protocol + run read-only tests | ✅ **Proven** — [`SCOPE.md`](SCOPE.md), [`PROOF.md`](../PROOF.md) |
| **B** | **A specific transfer is real:** a given exchange deposit **is** a genuine **native Pi payment on Pi Mainnet** (from an on-chain address to the exchange’s on-chain address). | The **txid** + the exchange’s on-chain deposit address | ✅ **Verifiable per case** — [`examples/verify-deposit.mjs`](../examples/verify-deposit.mjs) |
| **C** | **Reserve backing:** the venue’s **entire internal balance** is **fully backed** by on-chain Pi. | The venue’s internal ledger (private) | ❌ **Not claimed** — off-chain counterparty/reserve claim |

> **They are not the same.** This repo proves **A**, gives you a tool for **B**, and explicitly does **not**
> claim **C**. Anyone who says “this repo claims the exchange is fully backed” is blending C into A/B.

---

## Why Claim A (fungibility) holds

The ledger state is a **scalar balance** per (account, asset) — there are no “units”:
```
bal : (Account × native) → ℕ     ;     payment(S,D,a): bal(S) -= a ; bal(D) += a
```
Two histories ending in the same balance are **ledger-identical** (the map `history → state` is
**non-injective**); “origin” is **not in its image**. So per-unit mining origin is **not an observable**.
Full proof: [`SCOPE.md`](SCOPE.md) §7.

---

## Why Claim B is different — and how to verify it

“Fungibility” is about the **asset type**. But whether an **individual** deposit is a real on-chain payment
is a **separate, checkable** fact: you must see the **actual transaction** — an internal exchange ledger
alone proves nothing about origin.

**Verify a deposit yourself:**
```bash
# 1) Check the transaction on-chain (read-only):
node examples/verify-deposit.mjs <TXID>

# 2) Also assert the recipient is the exchange's on-chain deposit address:
node examples/verify-deposit.mjs <TXID> <EXCHANGE_ONCHAIN_ADDRESS>
```
It confirms (from the **public** API, the source of truth):
- an operation of type `payment` with `asset_type: "native"`;
- `from` → `to` and the amount;
- optionally, that `to` is the address you expected.

> 🔧 **Correctness note (per operation).** A Pi/Stellar transaction can contain **multiple operations**.
> So the tool does **not** test “is there a native payment?” and “does some op reach the address?” as two
> independent facts. It requires the **same single operation** to be **both** native **and** directed to the
> expected recipient — otherwise the verdict is **NOT VERIFIED**. This avoids a misleading result.
> (It also accepts the muxed `M…` form of the recipient via CAP-27.)
>
> Run the automated check: `node examples/self-test.mjs` — it asserts that the **correct** recipient
> gives `VERIFIED` while a **wrong** recipient gives `NOT VERIFIED` (see
> [`examples/self-test-output.txt`](../examples/self-test-output.txt)).

> ⚠️ Practical notes:
> - Exchange **deposit** addresses are often **`M…`** muxed accounts (CAP-27) — see
>   [`FAQ-MUXED-M-VS-G.md`](FAQ-MUXED-M-VS-G.md). The underlying `G…` account is what exists on the ledger.
> - **Withdrawals** come from the exchange’s **hot wallet (`G…`)**, not from the deposit address.
> - Always confirm the network is **Pi Mainnet** (`https://api.mainnet.minepi.com`), not a testnet.

---

## Why Claim C is **not** claimed (the honest limit)

Even a perfect on-chain deposit does **not** prove:
- that the venue **credited** your account correctly,
- that the venue holds **enough** on-chain Pi for **all** users,
- that its internal number is **redeemable** at par.

Those are **counterparty/reserve** questions about a **centralized venue**, answerable only by the venue’s
private ledger — never by the protocol. It is the **IOU-vs-native** distinction:
[`FAQ-ALL-OBJECTIONS.md`](FAQ-ALL-OBJECTIONS.md) Group C, [`FAQ-FUNGIBILITY-VS-PRICE.md`](FAQ-FUNGIBILITY-VS-PRICE.md) §“the only real reason”.

> **Holding native Pi in your own wallet** ≠ **holding an exchange balance**. The former is the asset; the
> latter is a claim on a venue. Same asset *type*, different **custody/risk**.

---

## Background: Open Network changed what exchanges can do

Since **Open Network (2025-02-20)** the firewall was removed and **CEX integration** is officially supported:
- Pi’s blog: “…**the firewall … has been removed**” and “…support for integrations with centralized
  exchanges (CEXs) and onramps to provide **additional means of acquiring Pi**…”
  🔗 https://minepi.com/blog/open-network/
- Exchanges advertise **deposit/withdraw on the Pi Network** for `PI`. So it is **wrong** to say *every*
  exchange balance is merely an IOU — but it is equally wrong to assume it **without checking** (Claim B/C).

> Correct stance: **not** “all exchange Pi is IOU”, and **not** “all exchange Pi is proven native” — but
> **“native-on-Mainnet is verifiable per transfer; reserve backing is a separate venue claim.”**

---

## The precise wording (use this)

> **“A native Pi payment carries no observable per-unit mining origin on the Pi Mainnet ledger.”**

This is stronger and safer than “no one can know the origin of Pi”, because it states **exactly** what is
proven, without denying that **account-level transaction history** is observable.

---

## Sources
- [`SCOPE.md`](SCOPE.md) · [`PROOF.md`](../PROOF.md) · [`FAQ-RECIPIENT-CANNOT-TELL.md`](FAQ-RECIPIENT-CANNOT-TELL.md)
- Open Network: https://minepi.com/blog/open-network/ · https://minepi.com/blog/open-network-launch-date/
- Pi Platform API / Horizon: https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md
- Tool: [`examples/verify-deposit.mjs`](../examples/verify-deposit.mjs)
