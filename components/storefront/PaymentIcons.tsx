/**
 * "We accept" row of payment-method badges in the footer.
 *
 * Icons are the MIT-licensed set from Shopify's payment_icons project, served
 * from /public/payment-icons (see LICENSE.txt there). To add or remove a
 * method, edit this list — order here is display order.
 */
const PAYMENT_METHODS = [
  { file: "american_express", name: "American Express" },
  { file: "apple_pay", name: "Apple Pay" },
  { file: "bancontact", name: "Bancontact" },
  { file: "bizum", name: "Bizum" },
  { file: "diners_club", name: "Diners Club" },
  { file: "discover", name: "Discover" },
  { file: "google_pay", name: "Google Pay" },
  { file: "idealwero", name: "iDEAL | Wero" },
  { file: "master", name: "Mastercard" },
  { file: "mbway", name: "MB WAY" },
  { file: "shopify_pay", name: "Shop Pay" },
  { file: "visa", name: "Visa" },
];

export function PaymentIcons() {
  return (
    <ul className="payment-icons" aria-label="Accepted payment methods">
      {PAYMENT_METHODS.map((m) => (
        <li key={m.file}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/payment-icons/${m.file}.svg`} alt={m.name} title={m.name} width={38} height={24} loading="lazy" />
        </li>
      ))}
    </ul>
  );
}
