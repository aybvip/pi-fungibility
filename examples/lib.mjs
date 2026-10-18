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

/** Default per-request timeout (ms). A hung socket can never hang the CLI. */
export const DEFAULT_TIMEOUT_MS = 15000;

/**
 * GET a JSON endpoint on the public Pi Mainnet API and surface *useful* errors:
 * network failure, timeout, HTTP status, an unreadable body, and invalid JSON.
 * Every failure path throws a plain `Error` with a human-readable message, so a
 * caller never sees an opaque `undefined` or an unhandled rejection.
 *
 * The `opts` bag exists so the failure paths can be unit-tested **offline**:
 * pass `{ fetch }` to inject a fake transport, and/or `{ base, timeoutMs }`.
 * Real callers use the defaults (built-in fetch -> api.mainnet.minepi.com).
 * `timeoutMs: 0` disables the timeout.
 *
 * @param {string} path                       e.g. "/transactions/<hash>"
 * @param {{fetch?:Function, base?:string, timeoutMs?:number}} [opts]
 */
export async function api(path, opts = {}) {
  const base = opts.base ?? BASE;
  const url = base + path;
  const fetchImpl = opts.fetch ?? fetch;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = typeof AbortController === "function" ? new AbortController() : null;
  let timer = null;
  if (controller && timeoutMs > 0) {
    // NB: deliberately NOT unref()'d. The timer must keep the loop alive long
    // enough to fire, otherwise a hung request would let the process exit
    // before the timeout is reported. It is always cleared in the `finally`.
    timer = setTimeout(() => controller.abort(), timeoutMs);
  }

  let res;
  try {
    res = await fetchImpl(url, {
      headers: { Accept: "application/json" },
      ...(controller ? { signal: controller.signal } : {}),
    });
  } catch (err) {
    const aborted =
      (err && err.name === "AbortError") || /abort/i.test(String((err && err.message) || ""));
    throw new Error(
      aborted
        ? `timeout after ${timeoutMs}ms -> ${url}\n      no response from the API`
        : `network error -> ${url}\n      ${err && err.message ? err.message : err}`
    );
  } finally {
    if (timer) clearTimeout(timer);
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

  try {
    return await res.json();
  } catch (err) {
    throw new Error(
      `invalid JSON -> ${path}\n      the response body could not be parsed as JSON (${err && err.message ? err.message : err})`
    );
  }
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
