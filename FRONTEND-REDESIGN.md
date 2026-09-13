# Amaze Markets storefront redesign

The existing Next.js Store application now uses the visual structure of https://www.thestorche.com/ with the supplied Amaze Markets logo, desktop banner and mobile banner.

## Scope

- White storefront, deep purple primary colour and pink accents; rounded product cards, centered collection headings, image category tiles, responsive navigation, and revised product/cart/checkout layouts.
- Original uploaded artwork is in `public/brand/amaze-*.png`. The hero uses a responsive `<picture>` so mobile receives the portrait banner without cropping. The existing carousel and configured CTA destination are retained.
- `components/storefront/appearance.ts` applies the Amaze preset to the original Tiger/Store branding and original red/dark theme at render time. It never updates the settings document. Custom admin themes, logo URLs, links, section visibility, catalog content and commerce values remain available. The admin can set another palette or logo in Site Settings.
- All existing product data is retained. Homepage category photographs come from the reference collection artwork. The legacy supplement demo catalog is hidden from the homepage and default shop listing. Beauty previews are marked Coming soon until catalog integration resumes.
- `/wishlist` is a new public page, approved during the redesign. Guests can view and remove favourites already saved by the existing wishlist store. It uses the existing public product endpoint, omits inactive/deleted products and provides retries on loading errors. The signed-in account wishlist route also uses the shared page; account authentication is unchanged.
- Guest email OTP, postcode/address autofill, saved addresses, order creation, payments, coupons, inventory and account synchronization retain their original handlers. Backend routes, middleware, models, stores and admin code are unchanged.
- Reference-only features without matching Tiger workflows (newsletter subscription, currency switching and quantity-discount bundles) were not introduced.

## Local preview

Install the locked dependencies with `npm ci`. Use the existing `.env.local` configuration for your environment. For an isolated sample preview, start `npm run preview:db`, configure `MONGODB_URI=mongodb://127.0.0.1:27018/store_preview`, and run `npm run dev`.

The original `npm run seed` script clears data; use it only with a disposable local database. Do not run it against production. Local preview secrets are not production credentials and the ignored `.env.local` must not be committed.

## Verification

- `npx tsc --noEmit`
- `npm run lint`
- `npx tsx --test tests/guest-wishlist.test.ts tests/payplus.test.ts` (9 tests)
- `npm run build`

Browser checks cover desktop/mobile artwork, mobile navigation, guest wishlist save/view/remove, product quantity selection, add-to-cart, cart totals and the guest email OTP checkout screen. Original product/cart and checkout action handlers were compared against the repository version and are unchanged.

Email sending, verification with a delivered OTP, external postcode lookup, and a live payment were not performed. They require the existing environment's service configuration. The local preview correctly shows payments unavailable when payment credentials are absent.

## Compact homepage update
- Homepage: supplied responsive banner, up to four real trending products, eight photo category cards, and Skin & Beauty Essentials. Removed supplement rails, duplicate offers and clinical highlights.
- Category cards use the reference collection artwork, four columns on desktop and two on mobile.
- Beauty previews are explicitly marked Coming soon. They contain no invented prices, stock or purchase actions; real products replace them when the beauty category is populated.
- Legacy supplement demo records remain in the database and existing admin/order workflows are untouched. They are excluded from homepage and the default shop listing.
- Category destinations show an empty result when their category has not yet been imported, rather than showing unrelated products.
- Legacy header/footer/announcement copy is replaced in the presentation adapter. Custom admin content is retained.
- Product integration remains paused. No catalog database writes were performed in this update.

Theme update: reference purple (#412b6b), pink (#ef508b), white pages, purple-to-navy announcement bar, and purple footer with decorative pink waves. Supplied Amaze logo and banners remain unchanged. No backend or commerce changes.
