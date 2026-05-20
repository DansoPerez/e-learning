import { cn } from "@/lib/utils";

export function AdminSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card p-6", className)}>
      <h2 className="text-lg font-bold text-[var(--foreground)]">{title}</h2>
      {description ?
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">{description}</p>
      : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
