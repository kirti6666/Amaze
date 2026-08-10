import nodemailer from "nodemailer";
import { getOrCreateInvoice } from "./compute";
import { renderInvoicePdf } from "./render";
import { getInvoiceSettings } from "./settings";

/**
 * Order email with the tax invoice attached as a PDF.
 *
 * This lives alongside the existing `lib/email.ts` rather than modifying it:
 * that module's `sendEmail()` intentionally has a narrow {to, subject, html}
 * contract used by every other email in the app, and attachments are only
 * needed here. Keeping them separate means the invoice feature cannot regress
 * the existing transactional email path.
 *
 * Failure policy matches the rest of the app: an email or PDF problem must
 * never fail or block an order, so everything is caught and logged.
 */

function getTransport() {
  if (!process.env.EMAIL_SERVER_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

interface SendOrderEmailParams {
  orderId: string;
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an order email, attaching the invoice PDF when invoicing is enabled.
 *
 * Generating the invoice here also means the invoice is *issued* (numbered and
 * persisted) at confirmation time, so the number on the emailed PDF is the same
 * one the customer later downloads from their order page.
 */
export async function sendOrderEmailWithInvoice({
  orderId,
  to,
  subject,
  html,
}: SendOrderEmailParams): Promise<void> {
  const transport = getTransport();

  if (!transport) {
    console.warn(`[email] SMTP not configured — skipping "${subject}" to ${to}`);
    return;
  }

  const attachments: { filename: string; content: Buffer; contentType: string }[] = [];

  try {
    const settings = await getInvoiceSettings();
    if (settings.attachToOrderEmail) {
      const invoice = await getOrCreateInvoice(orderId);
      if (invoice?.snapshot) {
        attachments.push({
          filename: `${String(invoice.invoiceNumber).replace(/[^\w.-]+/g, "-")}.pdf`,
          content: renderInvoicePdf(invoice.snapshot),
          contentType: "application/pdf",
        });
      }
    }
  } catch (err) {
    // Send the email without the invoice rather than losing the confirmation.
    console.error("[invoice] Could not attach invoice to order email:", err);
  }

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || "no-reply@store.com",
      to,
      subject,
      html,
      ...(attachments.length ? { attachments } : {}),
    });
  } catch (err) {
    console.error("[email] Failed to send:", err);
  }
}
