import { CheckCircle2, MoreHorizontal, Pencil, Play, Plus, Wrench } from "lucide-react";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { normalizeApiError } from "../../api/httpClient";
import { maintenanceApi } from "../../api/maintenanceApi";
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
  Tabs,
  Textarea,
  type DataTableColumn,
} from "../../components/ui";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAuthStore } from "../../store/authStore";
import type { MaintenanceRequestResponse, MaintenanceRequestStatus } from "../../types/api";
import { formatDate } from "../../utils/formatters";
import { maintenanceStatusMap } from "../../utils/status";
import "../../styles/management.css";

const PAGE_SIZE = 10;
type MaintenanceTab = "all" | MaintenanceRequestStatus;
type ActionKind = "start" | "note" | "resolve" | "close";

export function MaintenancePage() {
  const role = useAuthStore((state) => state.role);
  const isTenant = role === "tenant";
  const canManage = role === "admin" || role === "staff";
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<MaintenanceTab>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [actionRequest, setActionRequest] = useState<MaintenanceRequestResponse | null>(null);
  const [actionKind, setActionKind] = useState<ActionKind>("start");
  const [actionNote, setActionNote] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(
    (signal: AbortSignal) => maintenanceApi.list({ pageNumber: page, pageSize: PAGE_SIZE, status: status === "all" ? undefined : status }, signal),
    [page, status],
  );
  const { data, loading, error, retry } = useApiQuery(load);

  const openCreate = () => {
    setTitle("");
    setDescription("");
    setFormError("");
    setFieldErrors({});
    setDrawerOpen(true);
  };

  const openAction = (request: MaintenanceRequestResponse, kind: ActionKind) => {
    setActionRequest(request);
    setActionKind(kind);
    setActionNote("");
    setFormError("");
    setFieldErrors({});
  };

  const columns = useMemo<DataTableColumn<MaintenanceRequestResponse>[]>(
    () => [
      { id: "request", header: "Yêu cầu", sortValue: (request) => request.title, cell: (request) => <span className="primary-cell"><strong>{request.title}</strong><small>{request.description}</small></span> },
      { id: "room", header: "Phòng", cell: (request) => request.roomId.slice(0, 8) },
      { id: "createdAt", header: "Ngày tạo", sortValue: (request) => request.createdAt, cell: (request) => formatDate(request.createdAt) },
      { id: "timeline", header: "Mốc xử lý", cell: (request) => <span className="primary-cell"><strong>{request.closedAt ? `Đóng ${formatDate(request.closedAt)}` : request.resolvedAt ? `Xử lý ${formatDate(request.resolvedAt)}` : request.startedAt ? `Bắt đầu ${formatDate(request.startedAt)}` : "Chưa bắt đầu"}</strong><small>{request.updates.length} cập nhật</small></span> },
      { id: "status", header: "Trạng thái", sortValue: (request) => request.status, cell: (request) => { const definition = maintenanceStatusMap[request.status]; return <Badge tone={definition.tone}>{definition.label}</Badge>; } },
      ...(canManage ? [{ id: "actions", header: "Thao tác", align: "end" as const, width: "5rem", cell: (request: MaintenanceRequestResponse) => {
        const items = request.status === "submitted"
          ? [{ label: "Bắt đầu xử lý", icon: Play, onSelect: () => openAction(request, "start") }]
          : request.status === "inProgress"
            ? [{ label: "Thêm ghi chú", icon: Pencil, onSelect: () => openAction(request, "note") }, { label: "Đánh dấu đã xử lý", icon: CheckCircle2, onSelect: () => openAction(request, "resolve") }]
            : request.status === "resolved"
              ? [{ label: "Đóng yêu cầu", icon: CheckCircle2, onSelect: () => openAction(request, "close") }]
              : [];
        return items.length ? <DropdownMenu label={`Thao tác cho ${request.title}`} trigger={<MoreHorizontal size={18} aria-hidden="true" />} items={items} /> : <span>Chỉ đọc</span>;
      } }] : []),
    ],
    [canManage],
  );

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (!title.trim() || !description.trim()) {
      setFormError("Hãy nhập tiêu đề và mô tả yêu cầu.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    setFieldErrors({});
    try {
      const saved = await maintenanceApi.create({ title: title.trim(), description: description.trim() });
      setMessage(`Đã tạo yêu cầu ${saved.id.slice(0, 8)}.`);
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

  const handleAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!actionRequest || submitting) return;
    if ((actionKind === "note" || actionKind === "resolve") && !actionNote.trim()) {
      setFormError("Ghi chú là bắt buộc cho thao tác này.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    setFieldErrors({});
    try {
      const saved = actionKind === "start"
        ? await maintenanceApi.start(actionRequest.id, { note: actionNote.trim() || null })
        : actionKind === "note"
          ? await maintenanceApi.addProgressNote(actionRequest.id, { note: actionNote.trim() })
          : actionKind === "resolve"
            ? await maintenanceApi.resolve(actionRequest.id, { resolutionNote: actionNote.trim() })
            : await maintenanceApi.close(actionRequest.id, { note: actionNote.trim() || null });
      setMessage(`Yêu cầu ${saved.id.slice(0, 8)} đã chuyển sang ${maintenanceStatusMap[saved.status].label}.`);
      setActionRequest(null);
      retry();
    } catch (requestError) {
      const apiError = normalizeApiError(requestError);
      setFormError(apiError.detail);
      setFieldErrors(apiError.fieldErrors ?? {});
    } finally {
      setSubmitting(false);
    }
  };

  const actionLabels: Record<ActionKind, string> = { start: "Bắt đầu xử lý", note: "Thêm ghi chú tiến độ", resolve: "Đánh dấu đã xử lý", close: "Đóng yêu cầu" };

  return (
    <div className="management-page">
      <PageHeader
        title="Yêu cầu sửa chữa"
        description="Yêu cầu và lịch sử chuyển trạng thái được tải trực tiếp từ Backend API."
        actions={isTenant ? <Button leadingIcon={Plus} onClick={openCreate}>Tạo yêu cầu</Button> : undefined}
      />
      {message ? <Alert title="Cập nhật thành công" tone="success">{message}</Alert> : null}
      <Tabs label="Lọc theo trạng thái sửa chữa" activeId={status} onChange={(id) => { setStatus(id as MaintenanceTab); setPage(1); }} items={[{ id: "all", label: "Tất cả", icon: Wrench }, ...Object.entries(maintenanceStatusMap).map(([id, definition]) => ({ id, label: definition.label }))]} />
      <DataTable
        rows={data?.items ?? []}
        columns={columns}
        getRowId={(request) => request.id}
        getSearchText={(request) => `${request.title} ${request.description} ${request.roomId}`}
        searchPlaceholder="Tìm trong trang hiện tại..."
        loading={loading}
        error={error}
        onRetry={retry}
        page={data?.pageNumber ?? page}
        pageSize={PAGE_SIZE}
        totalPages={data?.totalPages ?? 1}
        totalItems={data?.totalCount ?? 0}
        onPageChange={setPage}
        serverPagination
        emptyTitle="Chưa có yêu cầu sửa chữa"
        emptyDescription="Không có yêu cầu phù hợp với trạng thái đang chọn."
      />

      <Drawer open={drawerOpen} onClose={() => { if (!submitting) setDrawerOpen(false); }} title="Tạo yêu cầu sửa chữa" description="Backend sẽ tự xác định phòng từ hợp đồng đang hiệu lực của khách thuê." footer={<><Button variant="secondary" disabled={submitting} onClick={() => setDrawerOpen(false)}>Hủy</Button><Button type="submit" form="maintenance-create-form" loading={submitting}>Tạo yêu cầu</Button></>}>
        <form id="maintenance-create-form" className="management-form" onSubmit={handleCreate} noValidate>
          {formError ? <Alert title="Không thể tạo yêu cầu" tone="danger">{formError}</Alert> : null}
          <Input label="Tiêu đề" value={title} error={fieldErrors.title?.[0]} required onChange={(event) => setTitle(event.target.value)} />
          <Textarea label="Mô tả chi tiết" value={description} error={fieldErrors.description?.[0]} required onChange={(event) => setDescription(event.target.value)} />
        </form>
      </Drawer>

      <Modal open={Boolean(actionRequest)} onClose={() => { if (!submitting) setActionRequest(null); }} title={actionLabels[actionKind]} description={actionRequest?.title} footer={<><Button variant="secondary" disabled={submitting} onClick={() => setActionRequest(null)}>Hủy</Button><Button type="submit" form="maintenance-action-form" loading={submitting}>Xác nhận</Button></>}>
        <form id="maintenance-action-form" className="management-form" onSubmit={handleAction} noValidate>
          {formError ? <Alert title="Không thể cập nhật yêu cầu" tone="danger">{formError}</Alert> : null}
          <Textarea label={actionKind === "resolve" ? "Ghi chú xử lý" : "Ghi chú"} value={actionNote} error={fieldErrors.note?.[0] ?? fieldErrors.resolutionNote?.[0]} required={actionKind === "note" || actionKind === "resolve"} onChange={(event) => setActionNote(event.target.value)} />
        </form>
      </Modal>
    </div>
  );
}
