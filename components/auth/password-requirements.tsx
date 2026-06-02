import { PASSWORD_REQUIREMENTS } from "@/lib/validations/password";

export function PasswordRequirements() {
  return (
    <div
      className="rounded-lg border border-[var(--border)] bg-[var(--background-subtle)] px-3 py-2.5 text-xs text-[var(--foreground-muted)]"
      aria-live="polite"
    >
      <p className="font-semibold text-[var(--foreground-secondary)]">Password must include:</p>
      <ul className="mt-1.5 list-inside list-disc space-y-0.5">
        {PASSWORD_REQUIREMENTS.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </div>
  );
}
