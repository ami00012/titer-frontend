import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { BRAND_NAME } from "@/lib/brand";

const NAV = [
  { href: "/dashboard", label: "My Assets" },
  { href: "/dashboard/inquiries", label: "Inquiries" },
  { href: "/dashboard/offers", label: "Offers" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/profile", label: "Profile" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-8">
          <MobileNav nav={NAV} />
          <Link href="/" className="shrink-0 text-lg font-semibold">
            {BRAND_NAME}
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-secondary-foreground md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/sell" className="hidden text-sm font-medium hover:underline sm:inline">
            Sell an Asset
          </Link>
          <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col px-6 py-8">{children}</main>
    </div>
  );
}
