# Prior art — what existed before this repository, and what appears new

> **Plainly:** the *technical fact* asserted here is **not a new discovery**. It follows from Stellar's
> Account/Balance model, and Pi Network's own MiCA whitepaper already classifies Pi as fungible.
> What appears to be new is the **applied, reproducible proof of it on Pi Mainnet** — a zero-dependency
> read-only harness, a three-claim scope, executable formal checks, and a catalogue of objections each
> answered with a measurement.
>
> **We claim only that we could not find prior published work. We do not claim proven priority.**

This page exists so a reader can judge the repository's contribution honestly, instead of taking
"proven" at face value. It states what came before, what was searched, what appears new, and what this
page deliberately does **not** claim.

---

## 1. What already existed (prior art)

| Source | What it establishes | Date | Kind |
|---|---|---|---|
| **Pi Network MiCA whitepaper** | Pi is the *“native, fungible digital asset”*, held in a *“Functionally Fungible Group”* | 2025-11 | Issuer's own regulatory assertion |
| **Stellar ledger / protocol docs** | Account/Balance model, **not** UTXO: an account holds **one scalar balance**, not a set of identifiable coins | living docs | Underlying protocol design |
| **Stellar CAP-27 (muxed accounts)** | `M…` = `G…` + a muxed id — a **recipient selector**, never an asset tag | protocol standard | Underlying protocol design |
| **General UTXO-vs-Account literature** | Account-model ledgers do not carry per-unit lineage; well described across blockchain literature | many sources | General knowledge |
| **Academic work on Pi tokenomics** | Supply, mining rewards, distribution economics (e.g. *J. Educ. Manage. Stud.* 15(3), 2025) | 2025 | Adjacent — **not** a ledger proof |

**Consequence, stated plainly:** anyone who knows the Account/Balance model already expects the
conclusion. This repository did not discover the fact; it **made the fact checkable**.

---

## 2. What appears to be new here

| Contribution | Why it does not appear elsewhere | Evidence in this repo |
|---|---|---|
| **A precise, falsifiable claim** scoped to *observable* and *per-unit* | Most discussion stays at "π = π" as an opinion | [`SCOPE.md`](SCOPE.md) · [`PROOF.md`](../PROOF.md) |
| **Three-claim separation** — A proven / B verifiable / C not claimed | Reserve-backing and fungibility are routinely conflated | [`SCOPE.md`](SCOPE.md) §1 |
| **Reproducible, read-only, zero-dependency harness** | No `npm install`, no credentials, GET-only | [`examples/`](../examples/) · [`SECURITY.md`](../SECURITY.md) |
| **Executable formal checks** — a ledger model with property testing, plus exhaustive bounded enumeration | Fungibility is usually asserted, not model-checked | `model-check.mjs` (2 000 seeds) · `exhaustive-check.mjs` (all 1 452 histories) |
| **Catalogue of objections, each with a measurement** | Counterarguments live in comment threads and disappear | [`docs/FAQ-*.md`](INDEX.md) · [`FALSIFICATION.md`](FALSIFICATION.md) |
| **Concrete exchange measurements** — real addresses, muxed rebuild, pinned tx hashes | Attribution is normally taken on trust from a label | [`FAQ-EXCHANGE-ADDRESSES-OBSERVED.md`](FAQ-EXCHANGE-ADDRESSES-OBSERVED.md) |

---

## 3. What was searched, and what came back

Performed 2026-10-18. Queries were run against public web search and the GitHub API.

| Query family | Expected finding if prior art existed | Result |
|---|---|---|
| `Pi Network fungibility proof / "per-unit origin" / no origin field` | A competing proof | Only this repository returned |
| `Pi Network mined-coin origin trace analysis` | An applied analysis | **None** — results covered price and tokenomics only |
| `github.com: org "pi-network"` (GitHub API) | Related repos | **0 public repositories** |
| `github.com: org "pinetwork"` (GitHub API) | Related repos | Only `PiRC` and `SmartContracts` (unrelated) |
| Academic search: Pi + ledger fungibility | A paper | **None** — Pi papers found are tokenomic/educational |
| `Pi Network + MiCA "Functionally Fungible Group"` | Prior claim of fungibility | **Found** — but it is the *issuer's* assertion, not an independent proof |

> ⚠️ **Read this table correctly.** It records *what a search returned on a date*, not proof of priority.
> Public web search does not cover private chat, forums, unpublished drafts, or non-English material.

---

## 4. The measurement that keeps the claim honest

Protocol upgrades change the ledger, so the claim is re-measured rather than assumed. On **2026-10-18**,
after the protocol upgrades that added zero-knowledge / privacy-preserving smart-contract capability:

```
protocol_version = 28
union of keys across the 50 most recent payment records = 18
origin-like key hits (origin, source_type, mined, purchase, provenance, …) = NONE
```

Reproduce it yourself:

```bash
node examples/run-all.mjs          # 10 checks, includes live reads
node examples/falsify-try.mjs      # enumerates the whole API surface for an origin field
node examples/provenance-check.mjs # a live payment record, key by key
```

If a future protocol version introduces an origin-bearing field, `falsify-try.mjs` reports it and the
claim is falsified — see [`FALSIFICATION.md`](FALSIFICATION.md). The recorded date of the last successful
run is in [`VERIFICATION.md`](VERIFICATION.md).

---

## 5. What this page does **not** claim

| Not claimed | Why |
|---|---|
| **“We are first.”** | Absence of a search result is not proof of priority. The honest statement is *“we could not find prior published work.”* |
| **A novel underlying fact.** | The absence of per-unit origin is entailed by the Account/Balance model. The contribution is rigour and reproducibility, not surprise. |
| **Independent audit.** | The repository is self-verified and reproducible. That is not a third-party audit — see [`AUDIT-REQUEST.md`](AUDIT-REQUEST.md). |
| **That the ledger will not change.** | Protocol versions advance. Every measurement here is dated, and the falsification path is open. |
| **That all prior discussion is absent.** | Community discussion exists in channels this search cannot reach. We cite what we can verify, and only that. |

---

## 6. If you know of prior work

Then it belongs here. Open an issue or a pull request naming the work, a stable link, and its date — it
will be cited in section 1 as prior art, and any claim in section 2 that it anticipates will be
withdrawn. Correcting this page's novelty framing is a **welcome** contribution, not a critique of the
repository.

See [`CONTRIBUTING.md`](../CONTRIBUTING.md).

---

## See also

- [`AUDIT-REQUEST.md`](AUDIT-REQUEST.md) — independent audit status, scope, and how to do one
- [`SCOPE.md`](SCOPE.md) — the exact claims A / B / C, and what is explicitly not claimed
- [`FALSIFICATION.md`](FALSIFICATION.md) — precisely what would kill the claim
- [`SOURCES.md`](SOURCES.md) — verbatim official quotes with pinned revisions
- [`VERIFICATION.md`](VERIFICATION.md) — what was run, when, and where
