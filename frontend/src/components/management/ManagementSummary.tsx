import type { LucideIcon } from "lucide-react";

export interface SummaryItem {
  label: string;
  value: string;
  meta: string;
  icon: LucideIcon;
}

export function ManagementSummary({ items }: { items: SummaryItem[] }) {
  return (
    <section className="summary-grid" aria-label="Tóm tắt dữ liệu">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div className="summary-item" key={item.label}>
            <span className="summary-item__label">
              <Icon size={15} aria-hidden="true" />
              {item.label}
            </span>
            <strong className="tabular">{item.value}</strong>
            <small>{item.meta}</small>
          </div>
        );
      })}
    </section>
  );
}
