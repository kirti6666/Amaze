# E-Commerce App — Development Log

Built from `BLUEPRINT.md` phase by phase: Next.js (App Router) + TypeScript + Tailwind + MongoDB + Cloudinary + Razorpay. No separate Node/Express server — API routes live in `app/api/**` and act as the backend.

## Setup (run these on your own machine)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in values as you go through the phase-specific setup steps below. `MONGODB_URI` is needed from Phase 0 onward — everything else is needed starting the phase noted.

3. **Run the dev server**
   ```bash
   npm run dev
   ```

## What's included so far
- `app/` — App Router pages and API routes
- `lib/db.ts` — Mongoose connection singleton
- `models/` — all Mongoose schemas (User, Product, Category, Order, Review, Coupon, Address, AuditLog)
- `scripts/seed.ts` — sample categories/products + 1 admin user
- Full JWT + Google OAuth auth, with route protection middleware
- Admin panel: products (with variants), categories, Cloudinary image upload, activity log
- Storefront: home, shop (filters/search/pagination), category pages, product detail with variant selection

## Not included yet (upcoming phases)
- Cart, checkout — Phase 5
- Razorpay payments — Phase 6
- Order history, reviews, wishlist — Phase 7-8
- See `BLUEPRINT.md` for the full phase-by-phase plan

---

## Phase 0: Verify the DB connection
Visit `http://localhost:3000/api/health` → should return `{ "status": "ok", "db": "connected" }`.
If it errors, double check `MONGODB_URI` (make sure your IP is allow-listed in Atlas, or allow `0.0.0.0/0` for local dev).

## Phase 1: Seed the database
```bash
npm run seed
```
Creates 12 categories, ~30 products (some with Size/Color variants), and 1 admin user:
`admin@example.com` / `ChangeMe123!` — change this after first login.

## Phase 2: Auth setup

1. **Generate JWT secrets** (two different random strings). On Mac/Linux/WSL:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Run it twice, paste the two outputs into `.env.local` as `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
   Generate one more the same way for `NEXTAUTH_SECRET`.

2. **Set up Google OAuth** (optional — only needed to test "Continue with Google"):
   - [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → create an OAuth 2.0 Client ID (Web application)
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID / Secret into `.env.local` as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

3. **Test it:**
   - Visit `/register`, create a customer account → redirects to `/account`
   - Log in as the seeded admin → redirects to `/admin`
   - Logged out, visit `/admin` → redirected to `/login`
   - Logged in as a customer, visit `/admin` → redirected to `/`
   - Check Atlas `auditlogs` collection → should have a `LOGIN` entry after the admin logs in

## Phase 3: Admin panel + Cloudinary setup

1. **Get Cloudinary credentials** (free tier is enough):
   - Sign up at [cloudinary.com](https://cloudinary.com) → dashboard → copy **Cloud Name**, **API Key**, **API Secret**
   - Add to `.env.local`:
     ```
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```

2. **Test it:**
   - Log in as admin → **Categories** → add one, toggle Active/Inactive
   - **Products → New Product** → fill the form, upload 1-2 images, turn on "This product has variants", add `Size` with `S, M, L` → confirm the stock table auto-generates
   - Save → edit it → delete it
   - **Activity Log** → confirm `PRODUCT_CREATE` / `UPDATE` / `DELETE` / `CATEGORY_CREATE` entries appear
   - Try deleting a category that still has products → should be blocked with a clear error

## Phase 4: Storefront browsing

No new env vars needed. Test checklist:
- Visit `/` → hero, category grid, featured products
- Click a category tile → `/category/[slug]` filters correctly
- Visit `/shop` → search box, category dropdown, sort options all update the URL and reset pagination
- Click a variant product (e.g. "Classic Cotton T-Shirt") → clicking Size/Color buttons updates stock; simple products show flat stock
- Header shows "Login" logged out, "My Account"/"Admin" logged in depending on role

## Next step
Once browsing works end-to-end, say **"Phase 4 confirmed, start Phase 5"** and we'll build the cart (persisted per user) and checkout flow, including address management and coupon codes.

## Phase 5: Cart & Checkout

No new env vars needed. Re-run the seed script to get the sample coupon:
```bash
npm run seed
```

**Design notes:**
- Cart lives entirely client-side (Zustand + localStorage) until checkout — there's no separate Cart collection in MongoDB, matching the blueprint's schema (only `Order` is persisted). This means a logged-out visitor can add to cart; they're only asked to log in at checkout.
- Every price and stock check is **recomputed server-side** in `/api/orders` — the client's cart data is only used to know *which* products/quantities/variants were selected, never trusted for price.
- Payment method is COD-only for now — Razorpay is wired into the schema/UI as a visibly "coming soon" option, ready for Phase 6 to activate.

**Test checklist:**
- Add a few products to cart (including a variant product) → header shows live count
- `/cart` → adjust quantities, remove an item, quantity is capped at available stock
- `/checkout` (while logged out) → should redirect to `/login`
- Logged in with no saved address → address form shows automatically
- Add an address → appears in the list, becomes default automatically (first address)
- Apply coupon `WELCOME10` → should show 10% off (cart must be ≥ ₹500 subtotal)
- Place the order → redirects to `/order-success/[id]` showing items, address, totals
- Check MongoDB Atlas: new `orders` document, and the product's stock (or that variant's stock) should be reduced
- Visit `/account/addresses` → manage saved addresses independent of checkout

## Next step
Once checkout works end-to-end with COD, say **"Phase 5 confirmed, start Phase 6"** and we'll wire up Razorpay: order creation, the checkout widget, signature verification, and the webhook fallback.

## Phase 6: Razorpay Payments

1. **Get Razorpay test keys:**
   - Sign up at [razorpay.com](https://razorpay.com) → Dashboard → make sure you're in **Test Mode** (toggle top-right)
   - Settings → API Keys → Generate Test Key → copy Key ID and Key Secret into `.env.local`:
     ```
     RAZORPAY_KEY_ID=rzp_test_xxxxx
     RAZORPAY_KEY_SECRET=xxxxx
     NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
     ```
     (Yes, `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` are the same value — one is used server-side, the public one is sent to the browser for the checkout widget.)

2. **Webhook (optional for local dev):**
   The webhook (`/api/payments/razorpay/webhook`) is a backup path for when a payment succeeds but the browser doesn't make it back to `/verify` (closed tab, crash, etc.) — the primary `/verify` flow alone is enough to fully test checkout locally. To set up the webhook later (needed for production, or if you want to test it now via a tunnel like ngrok):
   - Razorpay Dashboard → Webhooks → Add New Webhook
   - URL: `https://<your-domain-or-ngrok-url>/api/payments/razorpay/webhook`
   - Active events: `payment.captured`
   - Set a webhook secret and add it to `.env.local` as `RAZORPAY_WEBHOOK_SECRET`

3. **Test it (use Razorpay's test card):**
   ```bash
   npm run dev
   ```
   - Add items to cart → checkout → select **Pay Online (Razorpay)**
   - Razorpay's checkout widget should open — use test card `4111 1111 1111 1111`, any future expiry, any CVV, any name
   - On success → should redirect to `/order-success/[id]` showing "Paid Online (Razorpay)" and "Payment Confirmed"
   - Check Atlas: order has `paymentStatus: "paid"`, `razorpayPaymentId` set, and stock decreased
   - Try the **modal close (X)** mid-payment → should show "Payment cancelled" and NOT decrement stock (check Atlas — that abandoned order stays `pending` forever, which is expected/acceptable for MVP)
   - Confirm COD still works exactly as before (Phase 5 didn't change)

## Next step
Once Razorpay payments work end-to-end, say **"Phase 6 confirmed, start Phase 7"** and we'll build: customer order history/tracking pages, the admin order management screen (update order status), and email notifications.

## Phase 7: Order History, Admin Order Management, Email Notifications

**Test checklist:**
- `/account/orders` → shows your order history, click one → `/account/orders/[id]` shows a visual status tracker (Placed → Processing → Shipped → Delivered)
- Admin → **Orders** (`/admin/orders`) → see every order across all customers, filter by status, change `orderStatus` or `paymentStatus` right from the dropdowns inline
- Change an order's status as admin → check the customer's inbox (or your terminal log, if email isn't configured yet) for a status-update email
- Place a new order (COD or Razorpay) → check for an order confirmation email
- Check Atlas `auditlogs` → should show an `ORDER_STATUS_UPDATE` entry whenever you change a status as admin

**Email setup (optional for local dev):** if you don't set `EMAIL_SERVER_HOST` etc. in `.env.local`, emails are just logged to the terminal instead of failing — order placement and status updates work either way. To actually receive emails locally:
- **Easiest for testing:** [Mailtrap](https://mailtrap.io) (free sandbox inbox, nothing is really sent to real addresses) — copy their SMTP host/port/user/password into `.env.local`
- **For real delivery:** Gmail with an [App Password](https://myaccount.google.com/apppasswords) (`EMAIL_SERVER_HOST=smtp.gmail.com`, `EMAIL_SERVER_PORT=587`, `EMAIL_SERVER_USER=you@gmail.com`, `EMAIL_SERVER_PASSWORD=<app password>`)

## Next step
Once order tracking and admin management check out, say **"Phase 7 confirmed, start Phase 8"** and we'll build: product reviews, wishlist, admin dashboard analytics, SEO metadata, and general polish/responsive QA.
