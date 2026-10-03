# Teen Patti Pro – APK landing page + blog

A fast, SEO-focused static site (no dependencies) to promote the Teen Patti Pro Android APK.
Structure follows an app-download page: hero with download CTA, app information/specs table,
games, screenshots, features, install steps, hand rankings, pros & cons, FAQ, blog, related topics.

## Build
```bash
cd teenpattipro-site
node build.mjs        # writes the deployable site to ./dist
npx serve dist        # preview locally
```

## Before going live (edit `site.config.mjs`)
- `siteUrl` – your real domain (canonical URLs, sitemap, Open Graph and schema use it).
- `downloadUrl` – where every Download button points. Either an absolute URL, or put the APK at
  `src/static/download/teen-patti-pro.apk` (anything in `src/static/` is copied to the site root).
- `app.version`, `app.size`, `app.minAndroid`, `app.developer` – rows stay hidden while empty.
- `rating` – only add a genuine public rating. Fabricated ratings break Google's guidelines.
- `contactEmail`.

## Writing blog posts
Add `src/posts/my-post-slug.html`:
```
---
title: Post title (also the H1)
seoTitle: Optional <title> override
description: 140–160 character meta description
date: 2026-10-10
updated: 2026-10-12
category: Guides
cover: dragon-vs-tiger-640.webp
keywords: comma, separated
---
<p>Intro…</p>
<h2>First section</h2>
…
<details class="faq"><summary>Question?</summary><p>Answer.</p></details>
```
Run `node build.mjs`. The generator automatically adds: table of contents from `<h2>`s, a download
box after the second section and at the end, reading time, related posts, BlogPosting schema,
FAQPage schema (from `<details class="faq">`), breadcrumbs, the blog index with pagination,
`sitemap.xml` and `rss.xml`. Add `draft: true` to hide a post.

## SEO built in
- One H1 per page, keyword-led titles (≤ 70 chars) and descriptions (≤ 160 chars).
- Canonical, hreflang (en-IN), robots meta, Open Graph and Twitter cards, 1200×630 share image.
- JSON-LD: Organization, WebSite, WebPage, MobileApplication, BreadcrumbList, FAQPage, Blog, BlogPosting.
- `sitemap.xml`, `robots.txt`, `rss.xml`, web manifest, 404 page.
- WebP images with explicit sizes, lazy loading below the fold, hero image preload, no JS dependency.
- `download_click` event pushed to `gtag`/`dataLayer` if you add Google Analytics or GTM.

After deploying: submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools, and publish
new guides regularly (rules, tips, updates) to grow organic traffic.

## Deploy
- **Vercel**: new project, Root Directory = `teenpattipro-site` (uses `vercel.json`).
- **Netlify**: base `teenpattipro-site`, build `node build.mjs`, publish `dist`.
- **cPanel / any host**: upload the contents of `dist/`.

## Compliance
Pages carry 18+ and responsible-gaming notices and a jurisdiction warning. Laws on online money
games differ by country and Indian state, and some prohibit both offering and advertising them.
Confirm the site and app are lawful in your target markets before publishing or running ads.
