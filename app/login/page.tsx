import { LoginForm } from "@/components/forms/auth-forms";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string; reset?: string }>;
}) {
  const { error, registered, reset } = await searchParams;
  const googleAuthEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[var(--background)] px-4 py-8 sm:py-12">
      <LoginForm
        sessionError={error}
        registered={registered === "1"}
        reset={reset === "1"}
        googleAuthEnabled={googleAuthEnabled}
      />
    </div>
  );
}
