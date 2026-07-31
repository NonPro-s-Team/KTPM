import {
  Bell,
  BedDouble,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileSignature,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
  WalletCards,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { BrandLogo } from "../BrandLogo";
import {
  Breadcrumb,
  DropdownMenu,
  IconButton,
  SearchInput,
  ThemeToggle,
  Tooltip,
} from "../ui";

interface NavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

const primaryNavigation: NavigationItem[] = [
  { label: "Tổng quan", to: "/dashboard", icon: LayoutDashboard },
  { label: "Khu trọ", to: "/properties", icon: Building2 },
  { label: "Phòng", to: "/rooms", icon: BedDouble },
  { label: "Khách thuê", to: "/tenants", icon: UsersRound },
  { label: "Hợp đồng", to: "/contracts", icon: FileSignature },
  { label: "Hóa đơn", to: "/invoices", icon: ReceiptText },
  { label: "Thanh toán", to: "/payments", icon: WalletCards },
  { label: "Sửa chữa", to: "/maintenance", icon: Wrench },
];

const secondaryNavigation: NavigationItem[] = [
  { label: "Tài khoản", to: "/users", icon: ShieldCheck },
  { label: "Cài đặt", to: "/settings", icon: Settings },
];

const routeLabels: Record<string, string> = Object.fromEntries(
  [...primaryNavigation, ...secondaryNavigation].map((item) => [
    item.to,
    item.label,
  ]),
);

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <NavLink
      className="brand"
      to="/dashboard"
      aria-label="TroConnect - Trang tổng quan"
    >
      <BrandLogo compact={collapsed} />
    </NavLink>
  );
}

function NavigationGroup({
  items,
  collapsed,
  onNavigate,
}: {
  items: NavigationItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="sidebar-nav" aria-label="Điều hướng chính">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
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

function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}
      aria-label="Thanh điều hướng"
    >
      <div className="sidebar__brand">
        <Brand collapsed={collapsed} />
      </div>
      <div className="sidebar__content">
        <NavigationGroup items={primaryNavigation} collapsed={collapsed} />
        <div className="sidebar__divider" />
        <NavigationGroup items={secondaryNavigation} collapsed={collapsed} />
      </div>
      <div className="sidebar__footer">
        <Tooltip
          content={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
        >
          <IconButton
            icon={collapsed ? ChevronRight : ChevronLeft}
            label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
            onClick={onToggle}
          />
        </Tooltip>
        {!collapsed ? (
          <div>
            <strong>Trợ giúp</strong>
            <span>Phiên bản giao diện 0.1</span>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function MobileNavigation({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="mobile-navigation__header">
        <Brand />
        <IconButton icon={X} label="Đóng điều hướng" onClick={onClose} />
      </div>
      <div className="mobile-navigation__body">
        <NavigationGroup items={primaryNavigation} onNavigate={onClose} />
        <div className="sidebar__divider" />
        <NavigationGroup items={secondaryNavigation} onNavigate={onClose} />
      </div>
      <div className="mobile-navigation__help">
        <CircleHelp size={18} aria-hidden="true" />
        <span>Trung tâm hỗ trợ</span>
      </div>
    </dialog>
  );
}

function AppHeader({ onOpenNavigation }: { onOpenNavigation: () => void }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="app-header__leading">
        <IconButton
          icon={Menu}
          label="Mở điều hướng"
          className="app-header__menu"
          onClick={onOpenNavigation}
        />
        <div className="app-header__search">
          <SearchInput
            value={search}
            placeholder="Tìm phòng, khách thuê, hóa đơn..."
            onChange={(event) => setSearch(event.target.value)}
            onClear={() => setSearch("")}
          />
          <span className="search-shortcut" aria-hidden="true">
            Ctrl K
          </span>
        </div>
        <Tooltip content="Tìm kiếm">
          <IconButton
            icon={Search}
            label="Tìm kiếm"
            className="app-header__mobile-search"
          />
        </Tooltip>
      </div>
      <div className="app-header__actions">
        <span className="app-header__notification">
          <Tooltip content="Thông báo">
            <span className="notification-button">
              <IconButton icon={Bell} label="Thông báo, có 3 mục mới" />
              <span className="notification-button__dot" aria-hidden="true" />
            </span>
          </Tooltip>
        </span>
        <ThemeToggle />
        <DropdownMenu
          label="Menu tài khoản"
          triggerClassName="user-menu-trigger"
          trigger={
            <span className="user-trigger">
              <span className="user-trigger__avatar">AN</span>
              <span className="user-trigger__copy">
                <strong>An Nguyễn</strong>
                <small>Chủ nhà</small>
              </span>
            </span>
          }
          items={[
            {
              label: "Hồ sơ cá nhân",
              icon: UserRound,
              onSelect: () => navigate("/users"),
            },
            {
              label: "Cài đặt",
              icon: Settings,
              onSelect: () => navigate("/settings"),
            },
            {
              label: "Đăng xuất",
              icon: LogOut,
              danger: true,
              separatorBefore: true,
              onSelect: () => navigate("/login"),
            },
          ]}
        />
      </div>
    </header>
  );
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  const breadcrumbs = useMemo(
    () => [
      { label: "TroConnect", to: "/dashboard" },
      { label: routeLabels[location.pathname] ?? "Trang" },
    ],
    [location.pathname],
  );

  return (
    <div className={`app-shell ${collapsed ? "app-shell--collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((current) => !current)}
      />
      <MobileNavigation
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="app-shell__workspace">
        <AppHeader onOpenNavigation={() => setMobileOpen(true)} />
        <main
          ref={mainRef}
          id="main-content"
          className="app-main"
          tabIndex={-1}
        >
          <Breadcrumb items={breadcrumbs} />
          <div className="page-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
