import { LoginForm } from "@/components/forms/auth-forms";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const { error, registered } = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[var(--background)] px-4 py-8 sm:py-12">
      <LoginForm sessionError={error} registered={registered === "1"} />
    </div>
  );
}
