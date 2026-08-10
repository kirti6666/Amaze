# User Guide — Coupons & Invoicing for Your Store

A practical guide for running the coupon and invoicing features from your admin
dashboard. No technical knowledge needed. Written for a store owner / manager.

---

# Part 1 — Coupons

## 1.1 What coupons do

Coupons are discount codes your customers type in (or tap) at checkout to get
money off — for example `WELCOME10` for 10% off. You create and control them from
**Admin → Coupons**.

You decide:
- the **code** customers use,
- whether it's a **percentage** (e.g. 10% off) or a **flat amount** (e.g. ₹200 off),
- a **minimum order value** before it can be used,
- an **expiry date**,
- how many times it can be used in total,
- and whether it's currently **active**.

## 1.2 Creating a coupon (step by step)

1. Go to **Admin → Coupons**.
2. In the **Create coupon** form, fill in:
   - **Code** — what customers type, e.g. `FESTIVE20`. It's automatically uppercased.
   - **Discount type** — *Percent (%)* or *Flat amount*.
   - **Value** — `20` means 20% (percent) or ₹20 (flat).
   - **Min. order value** — e.g. `999` means the cart must be at least ₹999. Use `0` for no minimum.
   - **Expires on** — the last day the coupon works.
   - **Usage limit** — total number of times it can be redeemed. Use `0` for **unlimited**.
   - **Active** — tick to make it live immediately.
3. Click **Create coupon**. It appears in the list below.

## 1.3 Managing existing coupons

In the coupon list you can see, at a glance, each coupon's discount, minimum
order, **usage** (e.g. `12 / 100` used, or `12 / ∞` for unlimited), expiry, and a
status pill:

- **Active** (green) — live and usable.
- **Inactive** (grey) — switched off.
- **Expired** (red) — past its date.
- **Used up** (orange) — hit its usage limit.

Actions:
- **Click the status pill** to quickly turn a coupon on/off.
- **Pencil icon** — edit any detail, then **Save changes**.
- **Trash icon** — delete it permanently.

## 1.4 What your customers see

At checkout, customers can:
- **Type a code** into the coupon box and press **Apply**.
- **See "Available offers"** — your active coupons shown as tappable chips. One tap
  applies the code. If their cart is below a coupon's minimum, it shows
  "Add ₹X more to use" and stays disabled until they qualify.

Trying a code is free — customers can apply and remove codes without "using them
up". A coupon only counts as used once an order is actually **placed** (for online
payments, once payment succeeds).

## 1.5 Demo: a "first order" welcome offer

Goal: give new shoppers 10% off orders over ₹500, capped at the first 500 uses.

1. **Admin → Coupons → Create coupon:**
   - Code: `WELCOME10`
   - Discount type: **Percent (%)**, Value: `10`
   - Min. order value: `500`
   - Expires on: (say) 3 months out
   - Usage limit: `500`
   - Active: ✅
2. **Save.** Now:
   - A shopper with a ₹1,200 cart applies `WELCOME10` → gets ₹120 off.
   - A shopper with a ₹300 cart sees "Add ₹200 more to use".
   - After 500 redemptions, the coupon shows **Used up** and stops working.
   - When it passes its date, it shows **Expired**.

## 1.6 Demo: a flat festive discount

Goal: ₹200 off any order during a sale, unlimited uses, for two weeks.

- Code: `FESTIVE200`, type **Flat amount**, Value `200`, Min. order value `0`,
  Usage limit `0` (unlimited), Expiry two weeks out, Active ✅.
- A ₹150 cart applying it gets ₹150 off (a flat discount never exceeds the cart
  total). A ₹2,000 cart gets ₹200 off.

## 1.7 Coupon tips

- **Turn off instead of delete** if you might reuse a campaign — toggle it
  Inactive and back on later.
- **Usage limit `0` = unlimited.** Set a real number for limited promos.
- **Minimum order value** is the lever for protecting margins on percentage codes.
- Percent codes are capped at 100%. Flat codes can't discount below ₹0.

---

# Part 2 — Invoicing (GST Tax Invoices)

## 2.1 What the invoicing system does

For every order, your store generates a proper **GST tax invoice** as a PDF. It is:
- **emailed to the customer** with their order confirmation, and
- **downloadable** by the customer from their order page, and by you from the
  admin.

The invoice includes your business and GST details, the customer's billing/shipping
details, each product with HSN code and tax, the CGST/SGST or IGST breakup,
delivery charges, discounts, the grand total, and the amount in words — everything
a real e-commerce invoice needs.

## 2.2 One-time setup (do this first!)

Go to **Admin → Invoicing** and fill in your details across the tabs. Until you
do, invoices will print with a blank business section.

### Tab: Seller & GSTIN
Your legal business identity — printed as the supplier on every invoice. Fill in:
- **Legal name** (as registered) and **Trade name** (your brand).
- Full **address**, **city**, **state**, **PIN code**.
- **State code** — the **2-digit GST state code** (e.g. `06` Haryana, `27`
  Maharashtra, `07` Delhi). *This is the most important field* — see below.
- **GSTIN** (15 characters), **PAN**, and **CIN** if you have one.
- Contact **email**, **phone**, **website**.

> **Why the state code matters:** GST is split based on where you and your
> customer are.
> - Customer in the **same state** as you → the tax shows as **CGST + SGST**.
> - Customer in a **different state** → the tax shows as **IGST**.
>
> If you leave the state code blank, every invoice safely defaults to CGST + SGST.

### Tab: Tax
- **Charge GST** — turn off only if you don't bill GST at all (removes tax columns).
- **Default GST rate (%)** — e.g. `18`. Applied to every product.
- **Default HSN / SAC code** — the tax classification code for your products.
- **Product prices already include GST** — **leave this ON** (recommended). Your
  checkout total doesn't add tax on top, so with this on, the invoice total
  matches exactly what you charged. (If you turn it off, tax is *added on top* and
  the invoice total will be higher than what the customer paid — the screen warns
  you about this.)
- **Shipping HSN / rate** — tax treatment for delivery charges (default `996812`,
  18%).
- **Round the grand total** — rounds to the nearest rupee and shows a round-off line.

### Tab: Numbering
Controls what your invoice numbers look like:
- **Prefix** — e.g. `INV`.
- **Digits** — `5` produces `00042`.
- **Next number** — the next sequence to use. *You can raise this to continue from
  a previous system, but it can't be lowered* (reusing an invoice number isn't
  allowed).
- **Include financial year** — adds the Indian FY, e.g. `INV/2026-27/00042`.
- **Restart each financial year** — standard practice; numbering resets to 1 each
  April.

A live preview shows exactly how the next number will look.

### Tab: Document
The wording printed on the invoice: **title** (e.g. TAX INVOICE), **declaration**,
**terms & conditions**, **notes**, **footer**, and **signature label**. Toggles let
you show/hide the **amount in words**, the **HSN/SAC tax summary**, and **bank
details**. There's also the switch to **attach the invoice PDF to the order email**.

### Tab: Bank
Your account details (only printed if "Show bank details" is on in the Document tab).

When done, click **Save changes**.

## 2.3 Day-to-day: nothing to do

Once set up, invoicing is automatic. When an order is placed (or paid, for online
payments), the invoice is created, numbered, emailed to the customer, and stored.

## 2.4 Finding and downloading invoices

- **Customers** download theirs from **My Account → Orders → (an order) → Download
  Invoice**, and receive it by email.
- **You (admin)** have two places:
  - **Admin → Orders** — each order has an **Invoice** link.
  - **Admin → Invoicing → Invoice Register** — a searchable list of every invoice
    with **totals for invoiced value and tax collected** (handy for GST filing).
    Search by invoice number or customer, and view/download any invoice.

## 2.5 Demo: your first live invoice

1. Complete the **Seller & GSTIN** tab, making sure **State code** is set (e.g.
   `06`), and set **Default GST rate** to `18` on the Tax tab.
2. Place a test order in the store (or have a customer place one).
3. Check the confirmation email — the invoice PDF is attached.
4. Open **Admin → Invoicing → Invoice Register** — the invoice is listed, tagged
   **(CGST+SGST)** if the customer is in your state or **(IGST)** if not.
5. Click **view** to see the finished document: your business at the top, the
   customer's details, itemised products with tax, the totals with the correct tax
   split, amount in words, and the HSN summary.

## 2.6 Reading a tax invoice (what each part means)

- **CGST + SGST** — shown when the customer is in your state; the GST is split into
  two equal halves.
- **IGST** — shown when the customer is in a different state; a single combined tax.
- **Taxable Value** — the price before tax (tax is worked out from this).
- **HSN/SAC Summary** — a small table grouping tax by product classification and
  rate; required for GST returns.
- **Round Off** — a few paise added/removed so the total is a whole rupee.
- **Amount in Words** — the grand total spelled out, as required on invoices.

## 2.7 Important settings to get right

- **State code** decides CGST+SGST vs IGST — set it correctly.
- **Keep "prices include GST" ON** unless your catalogue prices genuinely exclude
  tax, so invoice totals match what customers actually paid.
- **Invoice numbering** should be continuous — don't lower the next number.
- Fill in **GSTIN/PAN** accurately; they're printed as your legal identity.

## 2.8 Frequently asked questions

**Do I need to generate invoices manually?**
No. They're created automatically when an order is confirmed.

**Can I change an invoice after it's issued?**
No — invoices are locked once issued, as required for legal/tax records. If you
change your GST rate or address later, past invoices keep their original details;
only new invoices use the new settings.

**A customer wants their invoice again — what do I do?**
They can re-download it any time from their order page, or you can open it from
**Admin → Orders** or the **Invoice Register**.

**We don't charge GST — can I still use this?**
Yes. On the **Tax** tab, turn **Charge GST** off. Invoices then print without tax
columns.

**Can different products have different GST rates?**
Not yet — currently one default rate applies to all products. Ask your developer;
it's a supported future enhancement.

---

*Both systems are managed entirely from your admin dashboard — Coupons under
**Admin → Coupons**, and invoicing under **Admin → Invoicing**.*
