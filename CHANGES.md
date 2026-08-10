# Changes — August 2026

Six requested changes. Nothing outside the files listed below was touched; no
existing component, route, model or feature had its behaviour altered except
where explicitly noted under "Behaviour changes" at the bottom.

---

## 1. Premium logo

**New:** `components/storefront/Logo.tsx`, `public/brand/tiger-mark.svg`,
`public/brand/tiger-logo.svg`, `public/brand/tiger-icon-512.png`

A drawn tiger-head mark plus a wordmark lockup. The mark is a single
`fill-rule="evenodd"` path — head, stripes, eyes and muzzle are cut-outs of one
shape — so it sits on any background and holds up down to 16px. It fills with
`currentColor`, inheriting colour from wherever it's used; the irises are the
one accent, in the theme's primary red.

The wordmark is live text in Archivo (the display face the site already loads)
rather than outlines, so it stays crisp at any size and matches the headings
below it. `tiger-logo.svg` is the flattened version for email, invoices,
marketplaces and print.

Usage in `Logo.tsx`:

```tsx
<Logo storeName="Tiger" tagline="Clinical doses" />
<TigerMark className="h-6 w-6" />   // mark on its own
```

**Site Settings still wins.** If `brand.logoUrl` is set in the admin, that image
renders exactly as before — the drawn lockup is only the fallback for when no
logo has been uploaded.

## 2. Mobile navbar — hamburger

**New:** `components/storefront/MobileNav.tsx`
**Changed:** `components/storefront/Header.tsx`

The desktop nav is unchanged; it's now gated to `md:` and up. Below that the
links move into a slide-in panel behind a hamburger, which is what fixes the
overlap.

- Cart stays permanently in the bar as an icon with a count badge — it's the
  control people reach for mid-shop and shouldn't have to open a menu to find.
- Body scroll locks while the panel is open (otherwise the page scrolls under
  your finger on iOS).
- Closes on route change, on Escape, and on backdrop tap.
- `aria-expanded` / `aria-controls` on the trigger; the panel is a labelled
  `role="dialog"`.
- The header is now `sticky top-0` with a blurred background.

Nav links, cart, account/admin and login/logout all come from the same Site
Settings data as before — the mobile menu adds no second source of truth.

## 3. Hero image slider

**New:** `components/storefront/HeroSlider.tsx`, `lib/heroSlides.ts`,
`public/hero/slides/*`
**Changed:** `app/(storefront)/page.tsx` (hero block only)

The three banners now rotate. Built as a translated track rather than
cross-fading layers, so a drag can follow the thumb instead of snapping when
the finger lifts.

- Auto-advances every 5s (`HERO_AUTOPLAY_MS` in `lib/heroSlides.ts`).
- The timer resets on any manual move, so a slide never flips away a beat after
  you chose it.
- Pauses on hover, on keyboard focus, and while the browser tab is hidden.
- Swipe and drag on both touch and mouse, with a distance threshold so a tap
  still registers as a click through to the linked page.
- Arrow keys, arrow buttons on pointer devices, and dot indicators. The active
  dot widens into a bar rather than only changing colour, so position is
  readable without relying on hue.
- Respects `prefers-reduced-motion` by not auto-advancing; manual controls stay.

**Two crops per slide.** Each banner is 2.29:1, which at phone width would
render its baked-in headline about four pixels tall. So each slide ships a wide
JPG for `md:` and up and a 1:1 crop framed on the products for below that,
as separate `<img>` elements toggled by breakpoint — the phone never downloads
the 1900px banner. WebP versions are in the folder too if you want to add a
`<picture>` element later.

**To change slides:** drop images into `public/hero/slides/` and edit the
`HERO_SLIDES` array. Each entry needs `image`, `mobile`, `alt` and optionally
`href`.

## 4. Buy Now button

**Changed:** `components/storefront/ProductDetailClient.tsx`

Sits directly under Add to Cart. Outlined rather than filled, so Add to Cart
stays the primary action for people still browsing and this reads as the path
for the shopper who's decided.

It adds to the existing cart and then navigates to `/checkout` — deliberately
*adds* rather than replaces, because someone with two items already in the cart
who taps Buy Now on a third expects to pay for all three, not to lose the first
two. Respects variant selection and out-of-stock state identically to Add to
Cart.

## 5. Product & combo reviews

**New:** `scripts/sample-reviews.ts`, `scripts/seed-reviews.ts`
**Changed:** `package.json` (one script entry)

3–4 reviews for each of the 12 products and 5 combos — 59 in total, in a mix of
English and Hinglish, with ratings spread across 3–5 stars and posting dates
spread over the last two months.

```bash
npm run seed:reviews             # create
npm run seed:reviews -- --purge  # remove every trace
```

No new model, route or component — this writes into the `Review` collection the
storefront and admin moderation screen already use, and recomputes each
product's `ratingsAverage` / `ratingsCount` exactly as the API does.

> ### ⚠ These are sample reviews, not real customer feedback
>
> Publishing invented customer reviews is an unfair trade practice under the
> Consumer Protection Act 2019 and the BIS review guidelines (IS 19000:2022),
> and supplement listings are an active enforcement area. Use these to populate
> staging and to show the layout, then **purge before launch** and let real
> reviews replace them.
>
> The script is built so that can't be forgotten by accident:
> - every account it creates uses an `@sample.invalid` email — a reserved TLD
>   that can't receive mail and can't collide with a real customer;
> - accounts are created with no password, so none can be signed into;
> - `--purge` deletes exactly those accounts and their reviews and nothing
>   else, then recomputes the affected product ratings;
> - reviews upsert on `(product, user)`, the same unique index the app
>   enforces, so re-running is idempotent.
>
> It also never clears products, categories or settings — unlike `npm run seed`.

## 6. Favicon

**New:** `app/icon.svg`, `app/apple-icon.png`, `public/favicon.ico`

The tiger mark on a dark tile with a red hairline border. Uses Next's file
conventions, so it applies automatically. `.ico` ships at 16/32/48/64px.

`generateMetadata` in `app/layout.tsx` is untouched — an admin-uploaded
`brand.faviconUrl` still overrides these if one is set.

## 7. Centre alignment

**Changed:** `components/storefront/Header.tsx`,
`components/storefront/HeroSlider.tsx`, and the seven inner storefront pages
listed below.

The site had two competing container widths. The homepage sections, product
rails and footer all used `max-w-7xl px-5 md:px-8` — but the header used
`max-w-6xl px-5 md:px-6`, and every inner page used `max-w-6xl px-6`. On
desktop that put the logo and nav 64px inside the axis of everything below
them, and the shop/product/category pages on a third axis again.

Everything now uses one shell: **`mx-auto max-w-7xl px-5 md:px-8`**. Nothing
but the container classes changed — no logic, no markup structure.

Files brought onto the shared axis:

- `components/storefront/Header.tsx`
- `app/(storefront)/shop/page.tsx` + `loading.tsx`
- `app/(storefront)/product/[slug]/page.tsx` + `loading.tsx`
- `app/(storefront)/category/[slug]/page.tsx` + `loading.tsx`
- `app/(storefront)/account/wishlist/page.tsx`

**Visible effect:** the header logo now lines up vertically with the section
headings, product rails and footer columns. The shop, product, category and
wishlist pages are 128px wider than before and their side padding shifts from
a flat `px-6` to `px-5 / md:px-8`, matching everything else.

**The hero** is capped at `max-w-[1920px]` and centred. Below that it still
bleeds edge to edge as designed; above it the banner stops growing and centres
instead of upscaling past its native 1897px and going soft on ultrawide
monitors. Both crops carry `mx-auto object-center` so the image is centred
inside its slide regardless of viewport.

> If you'd rather keep the inner pages at their old narrower width, revert just
> those seven files — the header and hero changes stand on their own, and the
> header will still align with the homepage and footer.

---


1. **`home.hero.backgroundImage` is no longer read on the homepage.** The
   desktop hero came from that setting; it now comes from `HERO_SLIDES`. The
   setting still exists and is still editable in the admin — it just isn't what
   draws the hero any more. Slide 1 is the same artwork.
2. **The invisible hit area over the banner's baked-in SHOP NOW button is
   gone**, because each slide is now a link across its whole area. Slide links
   are per-slide in `lib/heroSlides.ts`, defaulting to the hero CTA link.
3. **`hero.title` / `hero.subtitle` / `hero.ctaText` still drive the mobile text
   block** below the slider, unchanged.
4. `public/hero/hero-banner.jpg` and `hero-mobile.jpg` are still in the repo but
   no longer referenced. Left in place rather than deleted, in case anything
   else points at them.

## Verification

`npx tsc --noEmit` passes clean. `next build` compiles and passes lint and type
validation. The build wasn't run to completion here because it needs a live
`MONGODB_URI` — worth a final `npm run build` on your side against a real
`.env.local`.

Not verified in a browser: the dev server needs a database this environment
doesn't have. Worth eyeballing the slider drag on a real phone and the hamburger
panel at ~360px width.

---

## 8. Self-hosted fonts (fixes the Google Fonts build failure)

**New:** `app/fonts/` — five woff2 files plus their OFL licences
**Changed:** `app/layout.tsx`

`next/font/google` downloads typefaces over the network *at build time*, in
Node. That fetch fails behind proxies, VPNs and antivirus TLS inspection, and
when it does Next falls back to system fonts and the whole design degrades:

```
⨯ Failed to download `Archivo` from Google Fonts. Using fallback font instead.
AbortError: The user aborted a request.
```

The three faces are now bundled with the project and loaded through
`next/font/local`, so the build is deterministic and works with no network at
all. Verified by building in a sandbox that cannot reach Google.

| Role | File | Size |
|---|---|---|
| Display (Archivo) | `archivo-variable.woff2` | 35 KB |
| Body (Instrument Sans) | `instrument-sans-variable.woff2` | 30 KB |
| Mono (IBM Plex Mono) | `ibm-plex-mono-400/500/600.woff2` | 15 KB each |

Archivo and Instrument Sans are variable fonts, so one file covers the full
weight range — 600/700/800 all render from a single 35 KB download.

Nothing about the design changes: same three faces, same weights, same
`--font-display` / `--font-body` / `--font-mono` variables, so every existing
class keeps working.

**This is also the better production setup.** No third-party request on page
load, one less origin to connect to, faster first paint, and no visitor IP
addresses sent to Google — which is what got Google Fonts ruled a GDPR problem
in several EU jurisdictions.

Fonts are OFL-1.1 licensed and free to self-host and redistribute; the licence
files sit alongside them in `app/fonts/`.

---

## 9. Guest checkout, phone OTP, and COD removal

### No login, ever

`middleware.ts` no longer gates `/checkout`. Buy Now, Add to Cart and Wishlist
all work with no account. Identity is established at checkout by phone + OTP
instead, and enforced server-side by the order routes.

- `app/api/auth/otp/verify/route.ts` (**new**) — completes the OTP pair. Caps
  attempts at 5, consumes codes on success so they can't be replayed, compares
  timing-safely, and returns an identical message for wrong / expired / absent
  codes so nobody can probe which numbers have a checkout open. On success it
  sets a signed, httpOnly, 30-minute guest token.
- `lib/checkoutIdentity.ts` (**new**) — one place that answers "who is buying
  and where does it ship", for both checkout routes. The guest phone is read
  from the *signed token*, never from the request body: a client can put any
  number in JSON, but can't forge a token signed with `JWT_ACCESS_SECRET`.
- `components/storefront/GuestCheckoutPanel.tsx` (**new**) — phone → OTP →
  address, with the address revealed only after verification. Guest address
  fields are deliberately never persisted client-side; a shared device
  shouldn't leak someone's home address to the next user.
- **Fixed a live bug:** `Otp`, `Invoice` and `InvoiceSettings` were missing from
  `models/index.ts`, so the pre-existing OTP send route would have crashed on
  import.

### COD removed

The store is prepaid only. `POST /api/orders` (the COD path) now returns 410
with `code: "COD_DISABLED"` — kept rather than deleted so a stale tab gets a
readable refusal instead of a 404 that looks like a broken deploy. `GET` still
lists orders. `codEnabled` now defaults to `false` in the schema, the seed and
the settings fallback. The checkout UI states the payment method rather than
offering a choice that no longer exists.

> ### ⚠ Your store cannot take orders until Razorpay keys are set
> COD was the only working payment path. With it removed and
> `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID`
> still empty, every checkout ends at "Online payment is unavailable". This is
> intentional and clearly messaged rather than a crash — but the store is shut
> until those keys exist. If Razorpay KYC will take days, consider re-enabling
> COD in Admin → Settings → Commerce until it clears.

### Wishlist without an account

`store/useWishlistStore.ts` now persists to localStorage and works logged out.
The public API is unchanged (`ids` is still a Set), so existing components
didn't need rewriting. Reconciliation is by **union, not overwrite**: `load()`
merges server ids into local ones, and `mergeIntoAccount()` pushes local ids up
after login — someone who saved on their phone then signed in on a laptop keeps
both. `WishlistButton` no longer redirects to `/login`.

### Home button

Added to the empty-cart state at checkout, alongside Continue shopping.

### Still needed before this can go live

1. **Razorpay keys** — nothing can be ordered without them.
2. **An SMS gateway.** `lib/sms.ts` supports MSG91 and Twilio but defaults to
   printing the OTP to your server console, so checkout is testable now. Live
   SMS in India also requires DLT registration (sender ID and template
   pre-approved by the operator) — start that early, it takes days.
3. **`mergeIntoAccount()` needs calling** from the login and register success
   handlers. The store method is built and tested; the two call sites aren't
   wired yet.
4. **Guest order lookup.** Guests have no account page. The DB index
   (`guest.phone`) exists, but there's no "track my order" page yet.

---

## 10. Audit — bugs found and fixed

A trace of each flow end-to-end after the guest-checkout change. Seven real
breaks, all of them created by orders that have no `user` row. Every one is
fixed below.

| # | Severity | What was broken | Fix |
|---|---|---|---|
| 1 | **Critical** | `POST /api/payments/razorpay/verify` required a session and did `order.user.toString()`. A guest would **pay, then get a 401** — money taken, order never confirmed, stock never decremented. | Accepts guests; ownership matched on `guest.phone`. |
| 2 | **Critical** | `/order-success/[id]` redirected to `/login`. A guest who had just paid was bounced to a login form they cannot satisfy. | Accepts a verified guest token; redirects to `/` only if neither identity is present. |
| 3 | High | `POST /api/coupons/apply` required auth, so the coupon box always failed for guests. | Auth removed — it only *quotes* a discount and mutates nothing; order creation re-validates authoritatively. |
| 4 | High | Tax invoices for guest orders had a **blank buyer** (name, email, phone all empty) — a GST compliance problem. | Falls back to guest contact, then the shipping address. |
| 5 | High | `GET /api/invoices/[orderId]` required a session, so guests could never download their invoice. | Accepts a verified guest token. |
| 6 | Medium | Confirmation email did `User.findById(order.user)` → null for guests, so **no email was ever sent**. | Uses the guest's email when there's no account. |
| 7 | Low | Admin order list showed every guest order as "Unknown". | Shows the guest name with a "Guest" badge, and email or phone beneath. |

### Verified by running it

`normalisePhone`, guest-token signing/verification and OTP hash comparison were
executed directly (not just type-checked):

```
PASS  normalisePhone: 9876543210 / +91… / 0… / spaced  → normalised
PASS  normalisePhone: 1234567890, 98765, ""            → rejected
PASS  guest token round-trips
PASS  tampered token rejected
PASS  correct OTP matches / wrong OTP rejected
```

Also caught: the OTP send route returns `devMode`, but the checkout panel was
reading `devHint` — the "check your terminal" hint would never have appeared.
Contract now matches.

### Verified by inspection, not execution

Fonts (self-hosted, bundled — confirmed in the build output). Razorpay
signature verification (HMAC formula matches Razorpay's documented one, uses
`timingSafeEqual`, and `confirmRazorpayPayment` is idempotent so verify and
webhook can't double-confirm). Coupon maths and stock decrement.

### NOT verified — needs a database

None of the following has been run against real data, because this environment
can't reach your Atlas cluster. **Test these yourself before launch:**

1. A full guest purchase in Razorpay **test mode**, end to end.
2. Invoice PDF for a guest order — check the buyer block isn't blank.
3. Admin panel with a mix of guest and account orders.
4. Coupon applied as a guest, and the discount correct on the final order.
5. Closing the tab immediately after paying — the webhook should still confirm.
