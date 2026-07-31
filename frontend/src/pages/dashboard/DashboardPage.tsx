import {
  BadgeDollarSign,
  BedDouble,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  DoorOpen,
  FileText,
  KeyRound,
  ReceiptText,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Card, PageHeader, StatCard } from "../../components/ui";
import {
  dashboardAlerts,
  dashboardMetrics,
  invoices,
  revenueSeries,
  roomStatusSeries,
} from "../../data/mockData";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
} from "../../utils/formatters";
import { invoiceStatusMap } from "../../utils/status";
import "../../styles/dashboard.css";

const metricIcons: Record<string, LucideIcon> = {
  "total-rooms": Building2,
  occupied: KeyRound,
  vacant: DoorOpen,
  maintenance: Wrench,
  revenue: BadgeDollarSign,
  overdue: CircleAlert,
  expiring: CalendarClock,
  "open-maintenance": FileText,
};

const chartToneColors = {
  success: "var(--success-text)",
  warning: "var(--warning-text)",
  neutral: "var(--chart-secondary)",
};

function ChartCardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="dashboard-card__header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function RevenueChart() {
  return (
    <Card className="dashboard-chart-card">
      <ChartCardHeader
        title="Doanh thu 6 tháng"
        description="Thực thu so với mục tiêu vận hành"
        action={
          <span className="chart-summary tabular">
            +8,2%
            <small>so với T6</small>
          </span>
        }
      />
      <div
        className="dashboard-chart"
        role="img"
        aria-label="Biểu đồ doanh thu tăng từ 398 triệu đồng tháng 2 lên 486,5 triệu đồng tháng 7, cao hơn mục tiêu tháng 7 là 6,5 triệu đồng."
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={revenueSeries}
            margin={{ top: 12, right: 8, left: 4, bottom: 0 }}
          >
            <CartesianGrid
              stroke="var(--chart-grid)"
              strokeDasharray="3 4"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => `${Number(value) / 1000000}tr`}
              tickLine={false}
              axisLine={false}
              width={48}
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            />
            <ChartTooltip
              formatter={(value, name) => [
                formatCompactCurrency(Number(value)),
                name === "revenue" ? "Thực thu" : "Mục tiêu",
              ]}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-sm)",
                boxShadow: "var(--shadow-sm)",
              }}
              labelStyle={{ color: "var(--text-primary)" }}
              itemStyle={{ color: "var(--text-secondary)" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke="var(--chart-primary)"
              fill="var(--chart-primary)"
              fillOpacity={0.1}
              strokeWidth={2}
              activeDot={{ r: 4, fill: "var(--chart-primary)" }}
            />
            <Line
              type="monotone"
              dataKey="target"
              name="target"
              stroke="var(--chart-secondary)"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend" aria-label="Chú giải biểu đồ">
        <span>
          <i className="chart-legend__line chart-legend__line--solid" />
          Thực thu
        </span>
        <span>
          <i className="chart-legend__line chart-legend__line--dashed" />
          Mục tiêu
        </span>
      </div>
    </Card>
  );
}

function RoomStatusChart() {
  const totalRooms = roomStatusSeries.reduce(
    (total, item) => total + item.value,
    0,
  );

  return (
    <Card className="dashboard-chart-card">
      <ChartCardHeader
        title="Trạng thái phòng"
        description="Phân bổ trên toàn hệ thống"
      />
      <div
        className="room-status-chart"
        role="img"
        aria-label="Trong tổng số 128 phòng có 103 phòng đang thuê, 19 phòng trống và 6 phòng đang bảo trì."
      >
        <div className="room-status-chart__visual">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roomStatusSeries}
                dataKey="value"
                nameKey="label"
                innerRadius={58}
                outerRadius={78}
                paddingAngle={3}
                stroke="var(--surface)"
                strokeWidth={3}
              >
                {roomStatusSeries.map((item) => (
                  <Cell key={item.status} fill={chartToneColors[item.tone]} />
                ))}
              </Pie>
              <ChartTooltip
                formatter={(value) => [`${Number(value)} phòng`, "Số lượng"]}
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-sm)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="room-status-chart__total">
            <strong>{totalRooms}</strong>
            <span>phòng</span>
          </div>
        </div>
        <ul className="room-status-legend">
          {roomStatusSeries.map((item) => (
            <li key={item.status}>
              <span
                className={`room-status-legend__dot room-status-legend__dot--${item.tone}`}
                aria-hidden="true"
              />
              <span>{item.label}</span>
              <strong className="tabular">{item.value}</strong>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function RecentInvoices() {
  return (
    <Card className="dashboard-list-card">
      <ChartCardHeader
        title="Hóa đơn gần đây"
        description="Cập nhật trong kỳ tháng 7"
        action={
          <Link className="text-link" to="/invoices">
            Xem tất cả
            <ChevronRight size={15} aria-hidden="true" />
          </Link>
        }
      />
      <div
        className="compact-table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Danh sách hóa đơn gần đây"
      >
        <table className="compact-table">
          <thead>
            <tr>
              <th>Hóa đơn</th>
              <th>Phòng</th>
              <th>Hạn thanh toán</th>
              <th>Trạng thái</th>
              <th className="align-end">Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            {invoices.slice(0, 5).map((invoice) => {
              const status = invoiceStatusMap[invoice.status];
              return (
                <tr key={invoice.id}>
                  <td>
                    <strong>{invoice.code}</strong>
                    <span>{invoice.tenantLabel}</span>
                  </td>
                  <td>{invoice.roomCode}</td>
                  <td>{formatDate(invoice.dueDate)}</td>
                  <td>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </td>
                  <td className="align-end tabular">
                    {formatCurrency(invoice.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function AlertsPanel() {
  return (
    <Card className="dashboard-list-card">
      <ChartCardHeader
        title="Cần xử lý"
        description="Ưu tiên theo mức độ ảnh hưởng"
      />
      <div className="dashboard-alerts">
        {dashboardAlerts.map((alert) => (
          <Link
            key={alert.id}
            className={`dashboard-alert dashboard-alert--${alert.tone}`}
            to={alert.href}
          >
            <span className="dashboard-alert__icon">
              {alert.tone === "danger" ? (
                <CircleAlert size={17} aria-hidden="true" />
              ) : alert.tone === "warning" ? (
                <CalendarClock size={17} aria-hidden="true" />
              ) : (
                <Wrench size={17} aria-hidden="true" />
              )}
            </span>
            <span>
              <strong>{alert.title}</strong>
              <small>{alert.description}</small>
            </span>
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <PageHeader
        eyebrow="Thứ Sáu, 31 tháng 7"
        title="Chào buổi sáng, An"
        description="Đây là tình hình vận hành mới nhất trên toàn bộ khu trọ."
        actions={
          <>
            <span className="page-period">
              <CalendarDays size={16} aria-hidden="true" />
              Tháng 7, 2026
            </span>
            <Link className="button button--primary button--md" to="/invoices">
              <ReceiptText size={16} aria-hidden="true" />
              <span>Tạo hóa đơn</span>
            </Link>
          </>
        }
      />

      <section className="dashboard-stats" aria-label="Chỉ số tổng quan">
        {dashboardMetrics.map((metric) => (
          <StatCard
            key={metric.id}
            label={metric.label}
            value={metric.displayValue}
            meta={metric.meta}
            icon={metricIcons[metric.id] ?? BedDouble}
            tone={metric.tone}
          />
        ))}
      </section>

      <section className="dashboard-charts" aria-label="Biểu đồ vận hành">
        <RevenueChart />
        <RoomStatusChart />
      </section>

      <section className="dashboard-lower" aria-label="Thông tin cần theo dõi">
        <RecentInvoices />
        <AlertsPanel />
      </section>
    </div>
  );
}
