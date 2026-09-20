import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "How we protect you",
  description: "Escrow, the transaction checklist, custody boundaries, disputes, and refunds.",
};

export default function HowWeProtectYouPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">How we protect you</h1>
        <p className="text-secondary-foreground">
          {BRAND_NAME} is an introducer and broker — we review listings, score assets, and facilitate the deal. We
          are not an escrow agent and we never take custody of sale proceeds.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Escrow</h2>
        <p className="text-secondary-foreground">
          Funds move directly between buyer and seller through{" "}
          <a href="https://escrow.com" target="_blank" rel="noreferrer" className="underline">
            Escrow.com
          </a>
          . {BRAND_NAME} never holds sale proceeds — our commission is invoiced separately as a service fee once a
          deal closes.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">The transaction checklist</h2>
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-secondary-foreground">
          <li>Buyer and seller agree on price through an offer or Open Bid.</li>
          <li>Both parties open an Escrow.com transaction for the agreed amount.</li>
          <li>Seller transfers the asset per the listing&apos;s transfer checklist.</li>
          <li>Buyer confirms receipt and access; Escrow.com releases funds to the seller.</li>
          <li>{BRAND_NAME} invoices its commission directly, separate from the escrowed funds.</li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">What we hold, and what we don&apos;t</h2>
        <p className="text-secondary-foreground">
          We hold your listing data, verification evidence, and Titer Score records. We do not hold funds, and we
          are not a party to the underlying sale contract between buyer and seller.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Disputes</h2>
        <p className="text-secondary-foreground">
          If a transfer doesn&apos;t go as described, tell us before releasing funds from escrow. We&apos;ll review
          the listing&apos;s verification evidence and Proof of Function record (where one exists) and mediate
          between the parties. Escrow.com&apos;s own dispute process governs release of the escrowed funds
          themselves.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Refunds</h2>
        <p className="text-secondary-foreground">
          Because {BRAND_NAME} never holds sale proceeds, refunds of the purchase price are handled through
          Escrow.com&apos;s own process. Our commission is refunded at our discretion if a deal we facilitated is
          unwound within 30 days due to a verified misrepresentation on the listing.
        </p>
      </section>
    </div>
  );
}
