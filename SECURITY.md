# Security & Disclaimer

## 1. This repository is **independent and unofficial**
This project is an **independent technical analysis** with **read-only** tools. It is **not** affiliated with,
endorsed by, or connected to **Pi Network / Pi Core Team / SocialChain / PiBit** in any way.

> Being “unofficial” is normal for a code repository — and it is exactly why you should **audit it instead of
> trusting it**. This file tells you how.

## 2. What this repository does **NOT** do ❌
- ❌ **No** wallet connection.
- ❌ **No** passphrase / 24-word seed phrase.
- ❌ **No** private keys.
- ❌ **No** transaction signing.
- ❌ **No** moving, holding, or spending of any funds.
- ❌ **No** third-party dependencies (nothing to `npm install`).

## 3. What the scripts actually do ✅
Every script in `examples/` performs **only read-only HTTP `GET`** requests to the **public** Pi Mainnet
Horizon API and prints the JSON/messages to your terminal:

```js
const res = await fetch("https://api.mainnet.minepi.com" + path, { headers: { Accept: "application/json" } });
```

Audit it yourself (the code is small, plain Node.js — no libraries):
```powershell
# Show every network call in the scripts — you'll only see read-only GETs:
Select-String -Path examples/*.mjs -Pattern 'fetch\(' -SimpleMatch
```

The interactive demo in `examples/app-payment-flow/` uses the **official Pi SDK** and a **server-side** API key
(`PI_API_KEY`, read from an environment variable) — it never asks for your passphrase and never signs for you.

## 4. How to verify everything (audit, don’t trust)
1. **Read the files.** They are short. There is no compiled/obfuscated code.
2. **Check the network calls** (see `Select-String` above): read-only `GET`s only.
3. **No install step.** There is no dependency to fetch and no postinstall script.
4. **Run offline first if you prefer**: nothing runs until *you* type `node examples/…`.

## 5. Universal safety rules (always true, for any repo — including this one)
- 🔐 **Never** share your 24-word passphrase. Anyone who has it owns your wallet.
- 🚫 **Never** enter your passphrase on a website, script, or “tool”.
- ✍️ **Never** sign a transaction you don’t fully understand.
- 🧭 Use **official channels** (the official Pi apps inside **Pi Browser**) for real operations.
- ⚠️ Anything promising **guaranteed profit**, or a **“special / original / graded mined Pi”**, is a **scam**.
- 🧪 This repo never needs your keys — if any tool *asks* for them, that tool is the danger.

## 6. A common, outdated claim — correcting it with sources
A frequent objection is *“Pi is not officially listed and the network is closed, so any fungibility talk is a
scam.”* That is **outdated**:
- **Open Network launched on 2025-02-20**; the **firewall was removed**.
- Pi is **listed** on exchanges (e.g. OKX, Bitget, Gate) as the **native** asset.
- Official sources: [`docs/SOURCES.md`](docs/SOURCES.md) §13–§14 and
  [`docs/FAQ-DONT-BUY-PI.md`](docs/FAQ-DONT-BUY-PI.md).

> Note: this repo makes **no** claim about **price**. It is about **asset identity / fungibility** only
> (see [`docs/SCOPE.md`](docs/SCOPE.md)).

## 7. Reporting
If you believe any script here is unsafe, **don’t run it** — open an issue describing the exact file and line.
Security of readers comes first.
