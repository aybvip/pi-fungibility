# Official Sources — verified

> All quotes are transcribed verbatim from Pi Network / Pi Apps official documentation.

---

## 0. Version pinning — the exact revision of every source used

Every source below was retrieved and cross-checked on **2026-10-18**. Links rot and pages change silently, so
wherever the source is a Git repository the **commit that last touched the cited file** is recorded. Where the
source is a living website or a PDF, the best available pin is given instead.

| Source | Pin | Revision date |
|---|---|---|
| `pi-apps/pi-platform-docs` — `platform_API.md` (full `PaymentDTO`) | commit `cb704b9` | 2024-08-28 |
| `pi-apps/pi-sdk-integration-guide` — `README.md` (A2U flow) | commit `9b263cd` | 2023-01-27 |
| `pi-apps/pi-sdk-js` — `package.json` (`createPayment`) | commit `a6a5055` · published `@pinetwork/pi-sdk-js@2.0.0` | 2026-03-19 |
| `PiNetwork/PiRC` — `PiRC1/ReadMe.md` (ecosystem tokens) | commit `c50d516` | 2026-02-20 |
| `PiNetwork/PiRC` — `PiRC2/ReadMe.md` (subscription contract) | commit `dc86dfd` | 2026-04-17 |
| `PiNetwork/SmartContracts` — `README.md` (reference implementation) | commit `d5b3915` | 2026-04-17 |
| `stellar/stellar-protocol` — `core/cap-0027.md` (muxed `M…` accounts) | commit `b378cf3` | 2020-07-14 |
| **MiCA Whitepaper — Pi Network (PDF)** | **SHA-256** `9c0dd64e622433cdaed077216e917fe87a34e3733b08a0c6886eba844d8ae61e` (632 317 bytes) | published 2025-11-27 |
| `docs.minepi.com` (Wallet / Payments / Tokens) | living site — no revision available | retrieved 2026-10-18 |
| `pi-apps.github.io/community-developer-guide` | living site — no revision available | retrieved 2026-10-18 |

Verify the PDF pin yourself:

```bash
curl -sL https://minepi.com/wp-content/uploads/2025/11/MiCA-Whitepaper-Pi-1.pdf -o mica.pdf
sha256sum mica.pdf        # macOS/Linux
certutil -hashfile mica.pdf SHA256   # Windows
# expected: 9c0dd64e622433cdaed077216e917fe87a34e3733b08a0c6886eba844d8ae61e
```

Verify a repository pin yourself:

```bash
git clone --filter=blob:none https://github.com/pi-apps/pi-platform-docs
git -C pi-platform-docs log -1 --format='%h %cs' -- platform_API.md    # -> cb704b9 2024-08-28
```

> **Why this matters:** a claim is only as good as the revision it was read from. If an upstream file changes,
> this table records exactly which version the conclusions in this repository rest on.

---

## 1. Pi Docs — official site (2026)
- https://docs.minepi.com/

## 2. Pi Wallet & SDK (`window.Pi.Wallet`)
- https://docs.minepi.com/use-native-features/Wallet

Quotes:
> “The Pi Network JS SDK exposes wallet-related operations and blockchain interactions via the `window.Pi.Wallet` module.”
> “Transactions must be pre-signed; the SDK does not build or sign transactions for you. See [Stellar docs](https://developers.stellar.org/docs/tools/lab/transactions) on creating XDR.”
> “Pi SDK authentication and payment features require the application to run inside the Pi Browser (or the Sandbox).”

## 3. Accept a payment (U2A)
- https://docs.minepi.com/accept-payment/Payments

`createPayment` interface:
```js
window.Pi.createPayment(
  { amount: 1, memo: 'Unlock Premium', metadata: { feature: 'premium' } },
  { onReadyForServerApproval, onReadyForServerCompletion, onCancel, onError }
);
```
> “Deliver purchased features **only after** the backend receives a successful `/complete` response from Pi.”

## 4. Advanced Payments (A2U)
- https://docs.minepi.com/accept-payment/PaymentsAdvanced

Quote:
> “The Pi blockchain is obviously the only source of truth for exchanging Pi.”

## 5. Tokens — proof of the Stellar protocol + the native asset
- https://docs.minepi.com/use-native-features/Tokens

```js
const StellarSDK = require("@stellar/stellar-sdk");
const server = new StellarSDK.Horizon.Server("https://api.testnet.minepi.com");
const NETWORK_PASSPHRASE = "Pi Testnet";
```
```js
updatedDistributorAccount.balances.forEach((balance) => {
  if (balance.asset_type === "native") {
    console.log(`Test-Pi Balance: ${balance.balance}`);
  } else {
    console.log(`${balance.asset_code} Balance: ${balance.balance}`);
  }
});
```
> Note: tokens require a `trustline` + `issuer`, while the native asset has neither.

## 6. Platform API — full `PaymentDTO` definition
- https://github.com/pi-apps/pi-platform-docs/blob/master/platform_API.md
- Base path: `https://api.minepi.com/v2`

```ts
{
  identifier: string,
  user_uid: string,
  amount: number,
  memo: string,
  metadata: Object,
  from_address: string,
  to_address: string,
  direction: Direction,
  created_at: string,
  network: AppNetwork,
  status: {
    developer_approved: boolean,
    transaction_verified: boolean,
    developer_completed: boolean,
    cancelled: boolean,
    user_cancelled: boolean,
  },
  transaction: null | { txid: string, verified: boolean, _link: string },
}
```
> **No field** for “coin origin / mining / exchange”.

## 7. Community Developer Guide
- https://pi-apps.github.io/community-developer-guide/

## 8. Pi SDK JS (GitHub)
- https://github.com/pi-apps/pi-sdk-js

Quote:
> “`createPayment(paymentData)` – Begins a payment operation.”
```ts
interface PaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}
```

## 9. Blockchain (Horizon API) — general references
- Mainnet: `https://api.mainnet.minepi.com`
- Testnet: `https://api.testnet.minepi.com`
- Stellar reference for the native asset and base reserve: https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts

## 10. Whitepaper / Tokenomics
- https://minepi.com/white-paper
- https://minepi.com/blog/mainnet-migrations-roadmap-and-tokenomics/

## 11. Muxed Accounts (`M...`) — CAP-27
- Stellar — Pooled accounts / Muxed accounts / Memos:
  https://developers.stellar.org/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos
  > “Muxed accounts **do not exist on the ledger**, but their shared underlying `GABC…` account does.”
  > “There’s no validation on IDs and as far as the Stellar network is concerned, all supported operations **operate exactly as if you did not use a muxed account**.”
- CAP-27 spec: https://github.com/stellar/stellar-protocol/blob/master/core/cap-0027.md
- Bitget — Pi deposit address (starts with M):
  https://www.bitget.com/academy/how-to-securely-deposit-pi-coin-to-bitget
  > “Your PI deposit address will appear (usually starting with "M").”

## 12. Account/Balance model vs UTXO — “an ID per micro-π”
- Stellar — Accounts (a single numeric balance; native asset has no issuer):
  https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts
- UTXO vs Account model:
  https://www.alchemy.com/docs/utxo-vs-account-models
  https://bitcoin.stackexchange.com/questions/49853/utxo-model-vs-account-balance-model
- Live test: `examples/coin-id-check.mjs`.

## 13. Official MiCA Whitepaper (Pi Network — MiCAR whitepaper)
- 🔗 https://minepi.com/wp-content/uploads/2025/11/MiCA-Whitepaper-Pi-1.pdf
- Published: 2025-11-27 · Start of admission to trading: 2025-11-28 · Home Member State: Malta.
- Key verbatim quotes:
  > **F.2:** “Pi is the **native, fungible digital asset** of the Pi Network Layer 1 blockchain.”
  > **F.14:** “**Functionally Fungible Group** Digital Token Identifier: **2Z2WZP5KM**”
  > **G.3:** “The Pi token and its’ on chain functionalities are **immutable**. No modifications to transactions or the current blockchain ledger history can be made by anyone, **including the issuer**.”
  > **G.11 (Transfer Restrictions):** “Not applicable”
  > **G.4:** “Pi tokens are only available through mining. Individuals… that have mined tokens may elect to **sell tokens on the secondary market**…”
  > **E.2:** “The issuer is seeking admission to **secondary trading only**, through which the issuer will not gain any direct proceeds.”

## 14. “Don’t buy Pi” — Enclosed Mainnet policy (now expired)
- Enclosed Network (firewall blocks external connectivity): https://minepi.com/blog/open-network-launch-date/
  > “…the launch of the **Enclosed Network period**, which meant Mainnet was live but with a **firewall that prevents any external connectivity**.”
- Open Network (firewall removed + CEX): https://minepi.com/blog/open-network/
  > “With Open Network, **the firewall that was in place during Enclosed Network has been removed**.”
  > “…**support for integrations with centralized exchanges (CEXs) and onramps to provide additional means of acquiring Pi**…”

## 15. Fungibility vs price — same asset, different venue prices
- CryptoRank — Pi price spread across exchanges: https://cryptorank.io/price/pi-network-1/arbitrage
- arb.sh — PI spread (OKX vs Bitget): https://arb.sh/arbitrage/crypto/pi/okx-vs-bitget
- Investopedia — Kimchi Premium (same BTC, different price): https://www.investopedia.com/terms/k/kimchi-premium.asp

## 16. Issuer powers / no price control — “can they set a different price or block sales?”
- **No origin to target:** native asset has no per-unit identity (see §12).
- **No price in the protocol:** a payment is `bal(S) -= a ; bal(D) += a` — there is no price field.
- **No asset-level controls on native:** the issuer powers (freeze/clawback) exist only for *issued* assets;
  native Pi has **no issuer**. See Stellar — Accounts (§9) and MiCA G.11 “Transfer Restrictions: Not applicable” (§13).
- **Immutability even by the issuer:** MiCA **G.3** (§13).
- **Where their power lies:** off-chain — Pi Browser/app platform, SDK/Platform-API keys, KYC, migration
  (see §1, §2, §6).
- **Only a different *asset*** (IOU / wrapped / token) can carry different rules/price — not native Pi.
  See `docs/FAQ-CAN-CORE-TEAM-SET-PRICE.md`.

## 17. Official SDK Integration Guide (GitHub) — A2U payments
- https://github.com/pi-apps/pi-sdk-integration-guide
  Verbatim quotes:
  > “The Pi blockchain is obviously the **source of truth** for exchanging Pi. The Pi backend is used to
  > improve the end-user experience (e.g. provide users understandable memos on their wallet, and link backs
  > to your app, **while preserving user and developer privacy by not making this information public on the
  > chain**) and to assist developers in avoiding to make payment mistakes (e.g. double payments due to
  > server faults)”
  > “Your Pi SDK implementation needs to both be able to **sign and submit blockchain transactions using the
  > Stellar SDK** and send additional API calls to the Pi backend using standard https libraries.”
  Build-the-transaction step (verbatim), showing the payment is the **native asset** plus an app-written memo:
  ```js
  let payment = StellarSdk.Operation.payment({
    destination: recipientAddress,
    asset: StellarSdk.Asset.native(),   // native asset — no issuer
    amount: body.amount.toString()
  });
  // ...
  .addMemo(StellarSdk.Memo.text(paymentIdentifier));  // memo = app's own payment id
  ```
- Live check: `examples/app-payment-flow/server.js` (prints the `PaymentDTO` keys).

## 18. Official Platform docs (GitHub) — Payment flow
- https://github.com/pi-apps/pi-platform-docs/blob/master/payments.md
  Verbatim quote:
  > “Payments are **wrappers around blockchain transactions**, which enable your app, the Pi Blockchain, and
  > the Pi Servers to be all synchronized when the user submits a blockchain transaction to pay for something
  > in your app.”
  > Three phases, all keyed on the **payment id + txid** (never a coin origin): “Payment creation and
  > Server-Side Approval”, “User interaction and blockchain transaction”, “Server-Side Completion”.
- Note on third-party mirrors: auto-generated wikis of these repos (e.g. *DeepWiki* “Payment Flow |
  pi-apps/pi-platform-docs”) are **unofficial**, and their field names (camelCase `paymentId`/`toAddress`) may
  not match the real API. Cite the official repos above.
- See also: `docs/FAQ-SDK-PLATFORM-API-FIELDS.md` (the full SDK/API field enumeration).

## 19. PiRC — Pi Requests for Comment (official GitHub org `PiNetwork`)
- https://github.com/PiNetwork/PiRC
  > “**Pi Requests for Comment**” — official design RFCs, reviewed publicly via GitHub Issues / Discussions /
  > Pull Requests, published by the `PiNetwork` organization (Public).
  Contents: **`PiRC1`** — Pi Ecosystem Token Design · **`PiRC2`** — Subscription Contract API.
- ⚠️ **RFC status:** these are **Requests for Comment** (design + reference implementation), **not** final
  Mainnet specifications. Treat them as proposals open to change.

## 20. PiRC1 — Pi Ecosystem Token Design (Pi Launchpad)
- https://github.com/PiNetwork/PiRC/blob/main/PiRC1/ReadMe.md
  Verbatim quotes:
  > “**Pi Launchpad** introduces a fair, transparent, community-first and enagement-oriented token launch
  > framework built natively on the Pi ecosystem.”
  > “Unlike traditional launchpads, Pi Launchpad never transfers the proceeds of a token launch sale to the
  > project team — instead, **all Pi sold becomes liquidity**, supporting long-term market depth and trust.”
  > “**On-chain transparency** of the launch process ensured by **immutable smart contracts**.”
  Token flow (§2.2): “…the pool remains fully accessible to users for **Pi ↔ token swaps** or new liquidity
  deposits.”
  Participation (§3): users **stake Pi** to receive *PiPower*; the baseline rule references an account with
  “an active Pi lockup of ≥90% of their **mined** tokens for at least 3 years”.
  → Here Pi is the **staked / liquidity asset** and the launched units are **separate tokens** (new assets).
  **No per-unit origin field appears anywhere.**

## 21. PiRC2 — Subscription Contract API + reference implementation
- https://github.com/PiNetwork/PiRC/blob/main/PiRC2/ReadMe.md
  > “This document specifies the Subscription Contract API — a **Soroban smart contract** that manages
  > recurring payment subscriptions on the Pi Network.”
  > “…enabled by **Soroban’s token allowance mechanism**: a subscriber can `approve` a contract as a spender
  > for a given amount (optionally with an `expiration_ledger`), and the contract can later draw down that
  > allowance over time (e.g. via `transfer_from`) without transferring or locking the full budget upfront.”
- Reference implementation (official): https://github.com/PiNetwork/SmartContracts
  > “A **Soroban smart contract** for recurring paid subscriptions on the Pi Network… subscribers pay using
  > **standard Stellar asset tokens** via allowance-based recurring charges.”
  Verified in the source code:
  - `soroban-sdk = "22.0.0"` → **Stellar protocol 22 (Soroban)** semantics.
  - Uses `soroban_sdk::token::TokenClient`: `approve`, `transfer`, `transfer_from`, `allowance`, `balance`
    — all on **scalar `i128` amounts** per (account, token). **No** per-unit origin in the token interface.
  - Data model (`Service`, `Subscription`): ids, addresses, an `i128` price, timestamps — **no** origin field.
  - Event `charge` = `(subscriber, service_id, price)` — a scalar amount.
- Official blog: https://minepi.com/blog/subscriptions-smart-contract (published 2026-04-17)
  > “Pi Network is launching its **first smart contract capability on Pi Testnet: subscription support**!”
  > “It also gives the ecosystem a way to **evaluate the contract before rollout to the Mainnet**.”
  > “The smart contract itself is also being reviewed by external auditing services.”
  → This is the **first** capability, on **Testnet**; Mainnet rollout was still pending at publication.

## 22. Pi smart-contract platform (Soroban) — what it changes and what it does not
- Pi Docs — “Use Pi native features” lists **tokens** among native features:
  https://docs.minepi.com/use-native-features/Wallet (see also §2).
- The interface a contract is given for an asset is the **Stellar token interface** (SEP-41 style): scalars
  `balance()`, `allowance()`, `transfer()`, `transfer_from()`, `approve()` — **no per-unit origin**.
- Consequence: Soroban smart contracts do **not** add per-unit provenance to the **native** asset. A contract
  can implement arbitrary rules for **its own token / state** — that is a **different asset** (see §12 and
  `docs/FAQ-ALL-OBJECTIONS.md` Group C).
- → `docs/FAQ-SMART-CONTRACTS-AND-TOKENS.md` (the full treatment).
