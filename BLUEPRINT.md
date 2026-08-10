# E-Commerce Platform — Development Blueprint
**Stack:** Next.js (App Router) + MongoDB (Mongoose) + Cloudinary + NextAuth (OAuth) + JWT + Payment Gateway
**Scale target:** 200–300 products, 10–20 categories, admin panel, customer storefront
**Purpose of this doc:** Single source of truth so we can build this across multiple chat sessions without re-explaining context. Every future session should start with: *"Continue from Phase X, Step Y"*.

---

## 1. Tech Stack Decision

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14+ (App Router) | API routes + frontend in one codebase |
| Language | TypeScript | Strongly recommended for a project this size |
| Database | MongoDB Atlas + Mongoose | Free tier is enough for 300 products |
| Auth | NextAuth.js (Google OAuth) + custom JWT (email/password) | Hybrid — see Section 5 |
| File/Image storage | Cloudinary | Product images, category banners |
| Payment Gateway | Razorpay | **Confirmed** — Razorpay only, for now |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent, easy to theme per client |
| State (client) | Zustand or React Context | Cart, wishlist, auth state |
| Hosting | Vercel (frontend+API) + MongoDB Atlas (DB) + Cloudinary (media) | All have free tiers to start |
| Email | Resend or Nodemailer + Gmail SMTP | Order confirmations, OTP, password reset |

**Decision confirmed:** Razorpay only, for now. Everything below is built around Razorpay. If international/Stripe support is needed later, we can add it as a second payment method without a major rework (payment logic is isolated in `lib/razorpay.ts` and the `/api/payments/*` routes).

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js App (Vercel)                  │
│                                                             │
│  ┌───────────────┐   ┌────────────────┐   ┌────────────┐ │
│  │  Storefront    │   │  Admin Panel    │   │  Auth       │ │
│  │  /            │   │  /admin/*       │   │  /api/auth  │ │
│  │  /shop        │   │  (role-guarded) │   │  NextAuth + │ │
│  │  /product/[id]│   │                 │   │  JWT        │ │
│  │  /cart        │   │                 │   │             │ │
│  │  /checkout    │   │                 │   │             │ │
│  └───────┬───────┘   └────────┬────────┘   └──────┬──────┘ │
│          │                    │                    │        │
│          └────────────┬───────┴────────────────────┘        │
│                        │  /app/api/**  (route handlers)      │
└────────────────────────┼─────────────────────────────────────┘
                          │
        ┌─────────────────┼──────────────────┐
        ▼                 ▼                  ▼
  ┌───────────┐    ┌─────────────┐    ┌──────────────┐
  │  MongoDB   │    │  Cloudinary  │    │  Razorpay/    │
  │  Atlas     │    │  (images)    │    │  Stripe       │
  └───────────┘    └─────────────┘    └──────────────┘
```

**Key principle:** Everything lives in one Next.js repo — App Router route handlers act as the backend (`/app/api/**`), no separate Express server needed.

---

## 3. Folder Structure

```
ecommerce-app/
├── app/
│   ├── (storefront)/
│   │   ├── page.tsx                    # Home
│   │   ├── shop/page.tsx               # All products + filters
│   │   ├── category/[slug]/page.tsx
│   │   ├── product/[slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── order-success/[id]/page.tsx
│   │   ├── account/
│   │   │   ├── page.tsx                # profile
│   │   │   ├── orders/page.tsx
│   │   │   ├── wishlist/page.tsx
│   │   │   └── addresses/page.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── admin/
│   │   ├── layout.tsx                  # role-guard wrapper
│   │   ├── page.tsx                    # dashboard
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── coupons/page.tsx
│   │   ├── activity-log/page.tsx       # audit log viewer
│   │   └── settings/page.tsx
│   │
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts  # NextAuth (Google OAuth)
│       │   ├── register/route.ts       # JWT signup
│       │   ├── login/route.ts          # JWT login
│       │   ├── refresh/route.ts
│       │   └── logout/route.ts
│       ├── products/
│       │   ├── route.ts                # GET list, POST create (admin)
│       │   └── [id]/route.ts           # GET, PUT, DELETE
│       ├── categories/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── cart/route.ts
│       ├── orders/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── payments/
│       │   ├── razorpay/create-order/route.ts
│       │   └── razorpay/verify/route.ts
│       ├── reviews/route.ts
│       ├── coupons/route.ts
│       ├── audit-logs/route.ts         # GET only, admin — paginated activity feed
│       ├── upload/route.ts             # Cloudinary signed upload
│       └── users/
│           ├── route.ts
│           └── [id]/route.ts
│
├── lib/
│   ├── db.ts                # Mongoose connection singleton
│   ├── auth.ts               # JWT sign/verify helpers
│   ├── nextauth-options.ts
│   ├── cloudinary.ts
│   ├── razorpay.ts
│   └── middleware/
│       ├── requireAuth.ts
│       ├── requireAdmin.ts
│       └── logAdminAction.ts    # writes an AuditLog entry, called from admin write routes
│
├── models/
│   ├── User.ts
│   ├── Product.ts
│   ├── Category.ts
│   ├── Order.ts
│   ├── Review.ts
│   ├── Coupon.ts
│   └── Address.ts
│
├── components/
│   ├── storefront/  (ProductCard, Filters, CartDrawer, etc.)
│   ├── admin/       (DataTable, ProductForm, ImageUploader, etc.)
│   └── ui/          (shadcn components)
│
├── store/            # Zustand stores: useCartStore, useAuthStore
├── types/            # Shared TS types/interfaces
├── middleware.ts      # Next.js middleware for route protection
└── .env.local
```

---

## 4. Database Schema (MongoDB / Mongoose)

### `User`
```ts
{
  name: String,
  email: { type: String, unique: true },
  password: String,          // hashed, optional if OAuth-only user
  provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  avatar: String,             // Cloudinary URL
  phone: String,
  addresses: [{ type: ObjectId, ref: "Address" }],
  wishlist: [{ type: ObjectId, ref: "Product" }],
  isVerified: Boolean,
  createdAt, updatedAt
}
```

### `Category`
```ts
{
  name: String,
  slug: { type: String, unique: true },
  image: String,               // Cloudinary URL
  parentCategory: { type: ObjectId, ref: "Category", default: null }, // supports subcategories
  isActive: Boolean,
  createdAt, updatedAt
}
```

### `Product`
```ts
{
  title: String,
  slug: { type: String, unique: true },
  description: String,
  images: [String],            // Cloudinary URLs, multiple
  category: { type: ObjectId, ref: "Category" },
  price: Number,               // base/default price, used directly for products with no variants
  discountPrice: Number,
  sku: String,
  stock: Number,                // used only for products with no variants; variant stock lives in variantCombinations[]
  variants: [{                 // e.g. "Size", "Color" — the attributes that make up a variant
    name: String,              // e.g. "Size"
    options: [String]          // e.g. ["S","M","L"]
  }],
  variantCombinations: [{      // one entry per sellable combination, each with its own stock
    combination: { type: Map, of: String }, // e.g. { Size: "M", Color: "Red" }
    sku: String,
    stock: Number,
    price: Number,             // optional override of base price for this combination
    image: String               // optional variant-specific image (e.g. per color)
  }],
  tags: [String],
  ratingsAverage: Number,
  ratingsCount: Number,
  isFeatured: Boolean,
  isActive: Boolean,
  createdAt, updatedAt
}
```

### `Order`
```ts
{
  user: { type: ObjectId, ref: "User" },
  items: [{
    product: { type: ObjectId, ref: "Product" },
    title: String, price: Number, quantity: Number, image: String,
    variant: { type: Map, of: String }   // e.g. { Size: "M", Color: "Red" }, empty if no variants
  }],
  shippingAddress: { ... },
  subtotal: Number,
  discount: Number,
  couponCode: String,
  shippingFee: Number,
  total: Number,
  paymentMethod: { type: String, enum: ["razorpay", "cod"] },
  paymentStatus: { type: String, enum: ["pending","paid","failed","refunded"] },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  orderStatus: { type: String, enum: ["placed","processing","shipped","delivered","cancelled"] },
  createdAt, updatedAt
}
```

### `Review`
```ts
{ product: ObjectId, user: ObjectId, rating: Number, comment: String, createdAt }
```

### `Coupon`
```ts
{ code: String, discountType: "percent"|"flat", value: Number, minOrderValue: Number, expiresAt: Date, usageLimit: Number, usedCount: Number, isActive: Boolean }
```

### `Address`
```ts
{ user: ObjectId, fullName: String, phone: String, line1: String, line2: String, city: String, state: String, pincode: String, isDefault: Boolean }
```

### `AuditLog`
```ts
{
  admin: { type: ObjectId, ref: "User" },      // always the single admin, but kept as a ref for clarity/history
  action: String,           // e.g. "PRODUCT_CREATE", "PRODUCT_UPDATE", "PRODUCT_DELETE", "ORDER_STATUS_UPDATE", "CATEGORY_DELETE", "COUPON_CREATE", "LOGIN"
  targetType: String,       // e.g. "Product", "Order", "Category", "Coupon"
  targetId: { type: ObjectId },
  changes: Object,          // optional before/after snapshot or diff, e.g. { before: {...}, after: {...} }
  ipAddress: String,
  createdAt: Date
}
```
*Indexed on `createdAt` (descending) so the admin panel can show a fast, paginated activity feed.*

**Indexes to add:** `Product.slug`, `Product.category`, `Category.slug`, `User.email`, text index on `Product.title + description` for search.

---

## 5. Authentication Strategy (Hybrid: NextAuth + JWT)

You asked for both OAuth and normal JWT login for admin + user — here's how they coexist cleanly:

- **NextAuth.js** handles Google OAuth sign-in for customers (and optionally admin).
- **Custom JWT** handles email/password login for both customers and admin — issued from `/api/auth/login`, stored as an httpOnly cookie.
- Both paths write to the **same `User` model**, so a user has one identity regardless of login method (`provider` field tracks which was used).
- `middleware.ts` checks for a valid session (NextAuth) OR valid JWT cookie on protected routes, and separately checks `role === 'admin'` for `/admin/**`.

**Flow:**
1. Customer registers via email/password → `/api/auth/register` hashes password (bcrypt), creates user, returns JWT in httpOnly cookie.
2. Customer can alternatively "Continue with Google" → NextAuth creates/links account.
3. Admin accounts are created manually (seeded or created by a super-admin) — no public admin signup route, for security.
4. Every protected API route runs `requireAuth()` (checks JWT or NextAuth session) and, for admin routes, `requireAdmin()`.
5. Refresh tokens: short-lived access token (15 min) + longer refresh token (7 days) stored httpOnly, rotated on use.

---

## 6. API Route Map (REST)

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Email/password signup |
| POST | `/api/auth/login` | Public | Email/password login |
| POST | `/api/auth/logout` | Auth | Clear cookies |
| POST | `/api/auth/refresh` | Auth | Rotate access token |
| GET/POST | `/api/auth/[...nextauth]` | Public | Google OAuth |
| GET | `/api/products` | Public | List + filter/search/paginate |
| POST | `/api/products` | Admin | Create product |
| GET | `/api/products/[id]` | Public | Product detail |
| PUT | `/api/products/[id]` | Admin | Update product |
| DELETE | `/api/products/[id]` | Admin | Delete product |
| GET | `/api/categories` | Public | List categories |
| POST | `/api/categories` | Admin | Create category |
| PUT/DELETE | `/api/categories/[id]` | Admin | Update/delete |
| GET/POST | `/api/cart` | Auth | Get/update cart (or client-side cart synced on login) |
| POST | `/api/orders` | Auth | Place order |
| GET | `/api/orders` | Auth/Admin | List own orders / all orders (admin) |
| GET | `/api/orders/[id]` | Auth/Admin | Order detail |
| PUT | `/api/orders/[id]` | Admin | Update order status |
| POST | `/api/payments/razorpay/create-order` | Auth | Create Razorpay order |
| POST | `/api/payments/razorpay/verify` | Auth | Verify payment signature |
| GET/POST | `/api/reviews` | Public/Auth | List/add reviews |
| GET/POST | `/api/coupons` | Admin | Manage coupons |
| POST | `/api/coupons/apply` | Auth | Validate + apply at checkout |
| POST | `/api/upload` | Admin | Signed Cloudinary upload |
| GET | `/api/audit-logs` | Admin | Paginated admin activity feed (filter by action/date) |
| GET | `/api/users` | Admin | Customer list |
| GET/PUT | `/api/users/[id]` | Auth/Admin | Profile view/update |

---

## 7. File Upload (Cloudinary) Flow

1. Admin selects image(s) in product form.
2. Frontend requests a **signed upload signature** from `/api/upload` (never expose API secret client-side).
3. Frontend uploads directly to Cloudinary using that signature (keeps server load low, avoids passing large files through Next.js API routes).
4. Cloudinary returns a secure URL → saved into `Product.images[]`.
5. Use Cloudinary transformation params (`f_auto,q_auto,w_800`) for responsive, optimized delivery — important for 300 products' worth of images.

---

## 8. Payment Gateway Integration (Razorpay)

1. Checkout page → `/api/payments/razorpay/create-order` creates a Razorpay order (amount = cart total in paise) and an internal `Order` doc with `paymentStatus: pending`.
2. Razorpay Checkout widget opens client-side with that order ID.
3. On success, Razorpay returns `payment_id`, `order_id`, `signature` → sent to `/api/payments/razorpay/verify`.
4. Server verifies the signature using Razorpay secret (HMAC) → marks order `paid`, decrements stock, clears cart, sends confirmation email.
5. Also support **Cash on Delivery** as a fallback payment method (simple, expected for many small e-commerce clients).
6. Webhook endpoint (`/api/payments/razorpay/webhook`) as a backup confirmation path in case client closes browser mid-payment.

---

## 9. Admin Panel — Feature List

- Dashboard: total sales, orders today, low-stock alerts, recent orders
- Products: CRUD, bulk image upload, variant builder (add attributes like Size/Color + per-combination stock, price override, SKU), stock management, featured toggle, CSV import (nice-to-have for 200-300 products)
- Categories: CRUD, nested subcategories, drag-to-reorder
- Orders: view/update status, filter by status/date, export CSV
- Customers: view list, order history per customer
- Coupons: create % or flat discounts, expiry, usage limits
- Reviews: moderate (approve/delete)
- Settings: store name/logo, shipping fee rules, currency
- Activity Log: read-only feed of every admin action (create/update/delete on products, categories, orders, coupons), with actor, timestamp, and before/after detail — filterable by action type and date

## 10. Customer-Facing — Feature List

- Home page: banners, featured products, categories grid
- Shop page: filter by category/price/rating, sort, search, pagination
- Product page: image gallery, variant selector (updates price/stock/image based on chosen combination), reviews, related products
- Cart: persistent (localStorage for guest, synced to DB on login)
- Checkout: address form, coupon field, payment method
- Account: order history, order tracking status, wishlist, saved addresses
- Auth: Google login + email/password, password reset via email OTP

---

## 11. Security Checklist

- Passwords hashed with bcrypt (never plaintext)
- httpOnly, secure, sameSite cookies for JWT — never store tokens in localStorage
- Rate-limit auth routes (login, register) to prevent brute force
- Validate/sanitize all inputs server-side (Zod recommended) — never trust client
- Admin routes double-protected: middleware + per-route `requireAdmin()` check
- Every admin write action (create/update/delete on products, categories, orders, coupons) logged to `AuditLog` via `logAdminAction()` — immutable, never editable/deletable from the admin panel itself
- Razorpay signature verification always server-side, never trust client-reported payment success
- Environment secrets only in `.env.local`, never committed

---

## 12. Environment Variables (`.env.local`)

```
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
EMAIL_SERVER_HOST=
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_FROM=
```

---

## 13. Phased Development Roadmap (our build order)

This is the plan we'll follow chat-by-chat. Each phase is a self-contained chunk — tell me the phase number to resume.

**Phase 0 — Project Setup**
Next.js + TS init, Tailwind + shadcn, MongoDB connection (`lib/db.ts`), folder structure scaffold, git repo.

**Phase 1 — Data Models & Seed**
Create all Mongoose models, write a seed script (sample categories + ~20 sample products) to develop against.

**Phase 2 — Authentication**
JWT register/login/logout/refresh routes, bcrypt hashing, NextAuth Google OAuth setup, `middleware.ts` route protection, `requireAuth`/`requireAdmin` helpers, `AuditLog` model + `logAdminAction()` helper (also logs admin login events).

**Phase 3 — Admin Panel: Products & Categories**
Admin layout + role guard, category CRUD UI, product CRUD UI, Cloudinary signed upload + image uploader component, variant builder UI, activity-log page wired to the audit trail from every CRUD action.

**Phase 4 — Storefront: Browsing**
Home page, shop/listing page with filters+search+pagination, category pages, product detail page.

**Phase 5 — Cart & Checkout**
Cart store (Zustand) + persistence, checkout page, address management, coupon apply logic.

**Phase 6 — Payments**
Razorpay order creation + checkout widget + signature verification + webhook, order confirmation flow, COD fallback.

**Phase 7 — Orders & Account**
Order placement finalization, customer order history/tracking, admin order management screen, email notifications.

**Phase 8 — Reviews, Wishlist, Polish**
Reviews system, wishlist, admin dashboard analytics, SEO metadata, loading/error states, responsive QA.

**Phase 9 — Deployment**
Vercel deploy, MongoDB Atlas prod cluster, env var setup, custom domain, basic load/security check before client handoff.

---

## 14. How We'll Use This Document Going Forward

- Start each new session with: *"Let's do Phase N"* or *"Continue Phase N, Step X"*.
- If scope changes (e.g., swap Razorpay→Stripe, add multi-vendor support), we update this file first, then code — so it stays the single source of truth.
- Keep this file in your project root as `BLUEPRINT.md` so it also documents the project for the client.

---

### Open decisions before we start coding (Phase 0)
1. **Confirmed:** Product variants are in scope — each variant combination (e.g. Size + Color) gets its own stock, optional price override, SKU, and image.
2. **Confirmed:** Single-store setup, one seller (not multi-vendor). No seller accounts, dashboards, or commission/payout logic needed.
3. **Confirmed:** Single admin account only (no staff roles for now), with **audit logging** on all admin actions.

All scope questions are resolved — ready to start Phase 0.
