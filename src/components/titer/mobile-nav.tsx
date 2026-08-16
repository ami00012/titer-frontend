"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MobileNav({ nav }: { nav: { href: string; label: string }[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation menu">
            <MenuIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="min-w-40">
        {nav.map((item) => (
          <DropdownMenuItem key={item.href} render={<Link href={item.href}>{item.label}</Link>} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
