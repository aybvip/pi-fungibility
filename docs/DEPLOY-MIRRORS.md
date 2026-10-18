# Deploying mirrors

**Canonical host: `https://aybvip.github.io/pi-fungibility/`** — this is the copy
that search engines are told to index, and the URL cited everywhere (README,
`llms.txt`, GitHub profile, `CITATION.cff`, sitemap, IndexNow).

Netlify and Cloudflare Pages serve **mirrors**: pure redundancy for reach and
resilience. They carry canonical tags pointing back at GitHub Pages, so they add
no duplicate-content surface and cannot split search ranking.

---

## Why a mirror config is needed at all

`_config.yml` targets a GitHub Pages **project** site:

```yaml
url:     https://aybvip.github.io
baseurl: /pi-fungibility
```

Every generated link therefore begins with `/pi-fungibility/…`. That is correct
on GitHub Pages, but the mirrors are served from the **root** of their own
hostname — those links would all 404.

### Why `--baseurl ""` alone is not enough

`jekyll-seo-tag` builds the canonical URL as `site.url + site.baseurl + page.url`.
Emptying `baseurl` while leaving `url` alone would emit
`https://aybvip.github.io/docs/…` — a page that does not exist.

`_config.mirror.yml` therefore **moves the subpath into `url`** and empties
`baseurl`:

```yaml
url:     https://aybvip.github.io/pi-fungibility   # subpath relocated here
baseurl: ""                                        # links become root-relative
```

which simultaneously yields:

| Output | Result |
|---|---|
| `rel="canonical"` / `og:url` / `sitemap.xml` | `https://aybvip.github.io/pi-fungibility/docs/…` ✅ correct |
| internal + asset links | `/docs/…`, `/assets/…` ✅ work at mirror root |

Build command for every mirror:

```bash
bundle install
bundle exec jekyll build --config _config.yml,_config.mirror.yml
```

`Gemfile` pins the `github-pages` gem, so the mirror build uses the **same plugin
set GitHub Pages does** and stays byte-compatible with the canonical output.

---

## Verified properties of the mirror build

Checked in CI / locally before adding a host (`31 HTML pages`):

- ✅ **29/29** Jekyll-rendered pages emit `rel="canonical"` → GitHub Pages **with**
  the `/pi-fungibility` subpath
- ✅ **0** internal or asset links carry the `/pi-fungibility/` prefix
- ✅ all **30** `sitemap.xml` URLs target the canonical host — never the mirror
- ✅ `assets/css/style.css` reachable at `/assets/…`
- ✅ `404.html` built, and **excluded** from the sitemap
- ✅ `index.html` uses **relative** links, so it resolves on any host
- ✅ `llms.txt`, `robots.txt`, the IndexNow key and the Bing/Google verification files are all served

> **IndexNow: pass `keyLocation`.** The key file lives *in this repository*, so it is served under the
> subpath — `https://aybvip.github.io/pi-fungibility/<key>.txt` — **not** at the host root
> (`https://aybvip.github.io/<key>.txt`, which 404s). Submissions must therefore send the `keyLocation`
> parameter; without it the API replies `202 Accepted`, then rejects the site asynchronously with
> `403 UserForbiddedToAccessSite`.

The two pages with no canonical are deliberate:
`examples/app-payment-flow/frontend.html` (a code sample) and
`google03c2168aa2e4f288.html` (search-engine verification — must stay verbatim).

---

## Netlify

`netlify.toml` in the repo root already sets the build command, publish directory
and headers. In **Site settings → Build & deploy**:

| Field | Value |
|---|---|
| Base directory | *(blank — repo root)* |
| Build command | `bundle install && bundle exec jekyll build --config _config.yml,_config.mirror.yml` |
| Publish directory | `_site` |
| Repository | `aybvip/pi-fungibility` |

> ⚠️ **Do not point a site at `aybvip/aybvip`.** That profile repository holds
> only `README.md`; its payment app was archived to the `archive/payment-app`
> branch (tag `payment-app/v1`). A site still linked there will fail to build.

## Cloudflare Pages

Create a Pages project connected to `aybvip/pi-fungibility`:

| Setting | Value |
|---|---|
| Framework preset | Jekyll |
| Build command | `bundle install && bundle exec jekyll build --config _config.yml,_config.mirror.yml` |
| Build output directory | `_site` |
| Root directory | `/` |

> `bundle install` takes a few minutes the first time — the `github-pages` gem
> is large. Build timeout is the only realistic failure mode.

---

## Adding a new mirror

1. Run the build locally with `--config _config.yml,_config.mirror.yml`.
2. Confirm canonicals, links and sitemap all still target GitHub Pages.
3. Point the host at the repo with that build command.
4. **Do not** submit the mirror to IndexNow or add it to `sitemap.xml` — the
   canonical host is the only one that should be indexed.

Nothing on the canonical host changes when a mirror is added or removed.
