import type { ReactNode } from "react";
import { Search } from "lucide-react";

/** Shared building blocks so every admin screen looks and behaves the same. */

export const PageHeader = ({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
    <div className="min-w-0">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
      {subtitle && <p className="mt-1 text-ink-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export const StatCard = ({ label, value, hint, icon, tone = "brand" }: { label: string; value: ReactNode; hint?: string; icon: ReactNode; tone?: "brand" | "ok" | "warn" | "info" }) => {
  const tones = {
    brand: "bg-brand-100 text-brand-700",
    ok: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-700",
    info: "bg-sky-100 text-sky-700",
  } as const;
  return (
    <div className="adm-card p-3.5 sm:p-5 flex items-center sm:items-start gap-3 sm:gap-4">
      <span className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl flex items-center justify-center ${tones[tone]}`} aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-500">{label}</p>
        <p className="text-2xl font-extrabold text-ink-900 truncate">{value}</p>
        {hint && <p className="text-xs text-ink-500 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
};

const BADGE: Record<string, string> = {
  completed: "ds-badge-ok", active: "ds-badge-ok", verified: "ds-badge-ok", paid: "ds-badge-ok",
  pending: "ds-badge-warn", review: "ds-badge-warn",
  failed: "ds-badge-danger", cancelled: "ds-badge-danger", unverified: "ds-badge-danger",
};
export const StatusBadge = ({ status, label }: { status: string; label?: string }) => (
  <span className={`ds-badge ${BADGE[status.toLowerCase()] ?? "ds-badge-info"}`}>
    {label ?? status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

export const SearchBox = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <label className="relative block w-full sm:w-72">
    <span className="sr-only-text">{placeholder}</span>
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" aria-hidden="true" />
    <input className="adm-input w-full pl-9" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  </label>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) => (
  <tbody aria-busy="true">
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r}>
        {Array.from({ length: cols }).map((_, c) => (
          <td key={c}><div className="h-4 rounded bg-ink-100 animate-pulse" style={{ width: `${55 + ((r * 7 + c * 13) % 40)}%` }} /></td>
        ))}
      </tr>
    ))}
  </tbody>
);

export const EmptyState = ({ icon, title, text }: { icon: ReactNode; title: string; text?: string }) => (
  <div className="py-14 text-center">
    <div className="mx-auto w-12 h-12 rounded-2xl bg-ink-100 text-ink-500 flex items-center justify-center" aria-hidden="true">{icon}</div>
    <p className="mt-3 font-bold text-ink-900">{title}</p>
    {text && <p className="mt-1 text-ink-500 text-sm">{text}</p>}
  </div>
);

