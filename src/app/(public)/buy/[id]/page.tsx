import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";

export default async function BuyerRequestConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/buy/${id}`);

  const request = await prisma.buyerRequest.findUnique({ where: { id } });
  if (!request || request.userId !== user.id) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-16 text-center sm:px-6">
      <h1 className="text-2xl font-semibold">Request logged</h1>
      <p className="text-secondary-foreground">
        &ldquo;{request.description}&rdquo;
      </p>
      <p className="text-secondary-foreground">
        We don&apos;t auto-match yet — a person on our team will pair this against listings and sellers by hand and
        reach out directly. Your request is also now visible, anonymized, to sellers on the mandate board.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/mandates" className={buttonVariants()}>
          View the mandate board
        </Link>
        <Link href="/marketplace" className={buttonVariants({ variant: "outline" })}>
          Browse listings meanwhile
        </Link>
      </div>
    </div>
  );
}
