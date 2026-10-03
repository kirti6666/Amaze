// Home page (landing) template.
import { esc, icons, downloadButton, postCard, fmtDate } from "./lib/ui.mjs";

const games = [
  { slug: "teen-patti", name: "Teen Patti", tag: "Classic", text: "The original three-card game. Blind, seen, side-show and show &mdash; all the rules you grew up with." },
  { slug: "dragon-vs-tiger", name: "Dragon vs Tiger", tag: "Hot", text: "One card each for Dragon and Tiger. Higher card wins &mdash; rounds last only a few seconds." },
  { slug: "andar-bahar", name: "Andar Bahar", tag: "Classic", text: "Guess whether the matching card lands Andar (inside) or Bahar (outside). Simple and fast." },
  { slug: "7-up-down", name: "7 Up Down", tag: "Dice", text: "Two dice are rolled. Predict a total below 7, above 7, or exactly 7." },
  { slug: "fortune-gems", name: "Fortune Gems", tag: "Slots", text: "A 3-reel slot with wilds, a multiplier reel and a special wheel feature." },
  { slug: "explorer-slots", name: "Explorer Slots", tag: "Hot", text: "Adventure-themed slot with colourful symbols and bonus rounds." },
  { slug: "horse-racing", name: "Horse Racing", tag: "Arcade", text: "Pick your horse and watch the animated race play out to the finish line." },
  { slug: "car-roulette", name: "Car Roulette", tag: "Hot", text: "A roulette-style wheel with car brands instead of numbers." },
  { slug: "wingo-lottery", name: "Wingo Lottery", tag: "Lottery", text: "Colour and number prediction rounds with frequent draws." },
  { slug: "chicken-road", name: "Chicken Road", tag: "Arcade", text: "Guide the chicken across the road one step at a time &mdash; stop whenever you like." },
];

const features = [
  ["10+ games, one app", "Teen Patti, Dragon vs Tiger, Andar Bahar, slots and arcade games share one lobby and one wallet.", "M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z"],
  ["Lightweight & smooth", "Built for everyday Android phones, with quick loading tables and clear, colourful graphics.", "M13 2 4 14h6l-1 8 9-12h-6l1-8z"],
  ["Daily rewards", "Check-in rewards, a 7-day login calendar, VIP gifts and in-app activities give regular players extras.", "M20 7h-2.2A3 3 0 0 0 12 4.4 3 3 0 0 0 6.2 7H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8h1a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Zm-5-1a1 1 0 1 1 0 2h-2a1 1 0 0 1 1-2Zm-6 0a1 1 0 0 1 1 1v1H9a1 1 0 0 1 0-2Zm2 14H7v-8h4Zm0-10H5V9h6Zm6 10h-4v-8h4Zm2-10h-6V9h6Z"],
  ["Refer & earn", "Invite friends with your personal referral link from the Refer &amp; Earn section in the app.", "M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.7 0-8 1.3-8 4v3h10v-3c0-1 .4-2 1.2-2.7A13 13 0 0 0 8 13Zm8 0c-.4 0-.8 0-1.3.1 1.4.9 2.3 2.2 2.3 3.9v3h7v-3c0-2.7-5.3-4-8-4Z"],
  ["Live tables", "Play alongside real players at busy tables with live round history and trend charts.", "M3 13h2v8H3zm4-6h2v14H7zm4 3h2v11h-2zm4-7h2v18h-2zm4 9h2v9h-2z"],
  ["In-app support", "Reach the support team from the Service and Email buttons right inside the lobby.", "M12 2a9 9 0 0 0-9 9v6a3 3 0 0 0 3 3h2v-8H5v-1a7 7 0 0 1 14 0v1h-3v8h3v1h-6v2h6a2 2 0 0 0 2-2v-9a9 9 0 0 0-9-9Z"],
];

export const homeFaqs = [
  {
    q: "What is Teen Patti Pro?",
    a: "Teen Patti Pro is an Android game app that brings the classic Indian three-card game Teen Patti together with Dragon vs Tiger, Andar Bahar, 7 Up Down, Fortune Gems slots, Car Roulette, Horse Racing and other quick games in one lobby.",
  },
  {
    q: "How do I download the Teen Patti Pro APK?",
    a: "Tap the Download APK button on this page, open the downloaded teen-patti-pro.apk file, allow installs from your browser when Android asks, then tap Install. The full steps are in the How to Install section above.",
  },
  {
    q: "Is Teen Patti Pro available on the Google Play Store?",
    a: "Teen Patti Pro is distributed as an APK file for Android, which is why you install it directly from this website instead of from the Play Store. Always download the APK from the official site to make sure you get the genuine, latest version.",
  },
  {
    q: "Is the Teen Patti Pro APK safe to install?",
    a: "Download only from the official link on this page, keep Google Play Protect switched on, and scan the file if you like before installing. Never install modified (mod) or 'hacked' versions from other sites: they can contain malware and put your account at risk.",
  },
  {
    q: "Can I play Teen Patti Pro on an iPhone or PC?",
    a: "The app is built for Android phones and tablets. iPhone (iOS) is not supported. On a Windows PC you can run the APK using an Android emulator such as BlueStacks or LDPlayer.",
  },
  {
    q: "Who can play Teen Patti Pro?",
    a: "Only adults aged 18 or older may use the app, and only where online games of this kind are legal. Laws differ between countries and Indian states, and some prohibit online money games entirely, so check your local rules before you download or play.",
  },
  {
    q: "How do I update Teen Patti Pro to the latest version?",
    a: "Return to this page and download the latest APK, then install it over your current version. Your account stays linked to your login, so you do not lose your progress.",
  },
  {
    q: "What are the Teen Patti hand rankings?",
    a: "From highest to lowest: Trail (three of a kind), Pure Sequence (straight flush), Sequence (straight), Color (flush), Pair, and High Card. A-K-Q is the highest sequence and A-2-3 is the second highest.",
  },
];

const handRanks = [
  ["Trail / Set", "Three cards of the same rank", "A♠ A♥ A♦", "52", "0.24%"],
  ["Pure Sequence", "Three consecutive cards of the same suit", "Q♥ K♥ A♥", "48", "0.22%"],
  ["Sequence (Run)", "Three consecutive cards, mixed suits", "4♣ 5♦ 6♠", "720", "3.26%"],
  ["Color (Flush)", "Three cards of the same suit, not in sequence", "2♦ 8♦ J♦", "1,096", "4.96%"],
  ["Pair", "Two cards of the same rank", "K♣ K♦ 7♠", "3,744", "16.94%"],
  ["High Card", "None of the above &mdash; highest card wins", "A♠ 9♥ 4♣", "16,440", "74.39%"],
];

function specRows(config) {
  const a = config.app;
  return [
    ["App name", config.appName],
    ["Category", a.category],
    ["Platform", "Android (APK)"],
    ["Latest version", a.version],
    ["File size", a.size],
    ["Requires", a.minAndroid],
    ["Developer", a.developer],
    ["License", a.license],
    ["Language", a.languages],
    ["Updated", a.lastUpdated && fmtDate(a.lastUpdated)],
    ["Age rating", "18+"],
    ["File name", config.apkFileName],
  ].filter(([, v]) => v);
}

const shot = (name, alt, eager = false) => `<figure class="shot">
  <picture>
    <source type="image/webp" srcset="/assets/img/${name}-640.webp 640w, /assets/img/${name}.webp 1200w" sizes="(max-width: 700px) 88vw, 560px">
    <img src="/assets/img/${name}.jpg" alt="${alt}" width="1200" height="540" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>
  </picture>
</figure>`;

export function renderHome({ config, posts, crumbs }) {
  const rating = config.rating;
  return `
<section class="hero">
  <div class="hero__glow" aria-hidden="true"></div>
  <div class="container hero__grid">
    <div class="hero__copy">
      ${crumbs}
      <div class="app-id">
        <img class="app-id__icon" src="/assets/img/icon-192.png" alt="${esc(config.appName)} app icon" width="76" height="76">
        <div>
          <p class="eyebrow">Official Android APK</p>
          <div class="app-id__meta">
            <span class="pill pill--green">Free</span>
            <span class="pill">${icons.android} Android</span>
            ${config.app.version ? `<span class="pill">v${esc(config.app.version)}</span>` : ""}
            ${rating ? `<span class="pill">★ ${rating.value} (${rating.count.toLocaleString("en-IN")})</span>` : ""}
            <span class="pill pill--red">18+</span>
          </div>
        </div>
      </div>
      <h1>Teen Patti Pro APK Download <span class="grad">Latest Version</span> for Android</h1>
      <p class="hero__lede">Play <strong>Teen Patti</strong>, <strong>Dragon vs Tiger</strong>, <strong>Andar Bahar</strong>, 7 Up Down and fun slot games &mdash; all in one lightweight app. Download the official APK free and start in under a minute.</p>
      <div class="cta-row" id="download">
        ${downloadButton({ label: "Download APK", sub: config.app.size ? `Android · ${esc(config.app.size)}` : "Android · Free", size: "btn-download--lg", id: "hero-download" })}
        <a class="btn-ghost" href="#install">How to install ${icons.arrow}</a>
      </div>
      <ul class="trust-row">
        <li>${icons.shield} Official download link</li>
        <li>${icons.shield} No mods, no hacks</li>
        <li>${icons.shield} Updated ${esc(fmtDate(config.app.lastUpdated))}</li>
      </ul>
    </div>
    <div class="hero__visual">
      <div class="device">
        <div class="device__screen">${shot("teen-patti-pro-lobby", "Teen Patti Pro game lobby with Teen Patti, Dragon vs Tiger, Andar Bahar, 7 Up Down and slots", true)}</div>
      </div>
      <div class="float-card float-card--a"><img src="/assets/img/games/dragon-vs-tiger.webp" alt="" width="56" height="56"><span><strong>Dragon vs Tiger</strong><small>Fast rounds</small></span></div>
      <div class="float-card float-card--b"><img src="/assets/img/games/andar-bahar.webp" alt="" width="56" height="56"><span><strong>Andar Bahar</strong><small>Classic</small></span></div>
    </div>
  </div>
</section>

<section class="stats" aria-label="App highlights">
  <div class="container stats__grid">
    <div><strong>10+</strong><span>Games in one app</span></div>
    <div><strong>Free</strong><span>To download &amp; install</span></div>
    <div><strong>&lt; 1 min</strong><span>Quick install</span></div>
    <div><strong>4 steps</strong><span>To start playing</span></div>
  </div>
</section>

<section class="section" id="about">
  <div class="container split">
    <div class="prose">
      <p class="eyebrow">About the app</p>
      <h2>What is Teen Patti Pro?</h2>
      <p><strong>Teen Patti Pro</strong> is an Android card and casino game app built around India&rsquo;s favourite three-card game, <em>Teen Patti</em> (also called 3 Patti or Flash). Alongside the classic table, the app&rsquo;s lobby includes <strong>Dragon vs Tiger</strong>, <strong>Andar Bahar</strong>, <strong>7 Up Down</strong>, <strong>Car Roulette</strong>, <strong>Horse Racing</strong>, <strong>Wingo Lottery</strong>, <strong>Chicken Road</strong> and slot games such as <strong>Fortune Gems</strong> and <strong>Explorer Slots</strong>.</p>
      <p>Everything runs from a single account and wallet, so you can switch from a Teen Patti table to a quick Dragon vs Tiger round without logging in again. Live tables show round history and trends, and daily features like the 7-day check-in, VIP gifts and Refer &amp; Earn reward regular players.</p>
      <p>Because Teen Patti Pro is distributed as an <strong>APK file</strong>, you install it directly from this official page instead of an app store. The steps below walk you through it safely.</p>
    </div>
    <div class="spec-card" aria-labelledby="spec-title">
      <div class="spec-card__head">
        <img src="/assets/img/icon-192.png" alt="" width="56" height="56" loading="lazy">
        <div><h2 id="spec-title" class="h3">App information</h2><p>${esc(config.appName)} APK for Android</p></div>
      </div>
      <dl class="spec-list">
        ${specRows(config).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}
      </dl>
      ${downloadButton({ label: "Download APK", sub: "Free · Android", size: "btn-download--block" })}
    </div>
  </div>
</section>

<section class="section section--alt" id="games">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Inside the lobby</p>
      <h2 class="section-title">Games you can play in Teen Patti Pro</h2>
      <p class="section-sub">From traditional Indian card games to quick-fire arcade rounds &mdash; here&rsquo;s what&rsquo;s waiting after you install.</p>
    </div>
    <div class="game-grid">
      ${games
        .map(
          (g) => `<article class="game-card">
        <div class="game-card__img"><img src="/assets/img/games/${g.slug}.webp" alt="${esc(g.name)} game in Teen Patti Pro" width="360" height="340" loading="lazy" decoding="async"><span class="tag tag--${g.tag.toLowerCase()}">${g.tag}</span></div>
        <h3>${esc(g.name)}</h3>
        <p>${g.text}</p>
      </article>`
        )
        .join("")}
    </div>
    <div class="center-cta">${downloadButton({ label: "Download &amp; play all games", sub: "Free Android APK" })}</div>
  </div>
</section>

<section class="section" id="screenshots">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Screenshots</p>
      <h2 class="section-title">See Teen Patti Pro in action</h2>
    </div>
    <div class="gallery" tabindex="0" aria-label="App screenshots, scroll horizontally">
      ${shot("teen-patti-pro-lobby", "Teen Patti Pro home screen with wallet, bonus and the full game lobby")}
      ${shot("dragon-vs-tiger", "Dragon vs Tiger live table in Teen Patti Pro showing betting areas and round trend")}
      ${shot("fortune-gems-slot", "Fortune Gems slot game in Teen Patti Pro with wild symbols and special wheel")}
    </div>
  </div>
</section>

<section class="section section--alt" id="features">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Why players choose it</p>
      <h2 class="section-title">Teen Patti Pro features</h2>
    </div>
    <div class="feature-grid">
      ${features
        .map(
          ([t, d, p]) => `<article class="feature">
        <span class="feature__icon"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="${p}"/></svg></span>
        <h3>${t}</h3><p>${d}</p>
      </article>`
        )
        .join("")}
    </div>
  </div>
</section>

<section class="section" id="install">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Step by step</p>
      <h2 class="section-title">How to download &amp; install Teen Patti Pro APK</h2>
      <p class="section-sub">Takes about a minute on most Android phones. No computer needed.</p>
    </div>
    <ol class="steps">
      <li><span class="steps__n">1</span><h3>Download the APK</h3><p>Tap any <strong>Download APK</strong> button on this page. The file <code>${esc(config.apkFileName)}</code> saves to your phone&rsquo;s Downloads folder.</p></li>
      <li><span class="steps__n">2</span><h3>Allow the install</h3><p>Open the file. If Android shows <em>&ldquo;For your security, your phone is not allowed to install unknown apps&rdquo;</em>, tap <strong>Settings</strong> and turn on <strong>Allow from this source</strong> for your browser.</p></li>
      <li><span class="steps__n">3</span><h3>Install the app</h3><p>Go back and tap <strong>Install</strong>. Wait a few seconds until you see <em>App installed</em>, then tap <strong>Open</strong>.</p></li>
      <li><span class="steps__n">4</span><h3>Sign in &amp; play</h3><p>Log in with your mobile number, explore the lobby and pick a game. Set personal limits before you play.</p></li>
    </ol>
    <div class="note">
      ${icons.shield}
      <p><strong>Stay safe:</strong> only download from the official link on this page. Avoid &ldquo;mod APK&rdquo; or &ldquo;unlimited money&rdquo; versions &mdash; they are fake, can steal your data, and can get your account blocked. Need more help? Read our <a href="/blog/how-to-install-teen-patti-pro-apk/">full installation &amp; troubleshooting guide</a>.</p>
    </div>
  </div>
</section>

<section class="section section--alt" id="hand-rankings">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Quick rules</p>
      <h2 class="section-title">Teen Patti hand rankings (highest to lowest)</h2>
      <p class="section-sub">Every Teen Patti table in the app uses these standard rankings. Odds are for a random 3-card hand from a 52-card deck (22,100 possible hands).</p>
    </div>
    <div class="table-wrap">
      <table class="rank-table">
        <thead><tr><th scope="col">#</th><th scope="col">Hand</th><th scope="col">What it means</th><th scope="col">Example</th><th scope="col">Combinations</th><th scope="col">Probability</th></tr></thead>
        <tbody>
          ${handRanks
            .map(
              ([h, d, e, c, p], i) =>
                `<tr><td>${i + 1}</td><th scope="row">${h}</th><td>${d}</td><td class="cards">${e.replace(/([♥♦])/g, '<span class="red">$1</span>')}</td><td>${c}</td><td>${p}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <p class="center-link">New to the game? Read the <a href="/blog/teen-patti-rules/">complete Teen Patti rules</a> or the <a href="/blog/teen-patti-hand-rankings/">hand rankings guide with tie-break rules</a>.</p>
  </div>
</section>

<section class="section" id="review">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">Our take</p>
      <h2 class="section-title">Teen Patti Pro pros &amp; cons</h2>
    </div>
    <div class="proscons">
      <div class="proscons__col proscons__col--pro">
        <h3>What we like</h3>
        <ul>
          <li>Many popular Indian card and casino-style games in one app</li>
          <li>Clean, colourful interface that is easy to navigate</li>
          <li>Live tables with round history and trend charts</li>
          <li>Daily check-in, VIP gift and referral features</li>
          <li>Support available directly inside the app</li>
        </ul>
      </div>
      <div class="proscons__col proscons__col--con">
        <h3>Keep in mind</h3>
        <ul>
          <li>Android only &mdash; no iPhone version</li>
          <li>Installed by APK, not from the Play Store</li>
          <li>Involves financial risk; for adults 18+ only</li>
          <li>Not legal in every country or state</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section section--alt" id="faq">
  <div class="container container--narrow">
    <div class="section-head">
      <p class="eyebrow">FAQ</p>
      <h2 class="section-title">Frequently asked questions</h2>
    </div>
    <div class="faq-list">
      ${homeFaqs.map((f, i) => `<details class="faq"${i === 0 ? " open" : ""}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}
    </div>
  </div>
</section>

${
  posts.length
    ? `<section class="section" id="blog">
  <div class="container">
    <div class="section-head section-head--row">
      <div><p class="eyebrow">From the blog</p><h2 class="section-title">Guides, rules &amp; tips</h2></div>
      <a class="btn-ghost" href="/blog/">All articles ${icons.arrow}</a>
    </div>
    <div class="post-grid">${posts.slice(0, 3).map(postCard).join("")}</div>
    <div class="topics">
      <p class="topics__title">Related topics</p>
      <ul>
        <li><a href="/blog/teen-patti-rules/">How to play Teen Patti</a></li>
        <li><a href="/blog/teen-patti-hand-rankings/">3 Patti hand rankings</a></li>
        <li><a href="/blog/dragon-vs-tiger-rules/">Dragon vs Tiger rules</a></li>
        <li><a href="/blog/andar-bahar-rules/">Andar Bahar rules</a></li>
        <li><a href="/blog/how-to-install-teen-patti-pro-apk/">Install APK on Android</a></li>
        <li><a href="/responsible-gaming/">Responsible gaming</a></li>
      </ul>
    </div>
  </div>
</section>`
    : ""
}

<section class="final-cta">
  <div class="container final-cta__inner">
    <img src="/assets/img/teen-patti-pro-logo.webp" alt="${esc(config.appName)}" width="220" height="98" loading="lazy">
    <h2>Download Teen Patti Pro APK now</h2>
    <p>Free for Android. One app, 10+ games, quick install.</p>
    ${downloadButton({ label: "Download APK", sub: "Android · Free", size: "btn-download--lg" })}
    <small>18+ only. Please play responsibly and check your local laws.</small>
  </div>
</section>`;
}
