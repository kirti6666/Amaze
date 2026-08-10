import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/middleware/getServerUser";

export default async function AccountPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <main className="p-12">
      <h1 className="text-2xl font-bold mb-4">My Account</h1>
      <div className="space-y-1 text-foreground">
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
      </div>

      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/account/orders" className="text-primary underline">
          Order History
        </Link>
        <Link href="/account/addresses" className="text-primary underline">
          Manage Addresses
        </Link>
        <Link href="/cart" className="text-primary underline">
          View Cart
        </Link>
        <Link href="/account/wishlist" className="text-primary underline">Wishlist</Link>
      </div>
    </main>
  );
}
