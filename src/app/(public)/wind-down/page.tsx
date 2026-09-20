import type { Metadata } from "next";
import { WindDownForm } from "@/components/marketing/wind-down-form";

export const metadata: Metadata = {
  title: "Shutting it down? Sell it instead.",
  description: "Before you kill your side project, let us take a look. Free, no obligation.",
};

export default function WindDownPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-balance">Shutting it down? Sell it instead.</h1>
        <p className="text-secondary-foreground">
          Thousands of AI side projects get killed every month instead of sold. If it still has users, a domain with
          traffic, or code someone else could run with, it&apos;s worth five minutes before you turn it off.
        </p>
      </div>
      <WindDownForm />
    </div>
  );
}
