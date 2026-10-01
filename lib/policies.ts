/**
 * Content for the storefront policy pages (/policies/*), linked from the
 * footer's built-in "Policies" column.
 *
 * Copy is written once here and personalised at render time with the store
 * name and contact details from Site Settings, so renaming the store or
 * changing the support email in /admin/settings updates every policy too.
 *
 * Each section body is a list of blocks: a plain string is a paragraph, a
 * `{ list }` is a bullet list. Keep section ids stable — they are the anchors
 * used by the "On this page" index and by any deep links shared with customers.
 */

export type PolicyBlock = string | { list: string[] };

export interface PolicySection {
  id: string;
  heading: string;
  body: PolicyBlock[];
}

export interface PolicyContext {
  store: string;
  email: string;
  phone: string;
  address: string;
}

export interface Policy {
  slug: string;
  title: string;
  /** Short label used in the footer and the side navigation. */
  navLabel: string;
  /** One-line description shown on the hub cards and as the meta description. */
  summary: string;
  icon: "shield" | "file" | "truck" | "rotate" | "cancel";
  updated: string;
  /** Three quick facts shown above the full text. */
  highlights: (c: PolicyContext) => string[];
  sections: (c: PolicyContext) => PolicySection[];
}

const UPDATED = "1 October 2026";

/** "write to us at x" / "contact our support team" depending on what's configured. */
function reach(c: PolicyContext) {
  if (c.email && c.phone) return `email us at ${c.email} or call ${c.phone}`;
  if (c.email) return `email us at ${c.email}`;
  if (c.phone) return `call us at ${c.phone}`;
  return "contact our customer support team";
}

export const POLICIES: Policy[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    navLabel: "Privacy Policy",
    summary: "What personal information we collect, why we collect it and how we keep it safe.",
    icon: "shield",
    updated: UPDATED,
    highlights: () => [
      "We never sell your personal data",
      "Card details are handled by our payment partner, not stored by us",
      "You can ask us to access, correct or delete your data",
    ],
    sections: (c) => [
      {
        id: "overview",
        heading: "Overview",
        body: [
          `This Privacy Policy explains how ${c.store} ("we", "us", "our") collects, uses, shares and protects your personal information when you visit our website, create an account or place an order. By using our website you agree to the practices described here.`,
        ],
      },
      {
        id: "information-we-collect",
        heading: "Information we collect",
        body: [
          "We only collect what we need to run the store and deliver your orders:",
          {
            list: [
              "Contact details — your name, email address and mobile number.",
              "Delivery details — shipping and billing addresses you save or enter at checkout.",
              "Account details — login credentials (passwords are stored in encrypted, hashed form) or the basic profile shared by Google if you sign in with Google.",
              "Order details — products purchased, order value, payment status and invoices.",
              "Technical details — device and browser type, IP address and pages visited, collected through essential cookies.",
            ],
          },
        ],
      },
      {
        id: "how-we-use",
        heading: "How we use your information",
        body: [
          {
            list: [
              "To process, ship and deliver your orders and send order updates by email or SMS.",
              "To verify your identity at checkout, including one-time passwords (OTP) sent to your phone.",
              "To provide customer support and handle returns, refunds and cancellations.",
              "To keep your cart, wishlist and saved addresses available across visits.",
              "To prevent fraud, secure our website and meet legal, tax and accounting obligations.",
              "To send offers and updates — only where you have agreed, and you can opt out at any time.",
            ],
          },
        ],
      },
      {
        id: "payments",
        heading: "Payments",
        body: [
          "Online payments are processed by our secure, PCI-DSS compliant payment partners. Your card, UPI or net-banking details are entered on the partner's secure page and are never stored on our servers. We only receive a confirmation of whether the payment succeeded, along with a transaction reference.",
        ],
      },
      {
        id: "sharing",
        heading: "Who we share it with",
        body: [
          "We do not sell or rent your personal information. We share it only with trusted partners who help us run the store, and only as much as they need:",
          {
            list: [
              "Payment gateways, to process your payment.",
              "Courier and logistics partners, to deliver your order.",
              "Email, SMS and hosting providers, to send notifications and run the website.",
              "Government or law-enforcement authorities, where required by law.",
            ],
          },
        ],
      },
      {
        id: "cookies",
        heading: "Cookies",
        body: [
          "We use essential cookies to keep you signed in, remember your cart and keep the website secure. You can block cookies in your browser settings, but parts of the website such as login and checkout may stop working.",
        ],
      },
      {
        id: "security-retention",
        heading: "Security and data retention",
        body: [
          "Your data is transmitted over encrypted (HTTPS) connections and stored with access limited to authorised staff. We keep personal information only for as long as your account is active or as needed to fulfil orders and meet legal, tax and accounting requirements, after which it is deleted or anonymised.",
        ],
      },
      {
        id: "your-rights",
        heading: "Your rights",
        body: [
          `You can view and update most of your details from your account at any time. You may also ask us to give you a copy of your data, correct it, or delete your account. To make a request, ${reach(c)}. We will respond within 30 days.`,
        ],
      },
      {
        id: "changes",
        heading: "Changes to this policy",
        body: [
          "We may update this policy from time to time. The latest version will always be available on this page with the date it was last updated.",
        ],
      },
    ],
  },
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    navLabel: "Terms & Conditions",
    summary: "The rules for using our website and buying from our store.",
    icon: "file",
    updated: UPDATED,
    highlights: () => [
      "Prices are in Indian Rupees and include applicable taxes",
      "An order is confirmed only after successful payment",
      "Disputes are subject to Indian law",
    ],
    sections: (c) => [
      {
        id: "acceptance",
        heading: "Acceptance of terms",
        body: [
          `These Terms & Conditions govern your use of the ${c.store} website and any purchase you make from us. By browsing the website or placing an order, you agree to these terms together with our Privacy Policy, Shipping Policy and Return & Refund Policy. If you do not agree, please do not use the website.`,
        ],
      },
      {
        id: "eligibility-accounts",
        heading: "Eligibility and accounts",
        body: [
          {
            list: [
              "You must be at least 18 years old, or use the website under the supervision of a parent or guardian.",
              "You can shop as a guest or create an account. You are responsible for keeping your login details confidential and for all activity under your account.",
              "Please provide accurate name, phone, email and address details — we cannot be responsible for failed deliveries caused by incorrect information.",
            ],
          },
        ],
      },
      {
        id: "products-pricing",
        heading: "Products and pricing",
        body: [
          {
            list: [
              "All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.",
              "We try to display products, colours and descriptions as accurately as possible, but small variations from the images may occur.",
              "Prices, offers and availability may change without notice. The price that applies is the one shown at checkout when you place your order.",
              "In the rare case of an obvious pricing or listing error, we may cancel the order and refund any amount paid in full.",
            ],
          },
        ],
      },
      {
        id: "orders-payment",
        heading: "Orders and payment",
        body: [
          "Placing an order is an offer to buy. Your order is confirmed only once payment is successfully received and you receive an order confirmation. We may refuse or cancel an order if a product is out of stock, if we cannot deliver to your address, or if we suspect fraud — in any such case a full refund is issued to the original payment method.",
          "Payments are processed securely by our payment partners. Coupon codes are subject to their own conditions, cannot be exchanged for cash and may be withdrawn at any time.",
        ],
      },
      {
        id: "shipping-returns",
        heading: "Shipping, returns and cancellations",
        body: [
          "Delivery, return, refund and cancellation terms are described in detail in our Shipping Policy, Return & Refund Policy and Cancellation Policy, which form part of these terms.",
        ],
      },
      {
        id: "acceptable-use",
        heading: "Acceptable use",
        body: [
          "You agree not to misuse the website, including by attempting to gain unauthorised access, interfering with its operation, scraping content, placing fraudulent orders, or posting reviews that are false, offensive or unlawful. We may suspend accounts that break these rules.",
        ],
      },
      {
        id: "intellectual-property",
        heading: "Intellectual property",
        body: [
          `All content on this website — including the ${c.store} name and logo, text, graphics, product photos and design — belongs to ${c.store} or its licensors and may not be copied or reused without written permission.`,
        ],
      },
      {
        id: "liability",
        heading: "Limitation of liability",
        body: [
          "To the extent permitted by law, our total liability for any claim relating to an order is limited to the amount you paid for that order. We are not liable for indirect or consequential losses, or for delays caused by events outside our reasonable control such as natural disasters, strikes or courier disruptions.",
        ],
      },
      {
        id: "governing-law",
        heading: "Governing law",
        body: [
          "These terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction of the courts at the place of our registered business address.",
        ],
      },
      {
        id: "grievance",
        heading: "Grievance redressal",
        body: [
          `If you have any complaint about a product, order or this website, ${reach(c)}. We acknowledge complaints within 48 hours and aim to resolve them within 30 days, in line with the Consumer Protection (E-Commerce) Rules, 2020.`,
        ],
      },
    ],
  },
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    navLabel: "Shipping Policy",
    summary: "Delivery charges, timelines, tracking and what to do if something goes wrong.",
    icon: "truck",
    updated: UPDATED,
    highlights: () => [
      "Free delivery on all orders",
      "Dispatched within 1–2 business days",
      "Delivered in 3–7 business days across India",
    ],
    sections: (c) => [
      {
        id: "delivery-area",
        heading: "Where we deliver",
        body: [
          "We currently deliver to serviceable pin codes across India. If your pin code is not serviceable, we will let you know at checkout or contact you after you order and refund any amount paid in full.",
        ],
      },
      {
        id: "charges",
        heading: "Shipping charges",
        body: [
          "Delivery is free on all orders — no minimum order value and no hidden charges. Any change to this will be shown clearly at checkout before you pay.",
        ],
      },
      {
        id: "timelines",
        heading: "Processing and delivery time",
        body: [
          {
            list: [
              "Orders are packed and dispatched within 1–2 business days of payment confirmation.",
              "Metro cities: usually 3–5 business days after dispatch.",
              "Rest of India: usually 5–7 business days after dispatch; remote areas may take up to 10 business days.",
              "Orders placed on Sundays or public holidays are processed on the next business day.",
            ],
          },
          "Delivery times are estimates and may be affected by weather, festivals, courier delays or other events outside our control.",
        ],
      },
      {
        id: "tracking",
        heading: "Order tracking",
        body: [
          "Once your order ships, we send you the tracking details by email or SMS. You can also check the status of your order any time from My Account → Orders.",
        ],
      },
      {
        id: "delivery-attempts",
        heading: "Delivery attempts",
        body: [
          "Our courier partner will attempt delivery up to three times. If the package cannot be delivered because of an incorrect address or because nobody was available, it may be returned to us. In that case we will contact you to reship the order or refund it.",
        ],
      },
      {
        id: "damaged-packages",
        heading: "Damaged or tampered packages",
        body: [
          `Please do not accept a package that is visibly damaged or tampered with. If you notice damage after opening, take photos of the package and product and ${reach(c)} within 48 hours of delivery so we can arrange a replacement or refund.`,
        ],
      },
    ],
  },
  {
    slug: "return-refund-policy",
    title: "Return & Refund Policy",
    navLabel: "Return & Refund",
    summary: "How to return a product and when you can expect your refund.",
    icon: "rotate",
    updated: UPDATED,
    highlights: () => [
      "7-day return window from delivery",
      "Free pickup for eligible returns",
      "Refunds in 5–7 business days after inspection",
    ],
    sections: (c) => [
      {
        id: "return-window",
        heading: "Return window",
        body: [
          `If you are not happy with your purchase, you can request a return within 7 days of delivery. To start a return, ${reach(c)} with your order number and the reason for return.`,
        ],
      },
      {
        id: "eligibility",
        heading: "Eligible returns",
        body: [
          "A product can be returned if it is:",
          {
            list: [
              "Damaged, defective or not working on arrival.",
              "Different from what you ordered (wrong item, size or colour).",
              "Missing parts or accessories.",
              "Unused, unwashed and in its original packaging with all tags, labels and freebies intact.",
            ],
          },
        ],
      },
      {
        id: "non-returnable",
        heading: "Non-returnable items",
        body: [
          "For hygiene and safety reasons, the following cannot be returned unless they arrive damaged or defective:",
          {
            list: [
              "Beauty, skincare, personal-care and cosmetic products once opened or with the seal broken.",
              "Innerwear, lingerie, socks and swimwear.",
              "Food, consumables and perishable items.",
              "Products marked as \"non-returnable\" on the product page.",
              "Gift cards.",
            ],
          },
        ],
      },
      {
        id: "process",
        heading: "How returns work",
        body: [
          {
            list: [
              "Contact us within 7 days of delivery with your order number, reason and photos where relevant.",
              "We review your request and confirm within 2 business days.",
              "We arrange a free pickup from your address, or share return instructions if pickup is not available at your pin code.",
              "Once the product reaches us, it is inspected within 2–3 business days.",
            ],
          },
        ],
      },
      {
        id: "refunds",
        heading: "Refunds",
        body: [
          "Once your return passes inspection, we approve the refund and notify you. Refunds go back to the original payment method:",
          {
            list: [
              "UPI and wallets: usually within 2–3 business days.",
              "Debit and credit cards, net banking: usually within 5–7 business days, depending on your bank.",
            ],
          },
          "If the returned product does not meet the eligibility conditions, we will send it back to you and the refund will not be processed.",
        ],
      },
      {
        id: "exchanges",
        heading: "Replacements and exchanges",
        body: [
          "For damaged, defective or wrong items, you can choose a replacement instead of a refund, subject to stock availability. If a replacement is not available, a full refund will be issued.",
        ],
      },
    ],
  },
  {
    slug: "cancellation-policy",
    title: "Cancellation Policy",
    navLabel: "Cancellation Policy",
    summary: "When and how you can cancel an order, and how cancellations are refunded.",
    icon: "cancel",
    updated: UPDATED,
    highlights: () => [
      "Cancel free of charge before your order ships",
      "Full refund to your original payment method",
      "Shipped orders can be returned instead",
    ],
    sections: (c) => [
      {
        id: "by-customer",
        heading: "Cancelling your order",
        body: [
          `You can cancel your order free of charge at any time before it is shipped. To cancel, ${reach(c)} with your order number as soon as possible. Once your order has been shipped, it can no longer be cancelled — but you can refuse delivery or request a return under our Return & Refund Policy.`,
        ],
      },
      {
        id: "by-us",
        heading: "Cancellations by us",
        body: [
          "We may have to cancel an order, fully or partly, in situations such as:",
          {
            list: [
              "The product is out of stock or no longer available.",
              "Your delivery pin code is not serviceable.",
              "There was a pricing or listing error on the website.",
              "The payment could not be verified or the order looks fraudulent.",
            ],
          },
          "If this happens, we will inform you by email or SMS and refund any amount paid in full.",
        ],
      },
      {
        id: "refund-timeline",
        heading: "Refunds for cancelled orders",
        body: [
          "For prepaid orders, the full amount is refunded to your original payment method within 5–7 business days of cancellation. The time taken for the amount to reflect in your account depends on your bank or payment provider.",
        ],
      },
      {
        id: "failed-payments",
        heading: "Failed or interrupted payments",
        body: [
          `If money is deducted from your account but the order is not confirmed, the amount is usually reversed automatically by your bank or our payment partner within 5–7 business days. If it is not, ${reach(c)} with the transaction details and we will help resolve it.`,
        ],
      },
    ],
  },
];

export function getPolicy(slug: string) {
  return POLICIES.find((p) => p.slug === slug);
}
