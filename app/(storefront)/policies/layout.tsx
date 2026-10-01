import { PolicyNav } from "@/components/storefront/PolicyNav";

/** Shared two-column shell for /policies and every /policies/[slug] page. */
export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="policy-page">
      <div className="policy-shell">
        <PolicyNav />
        <div className="policy-main">{children}</div>
      </div>
    </main>
  );
}
