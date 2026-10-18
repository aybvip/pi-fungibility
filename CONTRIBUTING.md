# Contributing

Thanks for wanting to improve this repo. **The single most valuable contribution is finding a flaw** —
this project deliberately keeps itself falsifiable. If a claim is wrong, a proof step does not follow, a
quote is mis-attributed, or a script misleads, that is a **welcome** finding.

> **Audit, don’t trust** — including this repo. See [`docs/AUDIT-REQUEST.md`](docs/AUDIT-REQUEST.md).

---

## 1. How to report a problem

- **Open an issue** using the **“Audit finding / correctness issue”** template
  ([`.github/ISSUE_TEMPLATE/audit-finding.md`](.github/ISSUE_TEMPLATE/audit-finding.md)).
- Say **which claim** you are challenging (**A / B / C** — see
  [`docs/FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](docs/FAQ-EXCHANGE-DEPOSIT-VERIFY.md)).
- For **code** findings, paste the exact command line and the **full output**.
- For **source** findings, link the official document so it can be checked.

---

## 2. Project rules (please keep these)

1. **Bilingual, English first.** Every document exists as **English** (`*.md`) and **Arabic** (`*.ar.md`).
   English files stay **English** (the only Arabic allowed is the language-switcher link, which links to the
   Arabic page).
2. **Zero dependencies.** Only **Node 18+ built-ins** (`fetch`, `node:child_process`, …). No `npm install`.
3. **Read-only.** Scripts may only issue **GET** requests against the public API
   (`https://api.mainnet.minepi.com`). **No** wallet, **no** keys, **no** passphrase, **no** signing,
   **no** writes. See [`SECURITY.md`](SECURITY.md).
4. **Precise claims only.** State exactly what is proven and what is **not** (price, identity-hiding,
   reserve backing are **out of scope**). Prefer the canonical wording:
   *“A native Pi payment carries no observable per-unit mining origin on the Pi Mainnet ledger.”*
5. **No tool/AI names.** Do not name any assistant, chatbot, or external tool anywhere in the repo.
6. **Official sources.** Back protocol claims with a link (docs.minepi.com, the MiCA whitepaper, the
   Platform API docs). Add them to [`docs/SOURCES.md`](docs/SOURCES.md).
7. **Keep outputs honest.** If you change a script’s output, **regenerate** its committed
   `examples/*-output.txt` snapshot.

---

## 3. Adding a new FAQ (answering a new objection)

1. Create `docs/FAQ-<TOPIC>.md` **and** `docs/FAQ-<TOPIC>.ar.md`.
2. Structure: **the objection** (stated fairly) → **the short answer** → **the evidence** (source + code)
   → **what is *not* claimed**.
3. Link both files from:
   - [`README.md`](README.md) FAQ table **and** [`README.ar.md`](README.ar.md)
   - [`docs/INDEX.md`](docs/INDEX.md) Part 1 **and** Part 2, **and** their `.ar.md` equivalents.
4. If the objection is common, also add it to [`docs/FAQ-ALL-OBJECTIONS.md`](docs/FAQ-ALL-OBJECTIONS.md).

---

## 4. Run everything locally

Requires **Node 18+** and network access (only the live examples need the network).

```bash
node examples/run-all.mjs            # everything at once (+ summary); add --offline for no network
node examples/self-test.mjs          # offline unit tests + online end-to-end (11 checks)
node examples/model-check.mjs        # offline ledger model + property check (2000 seeds)
node examples/exhaustive-check.mjs   # offline EXHAUSTIVE bounded check (all 1452 histories)
node examples/provenance-check.mjs   # live: no origin field on chain
node examples/coin-id-check.mjs      # live: balance is one scalar
node examples/verify-deposit.mjs <TXID> [TO_ADDRESS]
node examples/mixing-check.mjs
```

CI runs the **offline** checks on **Node 20 & 22** for every push/PR
([`.github/workflows/self-test.yml`](.github/workflows/self-test.yml)). Keep them **green**.

---

## 5. Commits & style

- Small, focused commits with a clear message; explain **why**, not just what.
- Keep scripts **short and readable** — they are meant to be **audited line by line**.
- Prefer comments that state **assumptions** and **known limits**.
- By contributing you agree your work is released under the repo **MIT** license
  ([`LICENSE`](LICENSE)).

---

## 6. What we will *not* accept

- Claims of **price**, **future value**, or **guaranteed** reserve backing.
- Anything that weakens the **read-only** guarantee or adds dependencies.
- Removing or softening the honest **scope** statements.

> **Goal:** a repo a skeptic can verify end-to-end and, where possible, **break**.
