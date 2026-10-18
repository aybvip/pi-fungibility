---
name: Audit finding / correctness issue
about: Report a problem with a claim, the proof, the sources, or the code
title: "[audit] "
labels: ["audit"]
---

<!--
Thanks for auditing! This repo is NOT independently audited yet — see
docs/AUDIT-REQUEST.md. Findings are exactly what we want.

Please be specific so the issue can be reproduced and fixed.
-->

## Which claim is affected?
<!-- Check one. See docs/FAQ-EXCHANGE-DEPOSIT-VERIFY.md for the A/B/C definitions. -->
- [ ] **A** — protocol fungibility (no observable per-unit mining origin)
- [ ] **B** — a specific transfer is a real native Pi payment on Mainnet
- [ ] **C** — reserve backing (note: **not claimed** by this repo)
- [ ] Documentation / sources / other

## Type of finding
- [ ] Incorrect claim or overreach
- [ ] Broken / unsound proof step (SCOPE.md §7, PROOF.md)
- [ ] Mis-attributed source or quote (SOURCES.md)
- [ ] Code bug or misleading output (examples/)
- [ ] Reproducibility problem

## What did you run / read?
<!-- Exact command line and/or file + line reference. -->
```
node examples/...
```

## Observed vs expected
- **Observed:**
- **Expected:**

## Full output (if a command)
```
paste output here
```

## Environment
- Node version:
- OS:
- Commit / tag (e.g. `git rev-parse --short HEAD`):

## Additional context
<!-- Links to official sources, screenshots, or reasoning. -->
