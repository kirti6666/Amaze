# PayPlus payments

Implemented against [PayPlus API reference](https://payplus.live/docs): hosted pay-in checkout, authenticated status checks, and HMAC-SHA256 webhooks.

## Add your credentials

Set these in `.env.local` for development and your host's secret environment settings for deployment:

```dotenv
PAYPLUS_API_KEY=
PAYPLUS_WEBHOOK_SECRET=
```

Copy the API key and webhook signing secret from PayPlus → Developer. Keep both server-side. Restart `npm run dev` after editing. Enable **PayPlus (online payments)** in Admin → Settings → Commerce. The store currency must be INR. No Razorpay key is needed for the PayPlus checkout.

In PayPlus → Developer → Integration Settings, set the callback URL to:

```text
https://YOUR-STORE-DOMAIN/api/payments/payplus/webhook
```

PayPlus cannot call localhost. Use your deployed HTTPS domain or a development HTTPS tunnel to test callbacks. The local payment page also checks payment status on the server, so it can reconcile without a local callback.

## Local preview

Run these in separate VS Code terminals:

```sh
npm run preview:db
npm run dev
```

The preview database is a MongoDB replica set at `mongodb://127.0.0.1:27018/store_preview`, with data stored in the ignored `.preview-data` folder. It is independent of Docker. For a fresh local database only, `npm run seed` loads sample products and creates `admin@example.com` / `ChangeMe123!`. The seed script clears catalogue data; do not run it against production.

Open http://localhost:3000. Production MongoDB must support transactions (MongoDB Atlas or a replica set).

## Payment behavior

- Prices, quantities, discounts, and shipping are calculated on the server.
- Shipping is free for every order, with no minimum order value. Old database shipping fees are overridden by the store-wide policy.
- The server creates a PayPlus pay-in with the local order id as `merchantOrderId` and a rupee amount, then stores the hosted payment URL.
- The customer opens PayPlus from `/payment/[id]`, completes payment, and returns to the store. This page checks status every 15 seconds for up to ten minutes and offers a manual check.
- Only a successful authenticated PayPlus status response with matching local id, gateway id, and gross amount marks the order paid. Redirects and browser claims cannot mark orders paid.
- Signed `payin.success` webhooks use the same reconciliation path. Stock, coupon usage, and payment status commit in one transaction, so concurrent webhook and browser checks do not apply inventory changes twice.
- Confirmation email and invoice use the existing email setup. Payment remains confirmed if email delivery fails.
- The existing stock model checks availability before payment but does not reserve it during hosted checkout. Concurrent purchases of the last units can still require manual fulfilment or refund handling. Refund execution and automatic inventory reservations are outside this integration.

## Validation

The merchant's PayPlus pay-in limits also apply to test purchases made with live
keys. A ₹1 order was rejected with `Amount outside merchant pay-in limits`.
Confirm the minimum allowed amount with PayPlus or ask PayPlus to enable ₹1
payments for your merchant account; changing the product price cannot override
gateway limits. Checkout now displays this specific failure instead of a generic
payment-start error.

With the preview database running:

```sh
npm run test:payments
npx tsc --noEmit
```

Tests use simulated PayPlus responses and a unique disposable local database. No live transaction is created. Before launch, complete a merchant-approved payment and check the order, webhook delivery, invoice, and stock. This repository's existing dependency audit findings also require review before production deployment.
