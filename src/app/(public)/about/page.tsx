import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold">About {BRAND_NAME}</h1>
      <p className="text-secondary-foreground">
        {BRAND_NAME} is the ratings and measurement layer for AI-era assets — we score digital businesses and AI
        agents against a published rubric, prove agents actually work before they&apos;re sold, and broker the deal
        when a buyer and seller agree on a price.
      </p>
      <p className="text-secondary-foreground">
        Every listing on this site is reviewed by a person before it goes live, and every deal is handled by a
        person, not a queue. There is no automated matching engine deciding who talks to whom yet — a human pairs
        buyer mandates against listings by hand, on purpose, until there&apos;s enough volume to earn otherwise.
      </p>
      <p className="text-secondary-foreground">
        We&apos;re not trying to be a fully automated marketplace on day one. We optimize for getting real assets
        listed, getting the right buyers interested, and facilitating the transaction carefully — see{" "}
        <Link href="/how-we-protect-you" className="underline">
          how we protect you
        </Link>{" "}
        for exactly what that means in a transaction.
      </p>
      <p className="text-secondary-foreground">
        Questions before you list or make an offer? Reach us at{" "}
        <a href="mailto:hello@titer.dev" className="underline">
          hello@titer.dev
        </a>
        .
      </p>
      {/* TODO(founder): swap this block for a named founder photo, name, and LinkedIn once ready — see AGENTS spec §4.4. */}
    </div>
  );
}
