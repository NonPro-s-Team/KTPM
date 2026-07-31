import { Building2 } from "lucide-react";
import { Card, EmptyState, PageHeader } from "../../components/ui";
import "../../styles/management.css";

export function PropertiesPage() {
  return (
    <div className="management-page">
      <PageHeader title="Khu trọ" description="Trạng thái hỗ trợ của Backend API." />
      <Card>
        <EmptyState
          icon={Building2}
          title="Module khu trọ chưa được Backend API hỗ trợ"
          description="RMS Backend hiện chưa có Property entity hoặc /api/properties. Không có dữ liệu khu trọ giả được hiển thị tại đây."
        />
      </Card>
    </div>
  );
}
