// Zero-dependency static site generator for the Teen Patti Pro landing page and blog.
// Usage: node build.mjs   ->   writes the deployable site to ./dist
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "./site.config.mjs";
import { renderHome, homeFaqs } from "./src/home.mjs";
import { esc, fmtDate, icons, downloadButton, postCard } from "./src/lib/ui.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const SITE = config.siteUrl.replace(/\/$/, "");

// ---------- helpers ----------
const abs = (p) => SITE + p;
const write = (rel, content) => {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
};
const slugify = (s) =>
  s.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");


// Front matter: lines of `key: value` between two `---` lines at the top of the file.
function parseFrontMatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2] };
}

// ---------- shared UI ----------
const navLinks = [
  ["/#games", "Games"],
  ["/#install", "How to Install"],
  ["/#hand-rankings", "Rules"],
  ["/#faq", "FAQ"],
  ["/blog/", "Blog"],
];

function header() {
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header" id="top">
  <div class="container site-header__inner">
    <a class="brand" href="/" aria-label="${esc(config.siteName)} home">
      <picture><source srcset="/assets/img/teen-patti-pro-logo.webp" type="image/webp"><img src="/assets/img/teen-patti-pro-logo.png" alt="${esc(config.siteName)} logo" width="136" height="61"></picture>
    </a>
    <nav class="main-nav" id="main-nav" aria-label="Main">
      <ul>${navLinks.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join("")}</ul>
    </nav>
    <a class="btn-pill" href="${esc(config.downloadUrl)}" data-download rel="nofollow" download="${esc(config.apkFileName)}">${icons.download}<span>Get APK</span></a>
    <button class="nav-toggle" aria-controls="main-nav" aria-expanded="false" aria-label="Open menu">${icons.menu}</button>
  </div>
</header>`;
}

function footer() {
  const year = new Date().getUTCFullYear();
  return `<section class="rg-strip" aria-label="Responsible gaming notice">
  <div class="container rg-strip__inner">
    <span class="badge-18">18+</span>
    <p><strong>Play responsibly.</strong> This game involves an element of financial risk and may be addictive. Please play responsibly and at your own risk. Online money games are restricted or prohibited in some states and countries &mdash; check the law where you live before you download. <a href="/responsible-gaming/">Responsible gaming &rarr;</a></p>
  </div>
</section>
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <picture><source srcset="/assets/img/teen-patti-pro-logo.webp" type="image/webp"><img src="/assets/img/teen-patti-pro-logo.png" alt="${esc(config.siteName)}" width="150" height="67" loading="lazy"></picture>
      <p>Your guide to downloading and installing the ${esc(config.appName)} APK on Android, plus easy rules and tips for Teen Patti, Dragon vs Tiger, Andar Bahar and more.</p>
    </div>
    <div>
      <h2 class="footer-title">App</h2>
      <ul>
        <li><a href="/#download">Download APK</a></li>
        <li><a href="/#games">Games</a></li>
        <li><a href="/#install">How to install</a></li>
        <li><a href="/#faq">FAQ</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">Guides</h2>
      <ul>
        <li><a href="/blog/teen-patti-rules/">Teen Patti rules</a></li>
        <li><a href="/blog/teen-patti-hand-rankings/">Hand rankings</a></li>
        <li><a href="/blog/dragon-vs-tiger-rules/">Dragon vs Tiger</a></li>
        <li><a href="/blog/andar-bahar-rules/">Andar Bahar</a></li>
        <li><a href="/blog/">All articles</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">Legal</h2>
      <ul>
        <li><a href="/responsible-gaming/">Responsible gaming</a></li>
        <li><a href="/privacy-policy/">Privacy policy</a></li>
        <li><a href="/disclaimer/">Disclaimer</a></li>
        <li><a href="/about/">About us</a></li>
        <li><a href="/contact/">Contact</a></li>
      </ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <p>&copy; ${year} ${esc(config.siteName)}. All rights reserved. Laws concerning online games vary from country to country and state to state. We do not encourage or condone the use of this app where it violates local law.</p>
  </div>
</footer>
<div class="sticky-cta" id="sticky-cta">
  <picture><source srcset="/assets/img/icon-192.png"><img src="/assets/img/icon-192.png" alt="" width="40" height="40" loading="lazy"></picture>
  <div class="sticky-cta__text"><strong>${esc(config.appName)}</strong><small>Free · Android APK</small></div>
  <a class="btn-mini" href="${esc(config.downloadUrl)}" data-download rel="nofollow" download="${esc(config.apkFileName)}">${icons.download} Download</a>
</div>`;
}

function breadcrumbs(items) {
  // items: [[label, path]], last one is current page
  const html = `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items
    .map(([label, p], i) =>
      i === items.length - 1 ? `<li aria-current="page">${esc(label)}</li>` : `<li><a href="${p}">${esc(label)}</a></li>`
    )
    .join("")}</ol></nav>`;
  const schema = {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([label, p], i) => ({ "@type": "ListItem", position: i + 1, name: label, item: abs(p) })),
  };
  return { html, schema };
}

const orgSchema = {
  "@type": "Organization",
  "@id": SITE + "/#organization",
  name: config.siteName,
  url: SITE + "/",
  logo: { "@type": "ImageObject", url: abs("/assets/img/icon-512.png"), width: 512, height: 512 },
};
const websiteSchema = {
  "@type": "WebSite",
  "@id": SITE + "/#website",
  url: SITE + "/",
  name: config.siteName,
  inLanguage: config.language,
  publisher: { "@id": SITE + "/#organization" },
};

function layout({ title, description, pathName, body, schema = [], ogType = "website", image = "/assets/img/og-image.jpg", extraHead = "", noindex = false, preloadImage = "" }) {
  const canonical = abs(pathName);
  const graph = { "@context": "https://schema.org", "@graph": [orgSchema, websiteSchema, ...schema] };
  return `<!doctype html>
<html lang="${config.language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}">
<link rel="alternate" hreflang="${config.language}" href="${canonical}">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta name="theme-color" content="#1a0630">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(config.siteName)}">
<meta property="og:locale" content="${config.locale}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${abs(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
${config.twitterHandle ? `<meta name="twitter:site" content="${esc(config.twitterHandle)}">` : ""}
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${abs(image)}">
<link rel="icon" href="/assets/img/favicon-48.png" sizes="48x48" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="alternate" type="application/rss+xml" title="${esc(config.siteName)} Blog" href="/rss.xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap">
${preloadImage ? `<link rel="preload" as="image" href="${preloadImage}" fetchpriority="high">` : ""}
<link rel="stylesheet" href="/assets/css/style.css">
${extraHead}
<script type="application/ld+json">${JSON.stringify(graph)}</script>
</head>
<body>
${header()}
<main id="main">
${body}
</main>
${footer()}
<script src="/assets/js/main.js" defer></script>
</body>
</html>
`;
}

// ---------- blog ----------
function loadCollection(dir) {
  const full = path.join(SRC, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".html"))
    .map((f) => {
      const { meta, body } = parseFrontMatter(fs.readFileSync(path.join(full, f), "utf8"));
      const slug = meta.slug || f.replace(/\.html$/, "");
      const words = body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
      return { ...meta, slug, body, words, readMinutes: Math.max(1, Math.round(words / 220)) };
    })
    .filter((p) => p.draft !== "true");
}

// Adds ids to <h2> tags and returns a table of contents.
function withToc(body) {
  const toc = [];
  const html = body.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner) => {
    const id = slugify(inner);
    toc.push({ id, text: inner.replace(/<[^>]+>/g, "") });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html, toc };
}

// Collects <details class="faq"> blocks inside a post so they also become FAQPage schema.
function extractFaqs(body) {
  const faqs = [];
  const re = /<details class="faq">\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g;
  let m;
  while ((m = re.exec(body))) faqs.push({ q: m[1].replace(/<[^>]+>/g, "").trim(), a: m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() });
  return faqs;
}

const faqSchema = (faqs) => ({
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

function inlineCta() {
  return `<aside class="inline-cta">
  <img src="/assets/img/icon-192.png" alt="" width="64" height="64" loading="lazy">
  <div><strong>Ready to play ${esc(config.appName)}?</strong><p>Get the latest Android APK &mdash; free to install, takes under a minute.</p></div>
  ${downloadButton({ label: "Download APK", sub: "Free" , size: "btn-download--sm"})}
</aside>`;
}

function renderPost(post, all) {
  const { html, toc } = withToc(post.body);
  // Place a download box after the second section so readers see it early.
  let n = 0;
  const bodyWithCta = html.replace(/<h2 id=/g, (m) => (++n === 2 ? inlineCta() + "\n" + m : m));
  const crumbs = breadcrumbs([["Home", "/"], ["Blog", "/blog/"], [post.title, `/blog/${post.slug}/`]]);
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 3);
  const faqs = extractFaqs(post.body);
  const image = post.ogImage || "/assets/img/og-image.jpg";
  const article = {
    "@type": "BlogPosting",
    "@id": abs(`/blog/${post.slug}/`) + "#article",
    headline: post.title,
    description: post.description,
    image: [abs(image), abs("/assets/img/" + (post.cover || "teen-patti-pro-lobby-640.webp"))],
    datePublished: post.date,
    dateModified: post.updated || post.date,
    inLanguage: config.language,
    wordCount: post.words,
    keywords: post.keywords || "",
    articleSection: post.category || "Guide",
    author: { "@type": "Organization", name: (post.author || config.siteName + " Editorial Team"), url: SITE + "/about/" },
    publisher: { "@id": SITE + "/#organization" },
    mainEntityOfPage: abs(`/blog/${post.slug}/`),
  };
  const body = `
<div class="container">${crumbs.html}</div>
<article class="container article">
  <header class="article__header">
    <span class="chip">${esc(post.category || "Guide")}</span>
    <h1>${esc(post.title)}</h1>
    <p class="article__lede">${esc(post.description)}</p>
    <div class="post-meta">
      <span>By ${esc(post.author || config.siteName + " Editorial Team")}</span>
      <span>Updated <time datetime="${post.updated || post.date}">${fmtDate(post.updated || post.date)}</time></span>
      <span>${icons.clock} ${post.readMinutes} min read</span>
    </div>
  </header>
  <figure class="article__cover">
    <img src="/assets/img/${(post.cover || "teen-patti-pro-lobby-640.webp").replace("-640", "")}" alt="${esc(post.coverAlt || post.title)}" width="1200" height="540" fetchpriority="high">
  </figure>
  <div class="article__layout">
    ${toc.length > 2 ? `<nav class="toc" aria-label="Table of contents"><p class="toc__title">In this guide</p><ol>${toc.map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join("")}</ol></nav>` : ""}
    <div class="prose">
      ${bodyWithCta}
      ${inlineCta()}
    </div>
  </div>
</article>
<section class="section section--tight">
  <div class="container">
    <h2 class="section-title">Keep reading</h2>
    <div class="post-grid">${related.map(postCard).join("")}</div>
  </div>
</section>`;
  return layout({
    title: post.seoTitle || `${post.title} | ${config.siteName}`,
    description: post.description,
    pathName: `/blog/${post.slug}/`,
    ogType: "article",
    image,
    body,
    schema: [crumbs.schema, article, ...(faqs.length ? [faqSchema(faqs)] : [])],
    extraHead: `<meta property="article:published_time" content="${post.date}"><meta property="article:modified_time" content="${post.updated || post.date}">`,
  });
}

function renderBlogIndex(posts, page, pages) {
  const pathName = page === 1 ? "/blog/" : `/blog/page/${page}/`;
  const crumbs = breadcrumbs(page === 1 ? [["Home", "/"], ["Blog", "/blog/"]] : [["Home", "/"], ["Blog", "/blog/"], [`Page ${page}`, pathName]]);
  const pager =
    pages > 1
      ? `<nav class="pager" aria-label="Blog pages">${Array.from({ length: pages }, (_, i) => i + 1)
          .map((n) => (n === page ? `<span aria-current="page">${n}</span>` : `<a href="${n === 1 ? "/blog/" : `/blog/page/${n}/`}">${n}</a>`))
          .join("")}</nav>`
      : "";
  const [featured, ...rest] = posts;
  const body = `
<section class="page-hero">
  <div class="container">
    ${crumbs.html}
    <h1>Teen Patti Pro Blog: Rules, Tips &amp; Guides</h1>
    <p>Plain-English guides to Teen Patti, Dragon vs Tiger, Andar Bahar and the other games inside the ${esc(config.appName)} app &mdash; plus safe APK installation help.</p>
  </div>
</section>
<section class="section section--tight">
  <div class="container">
    ${page === 1 && featured ? `<div class="featured-post">${postCard(featured)}</div>` : ""}
    <div class="post-grid">${(page === 1 ? rest : posts).map(postCard).join("")}</div>
    ${pager}
  </div>
</section>`;
  const list = {
    "@type": "Blog",
    "@id": abs("/blog/") + "#blog",
    name: `${config.siteName} Blog`,
    url: abs("/blog/"),
    publisher: { "@id": SITE + "/#organization" },
    blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: abs(`/blog/${p.slug}/`), datePublished: p.date })),
  };
  const extraHead = [
    page > 1 ? `<link rel="prev" href="${abs(page === 2 ? "/blog/" : `/blog/page/${page - 1}/`)}">` : "",
    page < pages ? `<link rel="next" href="${abs(`/blog/page/${page + 1}/`)}">` : "",
  ].join("");
  return layout({
    title: page === 1 ? `Teen Patti Pro Blog – Rules, Tips & Game Guides` : `Teen Patti Pro Blog – Page ${page}`,
    description: "Learn Teen Patti rules, hand rankings, Dragon vs Tiger and Andar Bahar with clear guides, plus step-by-step help installing the Teen Patti Pro APK on Android.",
    pathName,
    body,
    schema: [crumbs.schema, list],
    extraHead,
  });
}

function renderPage(page) {
  const pathName = `/${page.slug}/`;
  const crumbs = breadcrumbs([["Home", "/"], [page.title, pathName]]);
  const body = `
<section class="page-hero">
  <div class="container">
    ${crumbs.html}
    <h1>${esc(page.title)}</h1>
    ${page.description ? `<p>${esc(page.description)}</p>` : ""}
  </div>
</section>
<section class="section section--tight">
  <div class="container"><div class="prose prose--narrow">${page.body.replaceAll("{{contactEmail}}", esc(config.contactEmail)).replaceAll("{{siteName}}", esc(config.siteName))}</div></div>
</section>`;
  return layout({
    title: `${page.seoTitle || page.title} | ${config.siteName}`,
    description: page.description,
    pathName,
    body,
    schema: [crumbs.schema, { "@type": "WebPage", name: page.title, url: abs(pathName) }],
    noindex: page.noindex === "true",
  });
}

// ---------- build ----------
fs.rmSync(DIST, { recursive: true, force: true });
copyDir(path.join(SRC, "assets"), path.join(DIST, "assets"));
if (fs.existsSync(path.join(SRC, "static"))) copyDir(path.join(SRC, "static"), DIST);

const posts = loadCollection("posts").sort((a, b) => (a.date < b.date ? 1 : -1));
const pages = loadCollection("pages");

// Home
{
  const crumbs = breadcrumbs([["Home", "/"]]);
  const a = config.app;
  const appSchema = {
    "@type": "MobileApplication",
    "@id": SITE + "/#app",
    name: config.appName,
    operatingSystem: "Android",
    applicationCategory: "GameApplication",
    applicationSubCategory: "Card game",
    description:
      "Teen Patti Pro is an Android card and casino game app with Teen Patti, Dragon vs Tiger, Andar Bahar, 7 Up Down, slots and more in one lobby.",
    url: SITE + "/",
    downloadUrl: /^https?:/.test(config.downloadUrl) ? config.downloadUrl : abs(config.downloadUrl),
    image: abs("/assets/img/icon-512.png"),
    screenshot: ["teen-patti-pro-lobby.jpg", "dragon-vs-tiger.jpg", "fortune-gems-slot.jpg"].map((f) => abs("/assets/img/" + f)),
    inLanguage: config.language,
    contentRating: "18+",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    publisher: { "@id": SITE + "/#organization" },
    ...(a.version && { softwareVersion: a.version }),
    ...(a.size && { fileSize: a.size }),
    ...(a.minAndroid && { softwareRequirements: a.minAndroid }),
    ...(a.lastUpdated && { dateModified: a.lastUpdated }),
    ...(config.rating && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: config.rating.value, ratingCount: config.rating.count, bestRating: 5 },
    }),
  };
  const webpage = {
    "@type": "WebPage",
    "@id": SITE + "/#webpage",
    url: SITE + "/",
    name: "Teen Patti Pro APK Download (Latest Version) for Android",
    isPartOf: { "@id": SITE + "/#website" },
    about: { "@id": SITE + "/#app" },
    primaryImageOfPage: abs("/assets/img/og-image.jpg"),
    dateModified: a.lastUpdated,
    inLanguage: config.language,
  };
  write(
    "index.html",
    layout({
      title: "Teen Patti Pro APK Download (Latest Version) for Android – Free",
      description:
        "Download the Teen Patti Pro APK for Android. Play Teen Patti, Dragon vs Tiger, Andar Bahar, 7 Up Down & slots in one app. Safe install guide, rules & FAQ.",
      pathName: "/",
      body: renderHome({ config, posts, crumbs: crumbs.html }),
      schema: [webpage, crumbs.schema, appSchema, faqSchema(homeFaqs)],
      preloadImage: "/assets/img/teen-patti-pro-lobby.webp",
    })
  );
}

// Blog
const perPage = config.postsPerPage || 9;
const pageCount = Math.max(1, Math.ceil(posts.length / perPage));
for (let p = 1; p <= pageCount; p++) {
  const slice = posts.slice((p - 1) * perPage, p * perPage);
  write(p === 1 ? "blog/index.html" : `blog/page/${p}/index.html`, renderBlogIndex(slice, p, pageCount));
}
for (const post of posts) write(`blog/${post.slug}/index.html`, renderPost(post, posts));

// Static pages
for (const page of pages) write(`${page.slug}/index.html`, renderPage(page));

// 404
write(
  "404.html",
  layout({
    title: `Page not found | ${config.siteName}`,
    description: "The page you were looking for could not be found.",
    pathName: "/404.html",
    noindex: true,
    body: `<section class="page-hero page-hero--center"><div class="container"><h1>Page not found</h1><p>The page may have moved. Head back home to download the app or browse our guides.</p><div class="cta-row">${downloadButton()}<a class="btn-ghost" href="/blog/">Read the blog</a></div></div></section>`,
  })
);

// sitemap.xml
const urls = [
  { loc: "/", lastmod: config.app.lastUpdated, priority: "1.0", changefreq: "weekly" },
  { loc: "/blog/", lastmod: posts[0]?.updated || posts[0]?.date, priority: "0.8", changefreq: "weekly" },
  ...Array.from({ length: pageCount - 1 }, (_, i) => ({ loc: `/blog/page/${i + 2}/`, priority: "0.4" })),
  ...posts.map((p) => ({ loc: `/blog/${p.slug}/`, lastmod: p.updated || p.date, priority: "0.7", changefreq: "monthly" })),
  ...pages.filter((p) => p.noindex !== "true").map((p) => ({ loc: `/${p.slug}/`, priority: "0.3", changefreq: "yearly" })),
];
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${abs(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ""}<priority>${u.priority}</priority></url>`
  )
  .join("\n")}
</urlset>
`
);

write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /404.html\n\nSitemap: ${abs("/sitemap.xml")}\n`);

// rss.xml
write(
  "rss.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(config.siteName)} Blog</title>
  <link>${abs("/blog/")}</link>
  <atom:link href="${abs("/rss.xml")}" rel="self" type="application/rss+xml"/>
  <description>Teen Patti rules, tips and Teen Patti Pro APK guides.</description>
  <language>${config.language}</language>
${posts
  .map(
    (p) => `  <item><title>${esc(p.title)}</title><link>${abs(`/blog/${p.slug}/`)}</link><guid>${abs(`/blog/${p.slug}/`)}</guid><pubDate>${new Date(p.date + "T06:00:00Z").toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`
  )
  .join("\n")}
</channel>
</rss>
`
);

write(
  "manifest.webmanifest",
  JSON.stringify(
    {
      name: config.siteName,
      short_name: config.siteName,
      start_url: "/",
      display: "standalone",
      background_color: "#12031f",
      theme_color: "#1a0630",
      icons: [
        { src: "/assets/img/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/assets/img/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    null,
    2
  )
);

console.log(`Built ${posts.length} posts, ${pages.length} pages -> ${path.relative(process.cwd(), DIST) || "dist"}`);
