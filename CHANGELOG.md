# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `package.json` with `npm test`, `npm run verify`, `npm run falsify`, `npm run offline`
- `examples/README.md` with a clear table of all runnable proofs
- `CHANGELOG.md` (this file)
- `.nvmrc` pinning Node 22
- CI: separate `build-site` job + `npm ci` with caching; offline checks run first

### Changed
- Corrected stale self-test counts (29 -> 37 checks; 26 -> 34 offline) across README, examples/README, AUDIT-REQUEST
- `examples/app-payment-flow/server.js` converted to ESM so it runs under `"type": "module"`

### Fixed
- (none)

## [1.0.0] - 2026-10-18

### Added
- Initial source-verified proof: `π = π` — native Pi is fungible, no observable per-unit mining origin on Pi Mainnet
- Four-layer proof: Stellar/Horizon (native asset), Pi Wallet SDK, Platform API `PaymentDTO`, Soroban smart-contract interface
- Runnable, zero-dependency examples (`provenance-check`, `coin-id-check`, `mixing-check`, `falsify-try`, `verify-deposit`, `memo-check`, `exchange-wallets`, `model-check`, `exhaustive-check`, `run-all`, `self-test`)
- Exhaustive/offline model checks (2,000 seeds + all 1,452 bounded histories)
- Live falsification attempt that scans all returned Horizon keys for origin-like fields
- Concrete exchange-wallet observation (Bitget ↔ OKX) showing `to_muxed_id` identifies the user, not coin origin
- Full FAQ set covering transaction-vs-coin, UTXO vs Account/Balance, muxed `M` vs `G`, taint/contagion, MiCA, price vs fungibility, and common objections
- `docs/INDEX.md`, `docs/SOURCES.md`, `docs/VERIFICATION.md`, `docs/THREAT-MODEL.md`, `docs/SCOPE.md`, `docs/FALSIFICATION.md`, `docs/PRIOR-ART.md`, `docs/AUDIT-REQUEST.md`
- GitHub Pages site (`index.html`, `README.html`) with canonical links
- Machine-readable index for AI tools (`llms.txt`)
- Citation metadata (`CITATION.cff`)
- Security policy (`SECURITY.md`) and scam FAQ
- CI workflow: `self-test.yml`
- MIT License

[Unreleased]: https://github.com/aybvip/pi-fungibility/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/aybvip/pi-fungibility/releases/tag/v1.0.0
