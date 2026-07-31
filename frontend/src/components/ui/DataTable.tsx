import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { Button } from "./Button";
import { EmptyState, Skeleton } from "./Feedback";
import { Pagination } from "./Pagination";
import { SearchInput } from "./SearchInput";

type SortValue = string | number;
type SortDirection = "asc" | "desc";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => SortValue;
  align?: "start" | "center" | "end";
  width?: string;
}

export interface DataTableFilter<T> {
  id: string;
  label: string;
  options: Array<{ label: string; value: string }>;
  predicate: (row: T, value: string) => boolean;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  getSearchText: (row: T) => string;
  filters?: DataTableFilter<T>[];
  searchPlaceholder?: string;
  pageSize?: number;
  selectable?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

function compareSortValues(left: SortValue, right: SortValue) {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), "vi", {
    numeric: true,
    sensitivity: "base",
  });
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  getSearchText,
  filters = [],
  searchPlaceholder = "Tìm kiếm...",
  pageSize = 6,
  selectable = false,
  loading = false,
  error,
  onRetry,
  emptyTitle = "Chưa có dữ liệu",
  emptyDescription = "Dữ liệu phù hợp sẽ xuất hiện tại đây.",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{
    columnId: string;
    direction: SortDirection;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredRows = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLocaleLowerCase("vi");
    return rows.filter((row) => {
      const matchesSearch =
        !normalizedSearch ||
        getSearchText(row).toLocaleLowerCase("vi").includes(normalizedSearch);
      const matchesFilters = filters.every((filter) => {
        const value = filterValues[filter.id];
        return !value || filter.predicate(row, value);
      });
      return matchesSearch && matchesFilters;
    });
  }, [deferredSearch, filterValues, filters, getSearchText, rows]);

  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows;
    const column = columns.find((item) => item.id === sort.columnId);
    if (!column?.sortValue) return filteredRows;

    return filteredRows.toSorted((left, right) => {
      const comparison = compareSortValues(
        column.sortValue!(left),
        column.sortValue!(right),
      );
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [columns, filteredRows, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleRows = sortedRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selectedIds.has(getRowId(row)));

  const toggleSort = (columnId: string) => {
    setSort((current) => {
      if (!current || current.columnId !== columnId) {
        return { columnId, direction: "asc" };
      }
      return {
        columnId,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const toggleAllVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        visibleRows.forEach((row) => next.delete(getRowId(row)));
      } else {
        visibleRows.forEach((row) => next.add(getRowId(row)));
      }
      return next;
    });
  };

  const toggleRow = (rowId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });
  };

  return (
    <section className="data-table" aria-busy={loading}>
      <div className="data-table__toolbar">
        <SearchInput
          value={search}
          placeholder={searchPlaceholder}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          onClear={() => {
            setSearch("");
            setPage(1);
          }}
        />
        <div className="data-table__filters">
          {filters.map((filter) => (
            <label className="table-filter" key={filter.id}>
              <span>{filter.label}</span>
              <select
                value={filterValues[filter.id] ?? ""}
                onChange={(event) => {
                  setFilterValues((current) => ({
                    ...current,
                    [filter.id]: event.target.value,
                  }));
                  setPage(1);
                }}
              >
                <option value="">Tất cả</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      {selectedIds.size > 0 ? (
        <div className="data-table__selection" role="status">
          Đã chọn <strong>{selectedIds.size}</strong> mục
          <button type="button" onClick={() => setSelectedIds(new Set())}>
            Bỏ chọn
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="data-table__state" role="alert">
          <div>
            <strong>Không thể tải dữ liệu</strong>
            <p>{error}</p>
          </div>
          {onRetry ? (
            <Button
              variant="secondary"
              leadingIcon={RefreshCw}
              onClick={onRetry}
            >
              Thử lại
            </Button>
          ) : null}
        </div>
      ) : !loading && visibleRows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div
          className="data-table__scroll"
          tabIndex={0}
          role="region"
          aria-label="Bảng dữ liệu, có thể cuộn ngang trên màn hình nhỏ"
        >
          <table>
            <thead>
              <tr>
                {selectable ? (
                  <th className="data-table__select-column">
                    <input
                      type="checkbox"
                      aria-label="Chọn tất cả hàng đang hiển thị"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                    />
                  </th>
                ) : null}
                {columns.map((column) => {
                  const direction =
                    sort?.columnId === column.id ? sort.direction : null;
                  const SortIcon =
                    direction === "asc"
                      ? ArrowUp
                      : direction === "desc"
                        ? ArrowDown
                        : ArrowUpDown;
                  return (
                    <th
                      key={column.id}
                      style={{ width: column.width }}
                      className={`align-${column.align ?? "start"}`}
                      aria-sort={
                        direction
                          ? direction === "asc"
                            ? "ascending"
                            : "descending"
                          : undefined
                      }
                    >
                      {column.sortValue ? (
                        <button
                          type="button"
                          className="data-table__sort"
                          onClick={() => toggleSort(column.id)}
                        >
                          {column.header}
                          <SortIcon size={14} aria-hidden="true" />
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: pageSize }, (_, rowIndex) => (
                    <tr key={`skeleton-${rowIndex}`}>
                      {selectable ? (
                        <td>
                          <Skeleton width="1rem" height="1rem" />
                        </td>
                      ) : null}
                      {columns.map((column) => (
                        <td key={column.id}>
                          <Skeleton width="75%" height="1rem" />
                        </td>
                      ))}
                    </tr>
                  ))
                : visibleRows.map((row) => {
                    const rowId = getRowId(row);
                    const selected = selectedIds.has(rowId);
                    return (
                      <tr key={rowId} data-selected={selected || undefined}>
                        {selectable ? (
                          <td className="data-table__select-column">
                            <input
                              type="checkbox"
                              aria-label={`Chọn hàng ${rowId}`}
                              checked={selected}
                              onChange={() => toggleRow(rowId)}
                            />
                          </td>
                        ) : null}
                        {columns.map((column) => (
                          <td
                            key={column.id}
                            className={`align-${column.align ?? "start"}`}
                          >
                            {column.cell(row)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      )}

      {!error && !loading && sortedRows.length > 0 ? (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={sortedRows.length}
          onPageChange={setPage}
        />
      ) : null}
    </section>
  );
}
