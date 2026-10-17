# FAQ — “It’s just a random GitHub repo, so it must be a scam / phishing”

## The objection (generic form)
> “Anyone can create a GitHub repository and claim anything. It could be malware or a phishing script.
> Official Pi tools are only in Pi Browser. Don’t connect your wallet or enter your passphrase.”

## Where the objection is **right** ✅ (and we agree)
- **Anyone can create a repo** → TRUE. That is precisely why you must **audit the code, not trust the author**.
- **Malicious repos exist** → TRUE. Scams are real.
- **Official Pi apps live in Pi Browser / official channels** → TRUE for *operations*.
- **Never share your passphrase; never sign an unknown transaction** → TRUE. **[`SECURITY.md`](../SECURITY.md) says the same.**

## Where the objection is **wrong** ❌
1. **“Pi is not officially listed / the network is closed.”** → **Outdated.** **Open Network launched
   2025-02-20** and the **firewall was removed**; Pi trades as the **native** asset on OKX, Bitget, Gate, etc.
   Sources: [`SOURCES.md`](SOURCES.md) §13–§14, [`FAQ-DONT-BUY-PI.md`](FAQ-DONT-BUY-PI.md).
2. **“Nothing legitimate can exist outside official channels.”** → False. **Open-source analysis** is normal
   and, unlike a website, it is **fully checkable**. The whole point is that you can *read* it.
3. **It never evaluated the repository** — it is a **generic refusal triggered by the word “GitHub”**, not a
   finding about this code.

> Key idea: **“Unofficial” ≠ “scam.”** And **“official” ≠ “safe”** by itself. The real test is **what the code
> actually does** — which anyone can read here.

## Why **this** repo is safe (verifiable facts, not promises)
| Property | This repo |
|---|---|
| Wallet connection | ❌ Never |
| Passphrase / seed | ❌ Never |
| Private keys | ❌ Never |
| Transaction signing | ❌ Never |
| Network calls | ✅ Read-only `GET` to the public API |
| Third-party dependencies | ❌ None (no `npm install`) |
| Code | ✅ Short, plain Node.js — fully auditable |

Audit it yourself:
```powershell
Select-String -Path examples/*.mjs -Pattern 'fetch\(' -SimpleMatch   # you'll see only read-only GETs
```

Full detail: [`SECURITY.md`](../SECURITY.md).

## How to tell a **safe** repo from a **scam** (general checklist)
| Signal | Safe analysis | Scam |
|---|---|---|
| Asks for your **passphrase / 24 words** | ❌ never | ✅ asks |
| Asks you to **sign an unknown transaction** | ❌ never | ✅ asks |
| Asks to **connect wallet** to a random site | ❌ never | ✅ asks |
| Ships an **obfuscated binary** | ❌ no | ✅ yes |
| Many **dependencies / postinstall** scripts | ❌ none here | ✅ often |
| Promises **profit** or **“special/ original mined Pi”** | ❌ never | ✅ promises |
| Only does **read-only public API** calls | ✅ yes | ❌ no |

## The key principle
The relevant question is never “official or not?” but **“what does the code do?”**
This code: **reads public data and prints it**. It cannot touch your funds — there is no mechanism in it to do so.

## Conclusion
- **Agree:** never share your passphrase, never sign unknown transactions, use official channels for real
  operations. ✅
- **Correct:** “Pi not listed / network closed” is outdated. ✅ Open Network, 2025-02-20.
- **The real test:** read the code. It is read-only and auditable → [`SECURITY.md`](../SECURITY.md).

**Audit, don’t trust — that applies to every repo, including this one.**

## Sources
- [`SECURITY.md`](../SECURITY.md) · [`SCOPE.md`](SCOPE.md) · [`SOURCES.md`](SOURCES.md) · [`FAQ-DONT-BUY-PI.md`](FAQ-DONT-BUY-PI.md)
- Open Network: https://minepi.com/blog/open-network/
