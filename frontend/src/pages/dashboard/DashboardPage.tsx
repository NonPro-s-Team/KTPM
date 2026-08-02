import { BedDouble, CircleAlert, DoorOpen, ReceiptText, Wrench } from "lucide-react";
import { useCallback } from "react";
import { dashboardApi } from "../../api/dashboardApi";
import { Alert, Button, Card, PageHeader, Skeleton, StatCard } from "../../components/ui";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAuthStore } from "../../store/authStore";
import "../../styles/dashboard.css";

export function DashboardPage() {
  const username = useAuthStore((state) => state.username);
  const load = useCallback((signal: AbortSignal) => dashboardApi.getSummary(signal), []);
  const { data, loading, error, retry } = useApiQuery(load);

  return (
    <div className="dashboard-page">
      <PageHeader
        title={`Xin chào${username ? `, ${username}` : ""}`}
        // description="Các chỉ số vận hành hiện tại được tải trực tiếp từ RMS Backend API."
      />

      {error ? (
        <Alert title="Không thể tải tổng quan" tone="danger">
          <p>{error}</p>
          <Button variant="secondary" onClick={retry}>Thử lại</Button>
        </Alert>
      ) : null}

      {loading ? (
        <section className="dashboard-stats" aria-label="Đang tải chỉ số tổng quan">
          {Array.from({ length: 4 }, (_, index) => <Card key={index} className="stat-card"><Skeleton height="5rem" /></Card>)}
        </section>
      ) : data ? (
        <>
          <section className="dashboard-stats" aria-label="Chỉ số tổng quan">
            <StatCard label="Tổng số phòng" value={String(data.totalRooms)} meta="Phòng trong hệ thống" icon={BedDouble} />
            <StatCard label="Đang thuê" value={String(data.occupiedRooms)} meta="Phòng có người thuê" icon={DoorOpen} tone="success" />
            <StatCard label="Yêu cầu sửa chữa đang mở" value={String(data.activeMaintenanceRequests)} meta="Cần tiếp tục xử lý" icon={Wrench} tone="warning" />
            <StatCard label="Hóa đơn chưa thanh toán" value={String(data.unpaidInvoices)} meta="Cần theo dõi công nợ" icon={ReceiptText} tone={data.unpaidInvoices > 0 ? "danger" : "success"} />
          </section>
          <section className="dashboard-charts" aria-label="Thông tin dữ liệu">
            <Card className="dashboard-chart-card">
              <div className="dashboard-card__header"><div><h2>Phòng còn lại</h2></div></div>
              <div className="empty-state"><span className="empty-state__icon"><CircleAlert size={24} aria-hidden="true" /></span><h3>{Math.max(0, data.totalRooms - data.occupiedRooms)} phòng chưa được ghi nhận là đang thuê</h3><p>Con số này có thể bao gồm phòng trống, bảo trì hoặc ngừng hoạt động.</p></div>
            </Card>
            <Card className="dashboard-chart-card">
              <div className="dashboard-card__header"><div><h2>Lịch sử doanh thu</h2><p>Chưa có API dữ liệu lịch sử.</p></div></div>
              <div className="empty-state"><span className="empty-state__icon"><CircleAlert size={24} aria-hidden="true" /></span><h3>Chưa có dữ liệu biểu đồ</h3></div>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}
