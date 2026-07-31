import {
  BedDouble,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../../store/authStore";
import type { UserRole } from "../../types/api";
import { userRoleMap } from "../../utils/status";
import { BrandLogo } from "../BrandLogo";
import { Breadcrumb, DropdownMenu, IconButton, ThemeToggle, Tooltip } from "../ui";

interface NavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const navigation: NavigationItem[] = [
  { label: "Tổng quan", to: "/dashboard", icon: LayoutDashboard, roles: ["admin", "staff"] },
  { label: "Phòng", to: "/rooms", icon: BedDouble, roles: ["admin", "staff", "tenant"] },
  { label: "Khách thuê", to: "/tenants", icon: UsersRound, roles: ["admin", "staff"] },
  { label: "Hồ sơ của tôi", to: "/tenants", icon: UserRound, roles: ["tenant"] },
  { label: "Hợp đồng", to: "/contracts", icon: FileSignature, roles: ["admin", "staff", "tenant"] },
  { label: "Hóa đơn", to: "/invoices", icon: ReceiptText, roles: ["admin", "staff", "tenant"] },
  { label: "Sửa chữa", to: "/maintenance", icon: Wrench, roles: ["admin", "staff", "tenant"] },
];

const secondaryNavigation: NavigationItem[] = [
  { label: "Tài khoản", to: "/account", icon: ShieldCheck, roles: ["admin", "staff", "tenant"] },
  { label: "Cài đặt", to: "/settings", icon: Settings, roles: ["admin", "staff", "tenant"] },
];

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  const role = useAuthStore((state) => state.role);
  return (
    <NavLink className="brand" to={role === "tenant" ? "/invoices" : "/dashboard"} aria-label="TroConnect">
      <BrandLogo compact={collapsed} />
    </NavLink>
  );
}

function NavigationGroup({
  items,
  role,
  collapsed,
  onNavigate,
}: {
  items: NavigationItem[];
  role: UserRole;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="sidebar-nav" aria-label="Điều hướng chính">
      {items
        .filter((item) => item.roles.includes(role))
        .map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                isActive ? "sidebar-nav__item is-active" : "sidebar-nav__item"
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              {!collapsed ? <span>{item.label}</span> : null}
            </NavLink>
          );
        })}
    </nav>
  );
}

function Sidebar({ role, collapsed, onToggle }: { role: UserRole; collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`} aria-label="Thanh điều hướng">
      <div className="sidebar__brand"><Brand collapsed={collapsed} /></div>
      <div className="sidebar__content">
        <NavigationGroup items={navigation} role={role} collapsed={collapsed} />
        <div className="sidebar__divider" />
        <NavigationGroup items={secondaryNavigation} role={role} collapsed={collapsed} />
      </div>
      <div className="sidebar__footer">
        <Tooltip content={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}>
          <IconButton
            icon={collapsed ? ChevronRight : ChevronLeft}
            label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
            onClick={onToggle}
          />
        </Tooltip>
        {!collapsed ? <div><strong>TroConnect</strong><span>Phiên bản 0.1</span></div> : null}
      </div>
    </aside>
  );
}

function MobileNavigation({ role, open, onClose }: { role: UserRole; open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="mobile-navigation"
      aria-label="Điều hướng trên thiết bị di động"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="mobile-navigation__header"><Brand /><IconButton icon={X} label="Đóng điều hướng" onClick={onClose} /></div>
      <div className="mobile-navigation__body">
        <NavigationGroup items={navigation} role={role} onNavigate={onClose} />
        <div className="sidebar__divider" />
        <NavigationGroup items={secondaryNavigation} role={role} onNavigate={onClose} />
      </div>
    </dialog>
  );
}

function initials(username: string) {
  return username.slice(0, 2).toLocaleUpperCase("vi");
}

function AppHeader({ onOpenNavigation }: { onOpenNavigation: () => void }) {
  const navigate = useNavigate();
  const username = useAuthStore((state) => state.username) ?? "Tài khoản";
  const role = useAuthStore((state) => state.role) ?? "tenant";
  const logout = useAuthStore((state) => state.logout);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // The local session is cleared in the store even when the stateless API fails.
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="app-header">
      <div className="app-header__leading">
        <IconButton icon={Menu} label="Mở điều hướng" className="app-header__menu" onClick={onOpenNavigation} />
      </div>
      <div className="app-header__actions">
        <ThemeToggle />
        <DropdownMenu
          label="Menu tài khoản"
          triggerClassName="user-menu-trigger"
          trigger={
            <span className="user-trigger">
              <span className="user-trigger__avatar">{initials(username)}</span>
              <span className="user-trigger__copy"><strong>{username}</strong><small>{userRoleMap[role].label}</small></span>
            </span>
          }
          items={[
            { label: "Tài khoản", icon: UserRound, onSelect: () => navigate("/account") },
            { label: "Cài đặt", icon: Settings, onSelect: () => navigate("/settings") },
            { label: loggingOut ? "Đang đăng xuất..." : "Đăng xuất", icon: LogOut, danger: true, separatorBefore: true, onSelect: () => { void handleLogout(); } },
          ]}
        />
      </div>
    </header>
  );
}

export function AppShell() {
  const role = useAuthStore((state) => state.role) ?? "tenant";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  const labels = useMemo(
    () => Object.fromEntries([...navigation, ...secondaryNavigation].filter((item) => item.roles.includes(role)).map((item) => [item.to, item.label])),
    [role],
  );
  const breadcrumbs = [{ label: "TroConnect", to: role === "tenant" ? "/invoices" : "/dashboard" }, { label: labels[location.pathname] ?? "Trang" }];

  return (
    <div className={`app-shell ${collapsed ? "app-shell--collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
      <Sidebar role={role} collapsed={collapsed} onToggle={() => setCollapsed((current) => !current)} />
      <MobileNavigation role={role} open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="app-shell__workspace">
        <AppHeader onOpenNavigation={() => setMobileOpen(true)} />
        <main ref={mainRef} id="main-content" className="app-main" tabIndex={-1}>
          <Breadcrumb items={breadcrumbs} />
          <div className="page-content"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
