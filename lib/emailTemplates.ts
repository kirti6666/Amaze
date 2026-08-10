/** Order items/variant may come from a hydrated Mongoose doc (Map) or a
 * plain object (lean/JSON) depending on call site — normalize either way. */
function variantToObject(variant: unknown): Record<string, string> {
  if (!variant) return {};
  if (variant instanceof Map) return Object.fromEntries(variant);
  return variant as Record<string, string>;
}

interface EmailOrderItem {
  title: string;
  quantity: number;
  price: number;
  variant?: unknown;
}

interface EmailOrder {
  _id: unknown;
  items: EmailOrderItem[];
  total: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  orderStatus: string;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
}

function itemsTable(items: EmailOrderItem[]): string {
  const rows = items
    .map((item) => {
      const variant = variantToObject(item.variant);
      const variantText = Object.entries(variant)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">
            ${item.title}${variantText ? `<br/><span style="color:#888;font-size:12px;">${variantText}</span>` : ""}
          </td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${item.price * item.quantity}</td>
        </tr>`;
    })
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;border-bottom:2px solid #333;">Item</th>
          <th style="text-align:center;padding:8px;border-bottom:2px solid #333;">Qty</th>
          <th style="text-align:right;padding:8px;border-bottom:2px solid #333;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export function orderConfirmationEmail(order: EmailOrder): string {
  return `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
      <h2>Thanks for your order!</h2>
      <p style="color:#666;">Order ID: ${String(order._id)}</p>
      ${itemsTable(order.items)}
      <p><strong>Total: ₹${order.total}</strong></p>
      <p style="color:#666;">
        Payment method: ${order.paymentMethod === "razorpay" ? "Paid online" : "Cash on Delivery"}
      </p>
      <p style="color:#666;">
        Shipping to: ${order.shippingAddress.fullName}, ${order.shippingAddress.line1},
        ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
      </p>
    </div>`;
}

export function orderStatusUpdateEmail(order: EmailOrder): string {
  return `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
      <h2>Your order status has been updated</h2>
      <p style="color:#666;">Order ID: ${String(order._id)}</p>
      <p style="font-size:18px;">
        New status: <strong style="text-transform:capitalize;">${order.orderStatus}</strong>
      </p>
      ${itemsTable(order.items)}
      <p><strong>Total: ₹${order.total}</strong></p>
    </div>`;
}


/**
 * Verification code email.
 *
 * Deliberately plain: no images, minimal markup, code as large selectable text.
 * OTP mail is the most spam-filtered category there is, and heavy HTML is a
 * strong negative signal — this keeps deliverability as high as possible.
 */
export function otpEmail(code: string): string {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 8px;font-size:18px;color:#111">Your verification code</h2>
      <p style="margin:0 0 20px;color:#555;font-size:14px">
        Use this code to confirm your order. It expires in 10 minutes.
      </p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;margin:0 0 20px">
        ${code}
      </p>
      <p style="margin:0;color:#777;font-size:12px">
        If you didn't request this, you can ignore this email. Never share this code with anyone.
      </p>
    </div>
  `;
}
