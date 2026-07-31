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
            Module này chưa có luồng API phù hợp trong phiên bản hiện tại.
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
