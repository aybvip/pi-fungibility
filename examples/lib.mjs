#!/usr/bin/env node
/**
 * lib.mjs
 * ---------------------------------------------------------------------------
 * Small shared helpers for the example scripts. Nothing here talks to a
 * wallet, holds keys, or writes anything — it is a read-only HTTP client plus
 * input validation, so the CLIs fail loudly and helpfully instead of throwing
 * opaque `undefined` errors.
 *
 * Zero dependencies (Node 18+ built-in fetch).
 * ---------------------------------------------------------------------------
 */

export const BASE = "https://api.mainnet.minepi.com";

/**
 * GET a JSON endpoint on the public Pi Mainnet API and surface *useful* errors:
 * network failures, HTTP status, and a short snippet of the response body.
 */
export async function api(path) {
  let res;
  try {
    res = await fetch(BASE + path, { headers: { Accept: "application/json" } });
  } catch (err) {
    throw new Error(
      `network error -> ${BASE}${path}\n      ${err && err.message ? err.message : err}`
    );
  }
  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {
      /* body not readable — ignore */
    }
    const snippet = body ? `\n      ${String(body).replace(/\s+/g, " ").trim().slice(0, 300)}` : "";
    throw new Error(`${res.status} ${res.statusText} -> ${path}${snippet}`);
  }
  return res.json();
}

/** A horizontal rule of `n` copies of `c` (default 74). */
export const rule = (c = "-", n = 74) => console.log(c.repeat(n));

// ---------------------------------------------------------------------------
// Input validation (Stellar strkey shapes)
// ---------------------------------------------------------------------------
const isStr = (s) => typeof s === "string";

/** 64-char hex transaction hash. */
export const isTxHash = (s) => isStr(s) && /^[0-9a-fA-F]{64}$/.test(s);

/** `G...` account id (public key): 1 + 55 base32 chars. */
export const isGAddress = (s) => isStr(s) && /^G[A-Z2-7]{55}$/.test(s);

/** `M...` muxed account id: 1 + 68 base32 chars (CAP-27). */
export const isMAddress = (s) => isStr(s) && /^M[A-Z2-7]{68}$/.test(s);

/** Either a `G...` account or an `M...` muxed account. */
export const isAddress = (s) => isGAddress(s) || isMAddress(s);

/**
 * Print a message plus usage lines to stderr and exit with a non-zero code.
 * Keeps every CLI honest about *why* it refused to run.
 */
export function usageAndExit(lines, code = 2) {
  for (const line of lines) console.error(line);
  console.error("");
  process.exit(code);
}
