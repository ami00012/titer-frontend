import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/titer/auth-form";

export default function LoginPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Log in</h1>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
      <p className="text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/signup" className="font-medium text-foreground underline">
          Sign up
        </Link>
      </p>
    </>
  );
}
