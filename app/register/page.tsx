import { Suspense } from "react";
import { RegisterForm } from "@/components/forms/register-form";
import { FormLoadingSkeleton } from "@/components/ui/loading";

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[var(--background)] px-4 py-8 sm:py-12">
      <Suspense fallback={<FormLoadingSkeleton />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
