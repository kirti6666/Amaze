import nodemailer from "nodemailer";

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

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email if SMTP is configured, otherwise logs and no-ops.
 * Email failures should never break the order flow they're attached to —
 * callers don't need to (and shouldn't) await-and-fail on this.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const transport = getTransport();

  if (!transport) {
    console.warn(`[email] SMTP not configured — skipping "${subject}" to ${to}`);
    return;
  }

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || "no-reply@store.com",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send:", err);
  }
}
