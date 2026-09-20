import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { MobileNav } from "@/components/layout/mobile-nav";

const NAV = [
  { href: "/admin/assets", label: "Assets" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/offers", label: "Offers" },
  { href: "/admin/transactions", label: "Transactions" },
  { href: "/admin/wind-down-leads", label: "Wind-down leads" },
  { href: "/admin/valuation-leads", label: "Valuation leads" },
  { href: "/admin/comparables", label: "Comparables" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Never trust a client-supplied role -- re-check server-side on every request,
  // independent of the middleware redirect for unauthenticated visitors.
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/assets");
  if (user.role !== "ADMIN" || user.suspended) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-8">
          <MobileNav nav={NAV} />
          <Link href="/admin/assets" className="shrink-0 text-lg font-semibold">
            Admin
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-secondary-foreground md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-secondary-foreground hover:text-foreground hover:underline">
            View site →
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col px-6 py-8">{children}</main>
    </div>
  );
}
