import type { ReactNode } from "react";
import clsx from "clsx";

export function Panel({
  title,
  children,
  className,
  action,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={clsx("surface overflow-hidden", className)}>
      {title ? (
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-[0.95rem] font-bold">{title}</h2>
          {action}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function StatGrid({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
          <dt className="text-[0.68rem] uppercase tracking-wide text-[var(--muted-dim)]">{stat.label}</dt>
          <dd className="mt-0.5 text-[0.95rem] font-bold tabular-nums">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Bloc de texte de jeu : conserve les sauts de ligne des descriptions officielles. */
export function GameText({ children, className }: { children: string; className?: string }) {
  return (
    <p className={clsx("whitespace-pre-line text-[0.83rem] leading-relaxed text-[var(--muted)]", className)}>
      {children}
    </p>
  );
}

export function Accordion({
  items,
}: {
  items: { key: string; title: ReactNode; subtitle?: string; body: ReactNode }[];
}) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <details
          key={item.key}
          open={index === 0}
          className="group rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]"
        >
          <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="text-[0.85rem] font-semibold">{item.title}</div>
              {item.subtitle ? (
                <div className="text-[0.7rem] text-[var(--muted-dim)]">{item.subtitle}</div>
              ) : null}
            </div>
            <svg
              className="shrink-0 text-[var(--muted-dim)] transition-transform group-open:rotate-180"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <div className="border-t border-[var(--border)] px-3 py-3">{item.body}</div>
        </details>
      ))}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-[0.75rem] text-[var(--muted-dim)]">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 ? <span>/</span> : null}
          {item.href ? (
            <a href={item.href} className="hover:text-[var(--text)]">
              {item.label}
            </a>
          ) : (
            <span className="text-[var(--muted)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
