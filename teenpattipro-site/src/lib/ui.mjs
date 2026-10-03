// Shared markup helpers used by the generator and page templates.
import config from "../../site.config.mjs";

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const fmtDate = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export const icons = {
  download:
    '<svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22"><path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v9.59l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.42l3.3 3.3V4a1 1 0 0 1 1-1Zm-8 15a1 1 0 0 1 1 1v1h14v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z"/></svg>',
  android:
    '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><path fill="currentColor" d="M17.6 9.48l1.84-3.18a.38.38 0 0 0-.66-.38l-1.86 3.22a11.4 11.4 0 0 0-9.84 0L5.22 5.92a.38.38 0 0 0-.66.38L6.4 9.48A10.8 10.8 0 0 0 1 18h22a10.8 10.8 0 0 0-5.4-8.52ZM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"/></svg>',
  shield:
    '<svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22"><path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3Z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24"><path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10.4 3.2 1.9-.8 1.3L11 13V7h2v5.4Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><path fill="currentColor" d="M13.2 5.3 19.9 12l-6.7 6.7-1.4-1.4 4.3-4.3H4v-2h12.1l-4.3-4.3 1.4-1.4Z"/></svg>',
};

export function downloadButton({ label = "Download APK", sub = "Android · Free", size = "", id = "" } = {}) {
  return `<a class="btn-download ${size}" href="${esc(config.downloadUrl)}" ${id ? `id="${id}"` : ""} data-download rel="nofollow" download="${esc(config.apkFileName)}">
    <span class="btn-download__icon">${icons.download}</span>
    <span class="btn-download__text"><strong>${label}</strong><small>${icons.android} ${sub}</small></span>
  </a>`;
}

export function postCard(p) {
  return `<article class="post-card">
  <a class="post-card__media" href="/blog/${p.slug}/" tabindex="-1" aria-hidden="true">
    <img src="/assets/img/${p.cover || "teen-patti-pro-lobby-640.webp"}" alt="" width="640" height="288" loading="lazy" decoding="async">
  </a>
  <div class="post-card__body">
    <span class="chip">${esc(p.category || "Guide")}</span>
    <h3><a href="/blog/${p.slug}/">${esc(p.title)}</a></h3>
    <p>${esc(p.description)}</p>
    <div class="post-meta"><time datetime="${p.date}">${fmtDate(p.date)}</time><span>${icons.clock} ${p.readMinutes} min read</span></div>
  </div>
</article>`;
}

