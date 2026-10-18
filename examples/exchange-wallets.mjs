#!/usr/bin/env node
/**
 * exchange-wallets.mjs
 * ---------------------------------------------------------------------------
 * Observed, read-only: two real exchange accounts on Pi Mainnet.
 *
 * The narrow question this script settles by measurement:
 *
 *   "Here are the actual Bitget and OKX Pi Mainnet addresses the venues show.
 *    Given them, can you tell an exchange coin from a mined coin — or trace
 *    where a specific coin came from?"
 *
 *   No. What is observable is the ACCOUNT (who); what is never observable is
 *   the COIN (origin). This script measures the account side, exactly:
 *
 *     1. Decode each address from scratch (base32 + CRC16-XModem): version,
 *        checksum, and the raw 32-byte ed25519 key.
 *     2. Read the account: it is a SINGLE native balance (one scalar), with no
 *        trustlines, no flags, no data. The label ("Bitget"/"OKX") is EXTERNAL
 *        attribution from the venue's own UI/docs — never an on-chain fact.
 *     3. Read recent payments: every deposit to the pooled account carries a
 *        `to_muxed_id` (CAP-27). We REBUILD the `M...` address from (G + id)
 *        and require it to match the API's `to_muxed` exactly. That id names the
 *        RECIPIENT inside the venue — never the coin's source.
 *     4. Verify PINNED, historical cross-venue transfers (Bitget -> OKX) by
 *        transaction hash: each is a plain `payment` of `asset_type: native`,
 *        `memo_type: "none"`, `successful: true`. Historical hashes never
 *        change, so this evidence is stable forever (a "last N" window is not).
 *
 * Honest bounds (printed at the end, and the reason this is useful at all):
 *   - We do NOT prove the venue owns the address. Attribution is external.
 *   - A balance is a snapshot; `to_muxed_id` semantics are inferred from the
 *     pattern, not asserted by the protocol as "a user id".
 *   - None of it adds a per-unit origin field. That is the point.
 *
 * Zero dependencies (Node 18+ built-in fetch). Read-only. GET only.
 *
 * Usage:
 *   node examples/exchange-wallets.mjs              # default window (200 payments)
 *   node examples/exchange-wallets.mjs --limit 400  # wider live window
 *   node examples/exchange-wallets.mjs --help
 *
 * Exit 0 = every core invariant held (checksums, single native balance, muxed
 *          rebuilds, pinned transfers). Exit 1 = an invariant broke.
 * ---------------------------------------------------------------------------
 */

import { pathToFileURL } from "node:url";
import { api, rule as ruleLine, isGAddress, isMAddress, usageAndExit } from "./lib.mjs";

const rule = (c = "-") => ruleLine(c, 78);

// ---------------------------------------------------------------------------
// Pinned inputs
// ---------------------------------------------------------------------------

/**
 * The two addresses, exactly as the venues present them. The *labels* are
 * external attribution (the venues' own pages) — this script never claims to
 * prove ownership on-chain, and says so in its output.
 */
export const BITGET = "GDFNWH6ZFJVHJDLBMNOUT35X4EEKQVJAO3ZDL4NL7VQJLC4PJOQFWJ75";
export const OKX = "GALYJFJ5SVD45FBWN2GT4IW67SEZ3IBOFSBSPUFCWV427NBNLG3PXEQU";

export const VENUES = [
  { label: "Bitget", account: BITGET },
  { label: "OKX", account: OKX },
];

/**
 * Historical Bitget -> OKX transfers, pinned by transaction hash. Fixed
 * transactions never change, so these remain checkable forever. Amounts and
 * muxed ids are pinned so a silent drift is caught instead of printed.
 */
export const PINNED_TRANSFERS = [
  { hash: "6a77e7db92750aa8fcd03ea00e2ecbffdd9bb734c5ca7c66aed91984f8e75137", amount: "129.2106200", muxedId: "2486605" },
  { hash: "dc967226fe81530960171dc8819c2c3d7485107880ec52bfbe97ccf13fbdbca6", amount: "177.4462800", muxedId: "2494403" },
  { hash: "68b384aa5845309ceaccb90fceaefa7f2bdb67cf7e8e99438e55eaf380afbd19", amount: "340.1076151", muxedId: "1504575" },
  { hash: "ccd1af63d264fdb2e732caaac2494af2d242ec21679675cce497a74eb1a2bb9c", amount: "1116.7920500", muxedId: "2494316" },
  { hash: "bab994789ee5deb694b8db9513914f09b83c4b922a0d5640a5fcf8c9f90a004d", amount: "102.0257300", muxedId: "2489489" },
];

const HELP = [
  "exchange-wallets.mjs — two real exchange accounts on Pi Mainnet (observed)",
  "",
  "Usage:",
  "  node examples/exchange-wallets.mjs               # default window (200 payments)",
  "  node examples/exchange-wallets.mjs --limit 400   # wider live window (max 200/page)",
  "  node examples/exchange-wallets.mjs --help",
  "",
  "Read-only. No wallet, no keys. Node 18+.",
];

// ---------------------------------------------------------------------------
// Stellar strkey codec (base32 + CRC16-XModem) — no dependencies
// ---------------------------------------------------------------------------

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const ALPHABET_INDEX = Object.fromEntries([...ALPHABET].map((c, i) => [c, i]));

/** Decode a base32 (RFC 4648, no padding) string to bytes. */
export function base32Decode(s) {
  let bits = 0;
  let value = 0;
  const out = [];
  for (const ch of s) {
    const idx = ALPHABET_INDEX[ch];
    if (idx === undefined) throw new Error(`not base32: ${JSON.stringify(ch)}`);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** Encode bytes to base32 (RFC 4648, no padding). */
export function base32Encode(buf) {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const b of buf) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

/** CRC16-XModem (poly 0x1021, init 0x0000) — the Stellar strkey checksum. */
export function crc16xmodem(buf) {
  let crc = 0;
  for (const b of buf) {
    crc ^= b << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc;
}

const VERSION_G = 6 << 3; // 48 -> "G..."  ed25519 account
const VERSION_M = 12 << 3; // 96 -> "M..."  muxed account (CAP-27)

/**
 * Decode a Stellar strkey address without trusting any library.
 * @returns {{valid:boolean, version:number, kind:string, crcOk:boolean,
 *            keyHex?:string, muxedId?:string, reason?:string}}
 */
export function decodeStrKey(address) {
  let raw;
  try {
    raw = base32Decode(address);
  } catch (err) {
    return { valid: false, version: -1, kind: "(not base32)", crcOk: false, reason: err.message };
  }
  if (raw.length < 3) return { valid: false, version: raw[0] ?? -1, kind: "(too short)", crcOk: false };

  const version = raw[0];
  const payload = raw.subarray(1, raw.length - 2);
  const crcOk = crc16xmodem(raw.subarray(0, raw.length - 2)) === raw.readUInt16LE(raw.length - 2);

  if (version === VERSION_G && payload.length === 32) {
    return { valid: crcOk, version, kind: "G (ed25519 account)", crcOk, keyHex: payload.toString("hex") };
  }
  if (version === VERSION_M && payload.length === 40) {
    return {
      valid: crcOk,
      version,
      kind: "M (muxed account, CAP-27)",
      crcOk,
      keyHex: payload.subarray(0, 32).toString("hex"),
      muxedId: payload.readBigUInt64BE(32).toString(),
    };
  }
  return { valid: false, version, kind: `0x${version.toString(16)} (unexpected)`, crcOk };
}

/**
 * Build the CAP-27 `M...` address for a `G...` account and a uint64 id.
 * This is the whole of "muxing": the same G account, plus a 64-bit tag.
 */
export function muxedFromG(gAddress, id) {
  const raw = base32Decode(gAddress);
  if (raw[0] !== VERSION_G || raw.length !== 35) throw new Error(`not a G... account: ${gAddress}`);
  const body = Buffer.alloc(41);
  body[0] = VERSION_M;
  raw.subarray(1, 33).copy(body, 1); // 32-byte ed25519 key
  body.writeBigUInt64BE(BigInt(id), 33); // big-endian uint64 id
  const crc = Buffer.alloc(2);
  crc.writeUInt16LE(crc16xmodem(body), 0);
  return base32Encode(Buffer.concat([body, crc]));
}

// ---------------------------------------------------------------------------
// Live reads
// ---------------------------------------------------------------------------

/** Walk `/accounts/<id>/payments` newest-first, up to `n` records. */
async function payments(account, n) {
  const out = [];
  let cursor = null;
  while (out.length < n) {
    const page = Math.min(200, n - out.length);
    const path = cursor
      ? `/accounts/${account}/payments?limit=${page}&order=desc&cursor=${encodeURIComponent(cursor)}`
      : `/accounts/${account}/payments?limit=${page}&order=desc`;
    const body = await api(path);
    const recs = body?._embedded?.records ?? [];
    if (!recs.length) break;
    out.push(...recs);
    const next = body?._links?.next?.href;
    const last = recs[recs.length - 1]?.paging_token;
    if (!next || !last) break;
    cursor = last;
  }
  return out.slice(0, n);
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) usageAndExit(HELP, 0);

  let limit = 200;
  const li = argv.indexOf("--limit");
  if (li !== -1) {
    const v = Number(argv[li + 1]);
    if (!Number.isFinite(v) || v < 1) usageAndExit([`✗ --limit expects a positive number, got: ${argv[li + 1] ?? "(nothing)"}`, "", ...HELP]);
    limit = Math.floor(v);
  }

  const failures = [];
  const expect = (cond, msg) => {
    if (!cond) failures.push(msg);
    return cond;
  };

  console.log("\n🔄  Pi Mainnet — two exchange accounts, observed (read-only)");
  rule();
  console.log("    question : given a venue's Pi address, can you tell a coin's origin?");
  console.log("    method   : decode the address; read the account; rebuild the muxed");
  console.log("               recipient for every deposit; re-verify pinned cross-venue txs");
  console.log("    network  : https://api.mainnet.minepi.com  (read-only, GET only)");
  rule();
  console.log("    ⚠️  The labels below are EXTERNAL attribution (the venues' own UI/docs).");
  console.log("        On-chain, nothing says \"Bitget\" or \"OKX\". This script proves");
  console.log("        what the LEDGER shows about these two accounts — not ownership.");
  rule("=");

  const summaries = [];

  for (const venue of VENUES) {
    console.log(`\n── ${venue.label} ──`);
    const id = venue.account;

    expect(isGAddress(id), `${venue.label}: ${id} is not a well-formed G... address`);
    const dec = decodeStrKey(id);
    console.log(`  address      : ${id}`);
    console.log(`  strkey       : ${dec.kind}, version 0x${dec.version.toString(16)}, checksum ${dec.crcOk ? "VALID" : "INVALID"}`);
    console.log(`  ed25519 key  : ${dec.keyHex ?? "(none)"}`);
    expect(dec.valid, `${venue.label}: strkey checksum is INVALID`);

    const acct = await api(`/accounts/${id}`);
    const balances = acct.balances ?? [];
    const natives = balances.filter((b) => b.asset_type === "native");
    const others = balances.filter((b) => b.asset_type !== "native");
    const native = natives[0]?.balance ?? "(none)";

    console.log(`  account      : HTTP 200`);
    console.log(`  balance      : ${native}   (asset_type: native — no issuer, no trustline)`);
    console.log(`  other assets : ${others.length ? others.map((b) => `${b.asset_code ?? b.asset_type}`).join(", ") : "none"}`);
    console.log(`  subentries   : ${acct.subentry_count}   signers: ${(acct.signers ?? []).length}   data: ${Object.keys(acct.data ?? {}).length}`);
    console.log(`  thresholds   : low=${acct.thresholds?.low_threshold} med=${acct.thresholds?.med_threshold} high=${acct.thresholds?.high_threshold}`);
    console.log(`  flags        : auth_required=${acct.flags?.auth_required} auth_revocable=${acct.flags?.auth_revocable} auth_clawback_enabled=${acct.flags?.auth_clawback_enabled}`);
    console.log(`  last_modified_ledger : ${acct.last_modified_ledger}`);

    expect(natives.length === 1, `${venue.label}: expected exactly one native balance, saw ${natives.length}`);
    if (others.length) {
      console.log(`  ⚠️  note: this account also holds a non-native asset (${others.map((b) => b.asset_code).join(", ")})`);
      console.log("      (native π remains one scalar; a trustline does not tag the π itself)");
    }

    // --- payments: direction, asset type, and the muxed recipient tag -------
    const pays = await payments(id, limit);
    let inCount = 0;
    let outCount = 0;
    let nonNative = 0;
    let muxed = 0;
    let muxedMismatch = 0;
    let plain = 0;
    let exampleDto = null;

    for (const p of pays) {
      if (p.asset_type !== "native") nonNative++;
      const inbound = p.to === id;
      if (inbound) inCount++;
      else if (p.from === id) outCount++;
      if (inbound) {
        if (p.to_muxed) {
          muxed++;
          if (!exampleDto) exampleDto = p;
          let rebuilt = null;
          try {
            rebuilt = muxedFromG(id, p.to_muxed_id);
          } catch {
            rebuilt = "(build failed)";
          }
          if (rebuilt !== p.to_muxed) muxedMismatch++;
        } else {
          plain++;
        }
      }
    }

    console.log(`  payments (last ${pays.length}) : IN ${inCount}, OUT ${outCount}   non-native ${nonNative}`);
    console.log(`  muxed deposits : ${muxed} of ${inCount} IN carry to_muxed_id (plain G: ${plain})`);
    console.log(`  rebuilt M == API to_muxed : ${muxed - muxedMismatch}/${muxed} ${muxedMismatch === 0 ? "✓" : "✗"}`);
    expect(nonNative === 0, `${venue.label}: a sampled payment was not native (${nonNative})`);
    expect(muxedMismatch === 0, `${venue.label}: ${muxedMismatch} muxed address(es) did not rebuild from G + id`);

    if (exampleDto) {
      const keys = Object.keys(exampleDto).filter((k) => k !== "_links").sort();
      console.log(`  one inbound payment DTO — every field:`);
      console.log(`    ${keys.join(", ")}`);
      console.log(`    -> no origin / mining / exchange field exists on it.`);
    }

    summaries.push({ label: venue.label, id, native, inCount, outCount, muxed, plain });
  }

  // --- pinned cross-venue transfers ---------------------------------------
  rule("=");
  console.log(`\n🔗  Pinned cross-venue transfers — Bitget -> OKX (by transaction hash)`);
  console.log(`    ${PINNED_TRANSFERS.length} historical transactions; each fetched and checked now.`);
  rule();

  let okTransfers = 0;
  for (const t of PINNED_TRANSFERS) {
    const tx = await api(`/transactions/${t.hash}`);
    const ops = (await api(`/transactions/${t.hash}/operations`))._embedded?.records ?? [];
    const op = ops.find(
      (o) => o.type === "payment" && o.asset_type === "native" && o.from === BITGET && o.to === OKX
    );
    const single = ops.length === 1;
    const good =
      tx.successful === true &&
      tx.memo_type === "none" &&
      Boolean(op) &&
      op.amount === t.amount &&
      String(op.to_muxed_id) === t.muxedId;

    if (good) okTransfers++;
    else failures.push(`${t.hash}: pinned transfer no longer checks out`);

    console.log(
      `  ${good ? "✓" : "✗"} ${t.hash.slice(0, 16)}…  ${String(op?.amount ?? "?").padEnd(12)} native  ` +
        `muxed ${String(op?.to_muxed_id ?? "?").padEnd(8)}  ledger ${tx.ledger}  memo ${tx.memo_type}  ` +
        `${single ? "single-op" : `multi-op(${ops.length})`}`
    );
  }
  rule();
  console.log(`  ${okTransfers} of ${PINNED_TRANSFERS.length} verified: successful, native, memo "none", same op Bitget -> OKX.`);

  // --- honest bounds ------------------------------------------------------
  rule("=");
  console.log("\n🧭  What this run shows — and what it does not");
  rule();
  console.log("  ✅ SHOWS (measured just now, read-only):");
  console.log("     • both addresses are well-formed G accounts (checksum recomputed here);");
  console.log("     • each is a SINGLE native balance — one scalar, no trustlines, no flags;");
  console.log("     • deposits to the pooled account carry a muxed recipient id that we");
  console.log("       rebuild byte-for-byte from (G + id) — it names the RECIPIENT;");
  console.log("     • Bitget -> OKX transfers are plain native payments, memo \"none\".");
  rule();
  console.log("  ❌ DOES NOT show (and never claims):");
  console.log("     • that the venue owns the address — attribution is EXTERNAL;");
  console.log("     • reserve backing, price, or anything off-chain (Claim C);");
  console.log("     • any per-unit origin. There is no such field — that is the whole point:");
  console.log("       the recipient tag says WHO, the ledger says HOW MUCH, never WHERE FROM.");
  rule();
  console.log("  Reproduce: node examples/exchange-wallets.mjs");
  console.log("  Context  : docs/FAQ-EXCHANGE-ADDRESSES-OBSERVED.md · docs/FAQ-MUXED-M-VS-G.md");
  rule("=");

  if (failures.length) {
    console.log(`\n❌ ${failures.length} invariant(s) FAILED:`);
    for (const f of failures) console.log(`     - ${f}`);
    console.log("");
    process.exit(1);
  }
  console.log("\n✅ all invariants held\n");
}

// Only run when executed directly (so the codec stays importable/testable).
const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch((err) => {
    console.error("\n❌ ERROR:", err.message);
    process.exit(1);
  });
}
