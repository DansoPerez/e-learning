import { Suspense } from "react";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="h-96 w-full max-w-4xl animate-pulse rounded-2xl bg-slate-100" />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
