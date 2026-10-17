# FAQ — “Exchanges have an **M** address, not a **G** address — so you can tell them apart?”

## The claim
> “Exchanges (OKX / Bitget) give deposit addresses that start with **M**, not **G**. Therefore you can tell
> exchange Pi apart from mined Pi.”

## Half true ✅
- **Partly correct:** some exchanges give a **Pi deposit address** starting with **M**.
  > Bitget: “Your PI deposit address will appear (usually starting with "M").”
  > 🔗 https://www.bitget.com/academy/how-to-securely-deposit-pi-coin-to-bitget
- **M** addresses are **Muxed Accounts** (CAP-27 in the Stellar protocol, which Pi is built on): an address =
  **G** + a 64-bit ID.

## Why it does **not** prove coins can be told apart ❌

1. **An M account is virtual — it doesn’t exist on the ledger.**
   > Stellar Docs: “Muxed accounts **do not exist on the ledger**, but their shared underlying `GABC…` account does.”
   → In reality the account is the **G** address; `M` is just a wrapper.
   🔗 https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos

2. **The network treats it exactly as if no muxing were used.**
   > “There’s no validation on IDs and as far as the Stellar network is concerned, all supported operations
   > **operate exactly as if you did not use a muxed account**.”
   → Same native π, same fungibility.

3. **M describes the “counterparty”, not the “coin”.**
   M exists to distinguish **users within one pooled account** (an exchange’s). → It tells you **who**
   (which depositor), not **where the coin came from**.

4. **“M = exchange” is one-directional and incomplete.**
   - A **deposit to** an exchange → often to an **M** address.
   - A **withdrawal from** an exchange → comes from the exchange’s **hot wallet G** (not M).
   → If you see an M, you only know the **deposit destination** is a pooled account.

5. **Not every exchange uses M** — many use **G + Memo**.
6. **Any ordinary user can use an M address** — it isn’t exclusive to exchanges.
   → So “M = exchange” is wrong to begin with.

7. **Most importantly:** even if you knew the counterparty is an exchange, **the coin itself (native) has no
   memory**. You still don’t know whether the units at that exchange were **mined** or **bought**.

## The key distinction

| Concept | What it gives you |
|---|---|
| **Address labeling** (a known G/M belongs to an exchange) | ✅ **who** the counterparty is |
| **Coin provenance** (a unit’s origin) | ❌ **impossible** — no such field exists |

> `M` adds information about the **address (counterparty)**, never about the **coin’s origin**.

## A concrete example
1. Someone **mines** π → sends to **OKX** (deposit to an M address) → **withdraws** to a fresh G wallet →
   sends it to your app.
2. **Your app sees only the last hop:** a native `payment` from a G address. It never sees the history.
3. Even if sent **directly to OKX’s M address**, you’d only know the **destination is an exchange** — the coin
   is still plain native π with no tag.

## Conclusion
**M vs G = addressing / counterparty identity, not a coin tag.**
Fungibility holds: a single **native** asset, with no origin — not on-chain, not in the Pi Wallet SDK, and not
in the Platform API.

---

## Sources
- Stellar — Pooled accounts / Muxed accounts / Memos: https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos
- Stellar — CAP-27 (Muxed accounts): https://github.com/stellar/stellar-protocol/blob/master/core/cap-0027.md
- Bitget — Pi deposit address (starts with M): https://www.bitget.com/academy/how-to-securely-deposit-pi-coin-to-bitget
- Pi Platform API (`PaymentDTO`): https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md
