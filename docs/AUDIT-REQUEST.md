# Independent audit — status, scope, and how to do one

> **Plainly: this repository has NOT been independently audited.**
> It is **self-verified and fully reproducible**, which is **not** the same as a third-party audit.
> This file says exactly what that means, what an auditor should check, and how to reproduce everything.

---

## 1. Status (honest, up front)

| Question | Answer |
|---|---|
| Independently audited by a third party? | ❌ **No** |
| Peer-reviewed formally (academic/industry)? | ❌ **No** |
| Reproducible by anyone (sources + code)? | ✅ **Yes** |
| Automated tests of the *tool logic*? | ✅ **Yes** — [`examples/self-test.mjs`](../examples/self-test.mjs) + [CI](../.github/workflows/self-test.yml) |
| Does passing tests prove the whole mathematical claim? | ❌ **No** — tests check the **tool**, not the **proof** |

> ⚠️ **Do not read “tests pass” as “audited.”** Automated checks verify the behaviour of one script
> against one transaction. An audit is a *human* review of the **claims, the proof, and the code together**.

---

## 2. What “independent audit” would mean here

An auditor is a **third party** (not the author) who, with **adversarial intent**, checks that:

1. **The claim is stated precisely** — before checking anything, is the claim even well-posed?
   (It is: *“a native Pi payment carries no observable per-unit mining origin on the Pi Mainnet ledger.”*)
2. **The proof is sound** — every step in [`SCOPE.md`](SCOPE.md) §7 / [`PROOF.md`](../PROOF.md) follows,
   with **no hidden assumption**.
3. **The sources say what is attributed to them** — every quote in [`SOURCES.md`](SOURCES.md) matches the
   official document (docs.minepi.com, the MiCA whitepaper, the Platform API docs).
4. **The code does what it claims** — read-only, no hidden calls, and its output matches a manually
   computed result.
5. **The scope is respected** — that claims **A / B / C** (below) are not conflated, and that nothing
   beyond the stated claim is implied.

Only (1)–(5) **together**, done by someone other than the author, would be an audit. None of them is
claimed as done by a third party.

---

## 3. The three claims (so an auditor knows what to attack)

| # | Claim | Evidence in this repo | Audited? |
|---|---|---|---|
| **A** | Protocol fungibility — no observable per-unit mining origin | [`SCOPE.md`](SCOPE.md) §7 (formal), [`PROOF.md`](../PROOF.md) | ❌ not by a third party |
| **B** | A **specific** transfer is a real native Pi payment on Mainnet | [`examples/verify-deposit.mjs`](../examples/verify-deposit.mjs) + [`self-test.mjs`](../examples/self-test.mjs) | ✅ logic self-tested; ❌ not third-party |
| **C** | A venue’s total internal balance is fully backed on-chain | — | ❌ **not claimed** (off-chain) |

See [`FAQ-EXCHANGE-DEPOSIT-VERIFY.md`](FAQ-EXCHANGE-DEPOSIT-VERIFY.md) for the full separation.

---

## 4. Reproduce everything yourself (≈ 5 minutes)

Requires only **Node 18+** (no npm, no dependencies) and network access.

```bash
git clone https://github.com/aybvip/pi-fungibility
cd pi-fungibility

node examples/self-test.mjs          # 8 offline unit tests (evaluate) + 3 online end-to-end checks
node examples/coin-id-check.mjs      # no per-micro-π identifier on the ledger
node examples/provenance-check.mjs   # a live account with many inbound payments, one scalar balance
node examples/mixing-check.mjs       # mined + bought -> one balance -> origin-less payment
```

Then read, **against the code**, the claims in `SCOPE.md` / `PROOF.md`. Everything the repo asserts about
the protocol is either a **quoted official source** or a **plain node script** you just ran.

> 🔧 The scripts are intentionally tiny and dependency-free so they can be **read line by line** —
> see [`SECURITY.md`](../SECURITY.md) for the read-only guarantee (no wallet, no keys, no signing).

---

## 5. Known limitations (the auditor’s checklist)

- **Formal proof is not machine-checked.** §7 is a written argument, not a Lean/Coq artifact. A stronger
  version would formalise it in a proof assistant.
- **Sources are as of their publication date.** If Pi Network changes the protocol or its docs change,
  re-verify (see [`SOURCES.md`](SOURCES.md) for dates/links).
- **The live examples depend on the network.** They query `https://api.mainnet.minepi.com`; a specific
  account/tx could change over time. The **sample outputs** are committed as snapshots
  (`examples/*-output.txt`) — the method, not the numbers, is the point.
- **“Native” ≠ “backed”.** See Claim C — deliberately out of scope.
- **No security guarantee.** This is analysis, not financial or security advice ([`DISCLAIMER.md`](../DISCLAIMER.md)).

---

## 6. Find a problem? Report it

Errors are welcome — that is the point of a public, reproducible repo.

- Open an **issue** with: the claim at stake (A/B/C), the source or command, and the observed vs expected.
- If it is about the **code’s** behaviour, include the exact command line and full output.
- If a **quote** is mis-attributed, link the official source so it can be corrected.

> **The standard we hold ourselves to:** *audit, don’t trust* — including this repository itself.
> Until a third party does that, the correct label is **“self-verified, reproducible, not independently audited.”**

---

## Sources
- [`SCOPE.md`](SCOPE.md) §3.4 (no independent audit claimed) · [`SECURITY.md`](../SECURITY.md) · [`PROOF.md`](../PROOF.md)
- [`SOURCES.md`](SOURCES.md) · [`DISCLAIMER.md`](../DISCLAIMER.md)
