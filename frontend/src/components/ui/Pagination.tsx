import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "./Button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <nav className="pagination" aria-label="Phân trang">
      <p>
        Trang <strong>{page}</strong> / {safeTotalPages}
        <span aria-hidden="true"> · </span>
        <span>{totalItems} mục</span>
      </p>
      <div className="pagination__actions">
        <IconButton
          icon={ChevronLeft}
          label="Trang trước"
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        />
        <IconButton
          icon={ChevronRight}
          label="Trang sau"
          variant="secondary"
          size="sm"
          disabled={page >= safeTotalPages}
          onClick={() => onPageChange(page + 1)}
        />
      </div>
    </nav>
  );
}
