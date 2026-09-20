import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { BRAND_NAME } from "@/lib/brand";
import { MobileNav } from "@/components/layout/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";

const NAV = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/mandates", label: "Mandates" },
  { href: "/sell", label: "Sell" },
  { href: "/buy", label: "Buy" },
];

export async function SiteHeader() {
  const user = await getCurrentUser().catch(() => null);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-8">
        <MobileNav nav={NAV} />
        <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight">
          {BRAND_NAME}
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-secondary-foreground md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {user ? (
          <>
            <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Dashboard
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Log in
            </Link>
            <Link href="/signup" className={buttonVariants({ size: "sm" })}>
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
