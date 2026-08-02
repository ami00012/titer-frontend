import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/titer/auth-form";

export default function SignupPage() {
  return (
    <>
      <h1 className="text-xl font-semibold">Create your account</h1>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline">
          Log in
        </Link>
      </p>
    </>
  );
}
