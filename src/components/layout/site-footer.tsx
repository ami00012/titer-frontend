import Link from "next/link";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const COLUMNS = [
  {
    title: "Marketplace",
    links: [
      { href: "/marketplace", label: "All assets" },
      { href: "/marketplace/digital-business", label: "Digital businesses" },
      { href: "/marketplace/ai-agent", label: "AI agents" },
      { href: "/mandates", label: "Buyer mandates" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/about", label: "About" },
      { href: "/pricing", label: "Pricing" },
      { href: "/methodology", label: "Methodology" },
      { href: "/how-we-protect-you", label: "How we protect you" },
    ],
  },
  {
    title: "Get started",
    links: [
      { href: "/sell", label: "Sell an asset" },
      { href: "/buy", label: "Buy an asset" },
      { href: "/wind-down", label: "Shutting down? Sell it" },
      { href: "/valuate", label: "Free valuation" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold">{BRAND_NAME}</span>
          <p className="max-w-xs text-sm text-muted-foreground">{BRAND_TAGLINE}</p>
        </div>
        <div className="flex flex-wrap gap-12">
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-2">
              <span className="text-sm font-medium">{col.title}</span>
              {col.links.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl text-xs text-muted-foreground">
        © {new Date().getFullYear()} {BRAND_NAME}. All transactions are brokered and subject to review.
      </div>
    </footer>
  );
}
