import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
import { getServerUser } from "@/lib/middleware/getServerUser";
import { verifyGuestToken, GUEST_TOKEN_COOKIE } from "@/lib/guestSession";
import { guestOwnsOrder } from "@/lib/checkoutIdentity";
import { validPayplusUrl } from "@/lib/payplus";
import { PayplusPayment } from "@/components/storefront/PayplusPayment";

export default async function PaymentPage({ params }: { params: { id: string } }) {
  if (!/^[a-f\d]{24}$/i.test(params.id)) notFound();
  const user = await getServerUser();
  const token = cookies().get(GUEST_TOKEN_COOKIE)?.value;
  const guest = token ? await verifyGuestToken(token) : null;
  if (!user && !guest) redirect("/checkout");
  await connectDB();
  const order = await Order.findById(params.id);
  if (!order || order.paymentMethod !== "payplus") notFound();
  const owns = user ? order.user?.toString() === user.id : guestOwnsOrder(order.guest, guest ?? {});
  if (!owns) notFound();
  if (order.paymentStatus === "refunded") redirect(`/order-success/${params.id}`);
  if (!validPayplusUrl(order.payplusPaymentUrl)) notFound();
  return <PayplusPayment orderId={params.id} total={order.total} paymentUrl={order.payplusPaymentUrl} />;
}
