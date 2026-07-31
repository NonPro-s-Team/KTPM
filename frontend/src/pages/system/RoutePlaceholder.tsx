import { Construction } from "lucide-react";
import { Card, PageHeader } from "../../components/ui";

export interface RoutePlaceholderProps {
  title: string;
  description: string;
  standalone?: boolean;
}

export function RoutePlaceholder({
  title,
  description,
  standalone = false,
}: RoutePlaceholderProps) {
  const content = (
    <div className="placeholder-page">
      <PageHeader title={title} description={description} />
      <Card className="placeholder-card">
        <span>
          <Construction size={20} aria-hidden="true" />
        </span>
        <div>
          <h2>Đang hoàn thiện module</h2>
          <p>
            Khung giao diện và các trạng thái tương tác đang được kết nối với dữ
            liệu bản mẫu.
          </p>
        </div>
      </Card>
    </div>
  );

  return standalone ? (
    <main className="standalone-placeholder">{content}</main>
  ) : (
    content
  );
}
