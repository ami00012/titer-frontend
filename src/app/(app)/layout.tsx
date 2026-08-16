import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/titer/logout-button";
import { MobileNav } from "@/components/titer/mobile-nav";
import { WorkspaceSwitcher } from "@/components/titer/workspace-switcher";
import { UpgradeModal } from "@/components/titer/upgrade-modal";
import { Badge } from "@/components/ui/badge";
import { DEV_BYPASS_USER, isDevAuthBypassEnabled } from "@/lib/dev-bypass";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/measure", label: "Measure" },
  { href: "/quality", label: "Quality" },
  { href: "/visibility", label: "Visibility" },
  { href: "/compliance", label: "Compliance" },
  { href: "/settings", label: "Settings" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const devBypass = isDevAuthBypassEnabled();
  let user = devBypass ? DEV_BYPASS_USER : null;

  if (!devBypass) {
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    user = supabaseUser ? { id: supabaseUser.id, email: supabaseUser.email ?? "" } : null;
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-8">
          <MobileNav nav={NAV} />
          <Link href="/dashboard" className="shrink-0 text-lg font-semibold">
            Titer
          </Link>
          {devBypass ? (
            <div className="hidden items-center gap-3 md:flex">
              <Badge variant="destructive">Dev mode — auth bypassed</Badge>
              <Link href="/" className="text-sm text-secondary-foreground hover:text-foreground hover:underline">
                View marketing site →
              </Link>
            </div>
          ) : null}
          <nav className="hidden items-center gap-4 text-sm text-secondary-foreground md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <WorkspaceSwitcher />
          <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col px-6 py-8">{children}</main>
      <UpgradeModal />
    </div>
  );
}
