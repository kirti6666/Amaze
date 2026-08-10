# Tiger — Setup Guide

Next.js 14 (App Router) + TypeScript + Tailwind + MongoDB + Cloudinary + Razorpay.
There is no separate backend server — the API routes in `app/api/**` are the backend.

---

## 1. Install

```bash
npm install
```

Requires **Node.js 18.17 or newer**. Check with `node -v`.

---

## 2. Create your env file

```bash
cp .env.local.example .env.local
```

Only the first four values below are required to run the site. Everything else is optional.

---

## 3. Required keys

### MONGODB_URI

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a free **M0 cluster**
3. **Database Access** -> Add New Database User -> set a username and password
4. **Network Access** -> Add IP Address -> for local dev choose *Allow access from anywhere* (`0.0.0.0/0`)
5. **Database** -> Connect -> Drivers -> copy the connection string

Replace `<password>` with your real password and add a database name after the slash:

```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abcde.mongodb.net/tiger?retryWrites=true&w=majority
```

> If your password contains `@ : / ? # [ ] %` it must be URL-encoded or the connection fails. A password of `p@ss` becomes `p%40ss`.

### The three secrets

Already generated for you — fine for local development. **Generate new ones before deploying to production.**

```
JWT_ACCESS_SECRET=2bf7e7075ae97df10ae23302fac4da5c38e802657064beac52feef426d6a3011
JWT_REFRESH_SECRET=c11f1ae2cd84ddc6e3e1e001f13e7c8e33d8830d057cf0006dd2d84d3e1bd400
NEXTAUTH_SECRET=2edc2452a7154e4ef3c2270824cb941e6134e4b48f4bba1dd45f56cbb5d8afbd
```

To make your own:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### NEXTAUTH_URL

```
NEXTAUTH_URL=http://localhost:3000
```

Change to your real domain when you deploy.

---

## 4. Seed the database

```bash
npm run seed
```

Creates 6 categories, 12 products, 5 combos, site settings, 1 coupon, and 1 admin user.

> **Warning:** this deletes all existing products, categories, coupons, settings and admin users first. Never run it against live data.

---

## 5. Run it

```bash
npm run dev
```

- Storefront: **http://localhost:3000**
- Admin panel: **http://localhost:3000/admin**

**Admin login:** `admin@example.com` / `ChangeMe123!`
Change this password after your first login.

---

## 6. Verify it works

| Check | Where | Expected |
|---|---|---|
| Database connected | `/api/health` | `{"status":"ok","db":"connected"}` |
| Homepage | `/` | Marquee bar, hero, 5 goal icons, product rails |
| Shop | `/shop` | 17 products, search and filters work |
| Product page | click any product | Full description, add to cart |
| Cart | `/cart` | Quantity changes; coupon `WELCOME10` gives 10% off above Rs 500 |
| Checkout (COD) | `/checkout` | Redirects to login, then places the order |
| Admin | `/admin` | Light theme, not dark |
| Admin theme | `/admin/settings` -> Theme | 8 colour pickers; storefront updates on save |
| Admin products | `/admin/products` | Edit any product; Featured + Bestseller checkboxes |

---

## 7. Optional keys

### Cloudinary — product image uploads

Without this, products show a styled "No image" placeholder and the admin upload button fails.

1. Sign up free at [cloudinary.com](https://cloudinary.com)
2. Dashboard -> copy **Cloud Name**, **API Key**, **API Secret**

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Razorpay — online payments

Without this, **cash on delivery still works fully**. Only card/UPI needs it.

1. Sign up at [razorpay.com](https://razorpay.com), switch to **Test Mode** (toggle, top right)
2. Settings -> API Keys -> Generate Test Key

```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

`RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` are the same value — one is used server-side, the public one goes to the browser widget.

Test card: `4111 1111 1111 1111`, any future expiry, any CVV.

### Google login

Optional — email/password signup works without it.

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) -> Create OAuth 2.0 Client ID (Web application)
2. Authorised redirect URI: `http://localhost:3000/api/auth/callback/google`

```
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
```

### Email

Without this, emails print to your terminal instead of sending — order placement still works.

Easiest for testing is [Mailtrap](https://mailtrap.io), a free sandbox inbox:

```
EMAIL_SERVER_HOST=sandbox.smtp.mailtrap.io
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_mailtrap_user
EMAIL_SERVER_PASSWORD=your_mailtrap_password
EMAIL_FROM=orders@tiger.in
```

For Gmail use an [App Password](https://myaccount.google.com/apppasswords), not your login password.

---

## Troubleshooting

**`MONGODB_URI is not set`** — the file must be named exactly `.env.local` in the project root, not `.env`. Restart the dev server after editing it.

**`MongooseServerSelectionError`** — your IP isn't allow-listed in Atlas -> Network Access, or the password isn't URL-encoded.

**Homepage rails are empty** — you haven't run `npm run seed`.

**Admin panel looks dark** — hard-refresh (Ctrl+Shift+R). Admin resets its own colour variables and should always be light.

**Fonts look wrong** — Archivo, Instrument Sans and IBM Plex Mono download at build time. A blocked network falls back to system fonts.

**Port 3000 already in use** — `npm run dev -- -p 3001`

---

## What's configurable without touching code

Everything under **/admin/settings**:

- Store name, tagline, logo, favicon
- All 8 theme colours — storefront only; the admin panel is isolated and never changes
- Hero title, subtitle, buttons, background image
- Marquee announcement text — separate messages with `·`
- The four trust-bar highlights
- Combos / Bestsellers / Offers rails — heading, subheading, on/off
- Nav links, footer columns, contact details, social links
- Currency, shipping fee, free-shipping threshold, COD and Razorpay toggles

Products, categories, coupons, orders, invoices and reviews each have their own admin page.

---

## Project structure

```
app/(storefront)/   customer-facing pages
app/admin/          admin panel (light theme, isolated)
app/api/            the backend — all API routes
components/         storefront + admin React components
lib/                db, auth, validation, email, invoices
models/             Mongoose schemas
scripts/catalog.ts  product data (edit copy here)
scripts/seed.ts     seeding logic
```
