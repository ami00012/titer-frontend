"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const VALID_TYPES = ["signup", "invite", "magiclink", "recovery", "email_change"] as const;
type ValidType = (typeof VALID_TYPES)[number];

function isValidType(value: string | null): value is ValidType {
  return value !== null && (VALID_TYPES as readonly string[]).includes(value);
}

function ConfirmForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const tokenHash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!tokenHash || !isValidType(rawType)) {
    return (
      <p className="text-sm text-muted-foreground">
        This confirmation link is missing required information. Please request a new one.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-sm text-muted-foreground">
        This link is invalid or has expired. Please sign up again or request a new confirmation
        email.
      </p>
    );
  }

  async function handleConfirm() {
    setStatus("loading");
    const supabase = createClient();
    // isValidType() above already narrowed rawType, but TS can't see that
    // across the closure -- re-check here so the compiler agrees.
    if (!tokenHash || !isValidType(rawType)) {
      setStatus("error");
      return;
    }
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: rawType });

    if (error) {
      setStatus("error");
      toast.error(error.message);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-sm text-muted-foreground">
        Click below to confirm your email address and finish signing in.
      </p>
      <Button onClick={handleConfirm} disabled={status === "loading"}>
        {status === "loading" ? "Confirming..." : "Confirm email address"}
      </Button>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <span className="text-lg font-semibold">Titer</span>
      <h1 className="text-xl font-semibold">Confirm your email</h1>
      <Suspense>
        <ConfirmForm />
      </Suspense>
    </div>
  );
}
