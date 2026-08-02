import { BedDouble, MoreHorizontal, Pencil, Plus, RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { normalizeApiError } from "../../api/httpClient";
import { roomsApi } from "../../api/roomsApi";
import {
  Alert,
  Badge,
  Button,
  DataTable,
  Drawer,
  DropdownMenu,
  Input,
  Modal,
  PageHeader,
  Select,
  Tabs,
  Textarea,
  type DataTableColumn,
} from "../../components/ui";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAuthStore } from "../../store/authStore";
import type { RoomResponse, RoomStatus } from "../../types/api";
import { formatCurrency } from "../../utils/formatters";
import { roomStatusMap } from "../../utils/status";
import "../../styles/management.css";

const PAGE_SIZE = 10;
type RoomTab = "all" | RoomStatus;

interface RoomFormState {
  roomNumber: string;
  monthlyRent: string;
  description: string;
}

const emptyForm: RoomFormState = { roomNumber: "", monthlyRent: "", description: "" };

export function RoomsPage() {
  const role = useAuthStore((state) => state.role);
  const canWrite = role === "admin" || role === "staff";
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<RoomTab>("all");
  const [editing, setEditing] = useState<RoomResponse | null>(null);
  const [statusRoom, setStatusRoom] = useState<RoomResponse | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<RoomFormState>(emptyForm);
  const [targetStatus, setTargetStatus] = useState<RoomStatus>("available");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(
    (signal: AbortSignal) => roomsApi.list({ pageNumber: page, pageSize: PAGE_SIZE, status: status === "all" ? undefined : status }, signal),
    [page, status],
  );
  const { data, loading, error, retry } = useApiQuery(load);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setFieldErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (room: RoomResponse) => {
    setEditing(room);
    setForm({ roomNumber: room.roomNumber, monthlyRent: String(room.monthlyRent), description: room.description ?? "" });
    setFormError("");
    setFieldErrors({});
    setDrawerOpen(true);
  };

  const openStatus = (room: RoomResponse) => {
    setStatusRoom(room);
    setTargetStatus(room.status);
    setFormError("");
  };

  const columns = useMemo<DataTableColumn<RoomResponse>[]>(
    () => [
      { id: "roomNumber", header: "Phòng", sortValue: (room) => room.roomNumber, cell: (room) => <span className="primary-cell"><strong>{room.roomNumber}</strong><small>{room.description || "Không có mô tả"}</small></span> },
      { id: "rent", header: "Giá thuê", align: "end", sortValue: (room) => room.monthlyRent, cell: (room) => <span className="tabular">{formatCurrency(room.monthlyRent)}</span> },
      { id: "status", header: "Trạng thái", sortValue: (room) => room.status, cell: (room) => { const definition = roomStatusMap[room.status]; return <Badge tone={definition.tone}>{definition.label}</Badge>; } },
      { id: "updated", header: "Cập nhật gần nhất", sortValue: (room) => room.updatedAt ?? room.createdAt, cell: (room) => new Intl.DateTimeFormat("vi-VN").format(new Date(room.updatedAt ?? room.createdAt)) },
      ...(canWrite
        ? [{ id: "actions", header: "Thao tác", align: "end" as const, width: "5rem", cell: (room: RoomResponse) => <div className="row-actions"><DropdownMenu label={`Thao tác cho phòng ${room.roomNumber}`} trigger={<MoreHorizontal size={18} aria-hidden="true" />} items={[{ label: "Chỉnh sửa", icon: Pencil, onSelect: () => openEdit(room) }, { label: "Đổi trạng thái", icon: RefreshCw, onSelect: () => openStatus(room) }]} /></div> }]
        : []),
    ],
    [canWrite],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const monthlyRent = Number(form.monthlyRent);
    if (!form.roomNumber.trim() || !Number.isFinite(monthlyRent) || monthlyRent <= 0) {
      setFormError("Hãy nhập số phòng và giá thuê hợp lệ.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setFieldErrors({});
    try {
      const request = { roomNumber: form.roomNumber.trim(), monthlyRent, description: form.description.trim() || null };
      const saved = editing ? await roomsApi.update(editing.id, request) : await roomsApi.create(request);
      setMessage(`${editing ? "Đã cập nhật" : "Đã thêm"} phòng ${saved.roomNumber}.`);
      setDrawerOpen(false);
      setPage(1);
      retry();
    } catch (requestError) {
      const apiError = normalizeApiError(requestError);
      setFormError(apiError.detail);
      setFieldErrors(apiError.fieldErrors ?? {});
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusRoom || submitting) return;
    setSubmitting(true);
    setFormError("");
    try {
      const saved = await roomsApi.changeStatus(statusRoom.id, { targetStatus });
      setMessage(`Đã chuyển phòng ${saved.roomNumber} sang trạng thái ${roomStatusMap[saved.status].label}.`);
      setStatusRoom(null);
      retry();
    } catch (requestError) {
      setFormError(normalizeApiError(requestError).detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="management-page rooms-page">
      <PageHeader title="Quản lý phòng" actions={canWrite ? <Button leadingIcon={Plus} onClick={openCreate}>Thêm phòng</Button> : undefined} />
      {message ? <Alert title="Cập nhật thành công" tone="success">{message}</Alert> : null}
      <Tabs
        label="Lọc theo trạng thái phòng"
        activeId={status}
        onChange={(id) => { setStatus(id as RoomTab); setPage(1); }}
        items={[
          { id: "all", label: "Tất cả", icon: BedDouble },
          { id: "available", label: "Phòng trống" },
          { id: "occupied", label: "Đang thuê" },
          { id: "maintenance", label: "Bảo trì" },
          { id: "inactive", label: "Ngừng hoạt động" },
        ]}
      />
      <DataTable
        rows={data?.items ?? []}
        columns={columns}
        getRowId={(room) => room.id}
        getSearchText={(room) => `${room.roomNumber} ${room.description ?? ""}`}
        searchPlaceholder="Tìm kiếm"
        loading={loading}
        error={error}
        onRetry={retry}
        page={data?.pageNumber ?? page}
        pageSize={PAGE_SIZE}
        totalPages={data?.totalPages ?? 1}
        totalItems={data?.totalCount ?? 0}
        onPageChange={setPage}
        serverPagination
        emptyTitle="Chưa có phòng"
        emptyDescription="Không có phòng phù hợp với trạng thái đang chọn."
      />

      <Drawer
        open={drawerOpen}
        onClose={() => { if (!submitting) setDrawerOpen(false); }}
        title={editing ? `Chỉnh sửa phòng ${editing.roomNumber}` : "Thêm phòng mới"}
        description="Thông tin phải khớp với hợp đồng dữ liệu của Backend API."
        footer={<><Button variant="secondary" disabled={submitting} onClick={() => setDrawerOpen(false)}>Hủy</Button><Button type="submit" form="room-form" loading={submitting}>Lưu phòng</Button></>}
      >
        <form id="room-form" className="management-form" onSubmit={handleSubmit} noValidate>
          {formError ? <Alert title="Không thể lưu phòng" tone="danger">{formError}</Alert> : null}
          <Input label="Số phòng" value={form.roomNumber} error={fieldErrors.roomNumber?.[0]} required onChange={(event) => setForm((current) => ({ ...current, roomNumber: event.target.value }))} />
          <Input label="Giá thuê mỗi tháng" type="number" inputMode="numeric" min="1" suffix="VND" value={form.monthlyRent} error={fieldErrors.monthlyRent?.[0]} required onChange={(event) => setForm((current) => ({ ...current, monthlyRent: event.target.value }))} />
          <Textarea label="Mô tả" value={form.description} error={fieldErrors.description?.[0]} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
        </form>
      </Drawer>

      <Modal
        open={Boolean(statusRoom)}
        onClose={() => { if (!submitting) setStatusRoom(null); }}
        title="Đổi trạng thái phòng"
        description={statusRoom ? `Chọn trạng thái mới cho phòng ${statusRoom.roomNumber}.` : undefined}
        footer={<><Button variant="secondary" disabled={submitting} onClick={() => setStatusRoom(null)}>Hủy</Button><Button loading={submitting} onClick={() => { void handleStatusChange(); }}>Cập nhật</Button></>}
      >
        {formError ? <Alert title="Không thể đổi trạng thái" tone="danger">{formError}</Alert> : null}
        <Select label="Trạng thái" value={targetStatus} options={Object.entries(roomStatusMap).map(([value, definition]) => ({ value, label: definition.label }))} onChange={(event) => setTargetStatus(event.target.value as RoomStatus)} />
      </Modal>
    </div>
  );
}
