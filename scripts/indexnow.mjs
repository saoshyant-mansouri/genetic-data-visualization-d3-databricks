#!/usr/bin/env node
/**
 * Submit a site's URLs to IndexNow (https://www.indexnow.org/documentation).
 *
 * The shared endpoint forwards to every participating engine — Bing, Yandex,
 * Seznam, Naver, Yep. Google does NOT use IndexNow.
 *
 * Env:
 *   SITE_URL       canonical origin, e.g. https://www.mhdmansouri.com
 *   INDEXNOW_KEY   the key; https://<host>/<key>.txt must serve it
 *   INDEXNOW_URLS  optional comma-separated URL list (default: <loc>s of /sitemap.xml, else the home page)
 *
 * Exit codes: 0 on 200/202 (and on 429, which only means "try later");
 * 1 on configuration problems (key file missing, 400/403/422).
 */
const ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS = 10_000;

const site = (process.env.SITE_URL ?? "").replace(/\/+$/, "");
const key = process.env.INDEXNOW_KEY ?? "";

if (!site || !/^[a-zA-Z0-9-]{8,128}$/.test(key)) {
  console.error("SITE_URL and a valid INDEXNOW_KEY (8–128 chars: a-z, A-Z, 0-9, -) are required.");
  process.exit(1);
}

const host = new URL(site).host;
const keyLocation = `${site}/${key}.txt`;

async function collectUrls() {
  if (process.env.INDEXNOW_URLS) {
    return process.env.INDEXNOW_URLS.split(",").map((u) => u.trim()).filter(Boolean);
  }
  try {
    const res = await fetch(`${site}/sitemap.xml`, { redirect: "follow" });
    if (res.ok) {
      const xml = await res.text();
      const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
      if (locs.length) return locs;
    }
  } catch {
    // fall through to the home page
  }
  return [`${site}/`];
}

// Ownership is proved by the key file on the same host — check it's deployed before submitting.
const keyRes = await fetch(keyLocation, { redirect: "manual" });
const keyBody = keyRes.ok ? (await keyRes.text()).trim() : "";
if (keyBody !== key) {
  console.error(`Key file not served correctly at ${keyLocation} (HTTP ${keyRes.status}).`);
  process.exit(1);
}

const urlList = [...new Set(await collectUrls())].filter((u) => new URL(u).host === host).slice(0, MAX_URLS);
if (!urlList.length) {
  console.log(`No URLs for ${host}; nothing to submit.`);
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});

const meaning = {
  200: "accepted",
  202: "received, key validation pending",
  400: "bad request",
  403: "key not valid for this host",
  422: "URLs don't belong to the host or key mismatch",
  429: "rate limited — try later",
};
console.log(`IndexNow ${res.status} (${meaning[res.status] ?? "unexpected"}) — ${urlList.length} URL(s) for ${host}:`);
urlList.forEach((u) => console.log(`  ${u}`));

process.exit([200, 202, 429].includes(res.status) ? 0 : 1);
