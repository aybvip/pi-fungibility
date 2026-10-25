/**
 * Cloudflare Pages / Netlify mirror build.
 *
 * GitHub Pages runs Jekyll server-side from the repo root. The mirrors need a
 * prebuilt directory, so this script reproduces the same output shape without
 * requiring Ruby:
 *
 *   .md            -> .html   (GitHub-flavoured Markdown, tables + code fences)
 *   [x](foo.md)    -> [x](foo.html)   (jekyll-relative-links behaviour)
 *   first H1       -> <title>          (jekyll-titles-from-headings behaviour)
 *   static assets  -> copied verbatim
 *
 * Mirror overrides (_config.mirror.yml): links are root-relative and the
 * canonical URL still points at the GitHub Pages copy, so the mirror adds no
 * SEO surface.
 *
 * Usage: node scripts/build-site.mjs   (or: npm run build:site)
 */
import { readFile, writeFile, mkdir, rm, readdir, copyFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "_site");
const CANONICAL = "https://aybvip.github.io/pi-fungibility";

/* Directories that are repo machinery, not site content. */
const SKIP_DIRS = new Set([
  ".git", ".github", "node_modules", "_site", "_layouts", "scripts", "docs/.obsidian",
]);

/* Files that must not be published. */
const SKIP_FILES = new Set([
  "Gemfile", "Gemfile.lock", "netlify.toml", "package.json", "package-lock.json",
  ".gitignore", "_config.yml", "_config.mirror.yml",
]);

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function stripFrontMatter(src) {
  if (!src.startsWith("---")) return { body: src, data: {} };
  const end = src.indexOf("\n---", 3);
  if (end === -1) return { body: src, data: {} };
  const raw = src.slice(3, end).trim();
  const data = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (m) data[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return { body: src.slice(src.indexOf("\n", end + 1) + 1), data };
}

/** Copy .md links to .html, matching jekyll-relative-links. */
function rewriteMdLinks(html) {
  return html
    .replace(/(href=")([^"#?]+?)\.md(\?[^"]*)?(#[^"]*)?"/g, (m, a, p, q, h) => `${a}${p}.html${q || ""}${h || ""}"`)
    .replace(/href="\/pi-fungibility\//g, 'href="/');
}

function titleFrom(body, fallback) {
  const m = body.match(/^#\s+(.+)$/m);
  if (m) return m[1].replace(/[*_`]/g, "").trim();
  return fallback;
}

function layout({ title, description, body, canonical }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary">
<style>
  :root { --fg:#1f2328; --muted:#57606a; --line:#d0d7de; --bg:#ffffff; --code:#f6f8fa; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--fg);
         font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif; }
  main { max-width:820px; margin:0 auto; padding:40px 20px 80px; }
  h1 { font-size:1.9rem; line-height:1.25; }
  h2 { margin-top:2.2rem; border-bottom:1px solid var(--line); padding-bottom:.3rem; }
  code, pre { font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:.9em; }
  pre { background:var(--code); padding:14px; border-radius:6px; overflow:auto; }
  code { background:var(--code); padding:.15em .35em; border-radius:4px; }
  pre code { background:none; padding:0; }
  table { border-collapse:collapse; width:100%; margin:1rem 0; display:block; overflow-x:auto; }
  th,td { border:1px solid var(--line); padding:8px 10px; text-align:left; vertical-align:top; }
  blockquote { margin:1rem 0; padding:.4rem 1rem; border-left:4px solid var(--line); color:var(--muted); }
  a { color:#0969da; }
  img { max-width:100%; }
  footer { margin-top:3rem; border-top:1px solid var(--line); padding-top:1rem; color:var(--muted); font-size:.9rem; }
  .site-nav { display:flex; gap:16px; flex-wrap:wrap; padding-bottom:1rem; border-bottom:1px solid var(--line);
              margin-bottom:2rem; font-size:.9rem; }
</style>
</head>
<body><main>
<nav class="site-nav">
  <a href="/">Home</a>
  <a href="/README.html">README</a>
  <a href="/PROOF.html">PROOF</a>
  <a href="/docs/INDEX.html">Index</a>
  <a href="/docs/SOURCES.html">Sources</a>
  <a href="/llms.txt">llms.txt</a>
</nav>
${body}
<footer>
<p>Independent &amp; unofficial — not affiliated with Pi Network. <strong>Not independently audited</strong>
(self-verified and reproducible). License: MIT. Canonical copy:
<a href="${CANONICAL}/">aybvip.github.io/pi-fungibility</a>.</p>
</footer>
</main></body></html>`;
}

marked.setOptions({ gfm: true, breaks: false, mangle: false, headerIds: true });

async function walk(dir, rel = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const relPath = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (e.name.startsWith(".")) continue;
      if (SKIP_DIRS.has(relPath) || SKIP_DIRS.has(e.name)) continue;
      files.push(...(await walk(path.join(dir, e.name), relPath)));
    } else {
      if (SKIP_FILES.has(relPath) || SKIP_FILES.has(e.name)) continue;
      if (e.name.startsWith(".")) continue;
      files.push(relPath);
    }
  }
  return files;
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const files = await walk(ROOT);
  const pages = [];

  for (const rel of files) {
    const src = path.join(ROOT, rel);
    const dest = path.join(OUT, rel);
    await mkdir(path.dirname(dest), { recursive: true });

    if (rel.endsWith(".md")) {
      const raw = await readFile(src, "utf8");
      const { body, data } = stripFrontMatter(raw);
      const html = rewriteMdLinks(marked.parse(body));
      const slug = rel.replace(/\.md$/, ".html");
      const title = data.title || titleFrom(body, path.basename(rel, ".md"));
      const description =
        data.description ||
        (raw.replace(/\s+/g, " ").match(/^#[^#].{0,200}/) || ["π = π — Pi fungibility proof"])[0].slice(0, 180);
      const canonical = `${CANONICAL}/${slug}`;
      const out = layout({ title, description, body: html, canonical });
      await writeFile(path.join(OUT, slug), out, "utf8");
      pages.push({ slug, title });
      continue;
    }

    if (rel === "index.html") {
      const raw = await readFile(src, "utf8");
      await writeFile(dest, rewriteMdLinks(raw), "utf8");
      pages.push({ slug: "", title: "π = π — Pi fungibility proof" });
      continue;
    }

    await copyFile(src, dest);
  }

  /* jekyll-sitemap equivalent (mirror: canonical host is the indexed copy). */
  const urls = pages
    .map((p) => `  <url><loc>${CANONICAL}/${p.slug}</loc></url>`)
    .join("\n");
  await writeFile(
    path.join(OUT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    "utf8",
  );

  /* Cloudflare Pages: security headers + stale-endpoint redirects
     (mirrors netlify.toml so both mirrors behave the same). */
  await writeFile(
    path.join(OUT, "_headers"),
    `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`,
    "utf8",
  );
  await writeFile(path.join(OUT, "_redirects"), "/payment/* /404.html 404\n", "utf8");

  console.log(`Built ${pages.length} HTML pages + ${files.length - pages.length} static files into _site/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
