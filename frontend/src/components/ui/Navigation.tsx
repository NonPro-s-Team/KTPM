import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <p className="page-header__eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb" aria-label="Đường dẫn">
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`}>
              {item.to && !current ? (
                <Link to={item.to}>{item.label}</Link>
              ) : (
                <span aria-current={current ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  label: string;
}

export function Tabs({ items, activeId, onChange, label }: TabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((item) => {
        const Icon = item.icon;
        const selected = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={
              selected ? "tabs__item tabs__item--active" : "tabs__item"
            }
            onClick={() => onChange(item.id)}
          >
            {Icon ? <Icon size={16} aria-hidden="true" /> : null}
            <span>{item.label}</span>
            {typeof item.count === "number" ? (
              <span className="tabs__count">{item.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
