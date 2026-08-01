import { FileCheck2, MoreHorizontal, Pencil, Plus, ScrollText, XCircle } from "lucide-react";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { contractsApi } from "../../api/contractsApi";
import { normalizeApiError } from "../../api/httpClient";
import { roomsApi } from "../../api/roomsApi";
import { tenantsApi } from "../../api/tenantsApi";
import {
  Alert,
  Badge,
  Button,
  DataTable,
  DropdownMenu,
  Input,
  Modal,
  PageHeader,
  Select,
  Tabs,
  type DataTableColumn,
} from "../../components/ui";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAuthStore } from "../../store/authStore";
import type { ContractStatus, RentalContractResponse, RoomResponse, TenantResponse } from "../../types/api";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { contractStatusMap, isContractExpiringSoon } from "../../utils/status";
import "../../styles/management.css";

const PAGE_SIZE = 10;
type ContractTab = "all" | ContractStatus;

interface ContractFormState {
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: string;
}

const emptyForm: ContractFormState = { roomId: "", tenantId: "", startDate: "", endDate: "", monthlyRent: "" };

export function ContractsPage() {
  const role = useAuthStore((state) => state.role);
  const canWrite = role === "admin" || role === "staff";
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ContractTab>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RentalContractResponse | null>(null);
  const [form, setForm] = useState<ContractFormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(
    (signal: AbortSignal) => contractsApi.list({ pageNumber: page, pageSize: PAGE_SIZE, status: status === "all" ? undefined : status }, signal),
    [page, status],
  );
  const { data, loading, error, retry } = useApiQuery(load);

  const loadOptions = useCallback(async (signal: AbortSignal): Promise<{ rooms: RoomResponse[]; tenants: TenantResponse[] }> => {
    if (!canWrite) return { rooms: [], tenants: [] };
    const [rooms, tenants] = await Promise.all([
      roomsApi.list({ pageNumber: 1, pageSize: 100 }, signal),
      tenantsApi.list(1, 100, signal),
    ]);
    return { rooms: rooms.items, tenants: tenants.items };
  }, [canWrite]);
  const options = useApiQuery(loadOptions);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const openEdit = (contract: RentalContractResponse) => {
    setEditing(contract);
    setForm({ roomId: contract.roomId, tenantId: contract.tenantId, startDate: contract.startDate, endDate: contract.endDate, monthlyRent: String(contract.monthlyRent) });
    setFormError("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const runAction = async (contract: RentalContractResponse, action: "activate" | "terminate" | "cancel") => {
    if (submitting) return;
    setSubmitting(true);
    setFormError("");
    try {
      const saved = await contractsApi[action](contract.id);
      setMessage(`Hợp đồng ${saved.id.slice(0, 8)} đã chuyển sang ${contractStatusMap[saved.status].label}.`);
      retry();
    } catch (requestError) {
      setFormError(normalizeApiError(requestError).detail);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo<DataTableColumn<RentalContractResponse>[]>(
    () => [
      { id: "contract", header: "Hợp đồng", sortValue: (contract) => contract.createdAt, cell: (contract) => <span className="primary-cell"><strong>{contract.id.slice(0, 8)}</strong><small>{contract.tenantName ?? contract.tenantId.slice(0, 8)}</small></span> },
      { id: "room", header: "Phòng", sortValue: (contract) => contract.roomNumber ?? "", cell: (contract) => contract.roomNumber ?? contract.roomId.slice(0, 8) },
      { id: "period", header: "Thời hạn", sortValue: (contract) => contract.endDate, cell: (contract) => <span className="primary-cell"><strong>{formatDate(contract.startDate)} – {formatDate(contract.endDate)}</strong>{isContractExpiringSoon(contract.status, contract.endDate) ? <small>Sắp hết hạn trong 30 ngày</small> : null}</span> },
      { id: "rent", header: "Giá thuê", align: "end", sortValue: (contract) => contract.monthlyRent, cell: (contract) => <span className="tabular">{formatCurrency(contract.monthlyRent)}</span> },
      { id: "status", header: "Trạng thái", sortValue: (contract) => contract.status, cell: (contract) => { const definition = isContractExpiringSoon(contract.status, contract.endDate) ? { label: "Sắp hết hạn", tone: "warning" as const } : contractStatusMap[contract.status]; return <Badge tone={definition.tone}>{definition.label}</Badge>; } },
      ...(canWrite ? [{ id: "actions", header: "Thao tác", align: "end" as const, width: "5rem", cell: (contract: RentalContractResponse) => {
        const items = contract.status === "draft"
          ? [
              { label: "Chỉnh sửa", icon: Pencil, onSelect: () => openEdit(contract) },
              { label: "Kích hoạt", icon: FileCheck2, onSelect: () => { void runAction(contract, "activate"); } },
              { label: "Hủy hợp đồng", icon: XCircle, danger: true, separatorBefore: true, onSelect: () => { void runAction(contract, "cancel"); } },
            ]
          : contract.status === "active"
            ? [{ label: "Chấm dứt", icon: ScrollText, danger: true, onSelect: () => { void runAction(contract, "terminate"); } }]
            : [];
        return items.length ? <DropdownMenu label={`Thao tác cho hợp đồng ${contract.id}`} trigger={<MoreHorizontal size={18} aria-hidden="true" />} items={items} /> : <span>Chỉ đọc</span>;
      } }] : []),
    ],
    [canWrite, submitting],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const monthlyRent = Number(form.monthlyRent);
    if ((!editing && (!form.roomId || !form.tenantId)) || !form.startDate || !form.endDate || form.endDate <= form.startDate || monthlyRent <= 0) {
      setFormError("Hãy chọn phòng, khách thuê, thời hạn và giá thuê hợp lệ.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setFieldErrors({});
    try {
      const saved = editing
        ? await contractsApi.update(editing.id, { startDate: form.startDate, endDate: form.endDate, monthlyRent })
        : await contractsApi.create({ roomId: form.roomId, tenantId: form.tenantId, startDate: form.startDate, endDate: form.endDate, monthlyRent });
      setMessage(`${editing ? "Đã cập nhật" : "Đã tạo"} hợp đồng ${saved.id.slice(0, 8)}.`);
      setModalOpen(false);
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

  return (
    <div className="management-page">
      <PageHeader title="Quản lý hợp đồng" description="Trạng thái sắp hết hạn chỉ được tính để trình bày; API vẫn giữ trạng thái active." actions={canWrite ? <Button leadingIcon={Plus} onClick={openCreate}>Tạo hợp đồng</Button> : undefined} />
      {message ? <Alert title="Cập nhật thành công" tone="success">{message}</Alert> : null}
      {formError && !modalOpen ? <Alert title="Không thể cập nhật hợp đồng" tone="danger">{formError}</Alert> : null}
      <Tabs label="Lọc theo trạng thái hợp đồng" activeId={status} onChange={(id) => { setStatus(id as ContractTab); setPage(1); }} items={[{ id: "all", label: "Tất cả" }, ...Object.entries(contractStatusMap).map(([id, definition]) => ({ id, label: definition.label }))]} />
      <DataTable
        rows={data?.items ?? []}
        columns={columns}
        getRowId={(contract) => contract.id}
        getSearchText={(contract) => `${contract.id} ${contract.roomNumber ?? ""} ${contract.tenantName ?? ""}`}
        searchPlaceholder="Tìm trong trang hiện tại (Backend chưa hỗ trợ tìm kiếm toàn cục)"
        loading={loading}
        error={error}
        onRetry={retry}
        page={data?.pageNumber ?? page}
        pageSize={PAGE_SIZE}
        totalPages={data?.totalPages ?? 1}
        totalItems={data?.totalCount ?? 0}
        onPageChange={setPage}
        serverPagination
        emptyTitle="Chưa có hợp đồng"
        emptyDescription="Không có hợp đồng phù hợp với trạng thái đang chọn."
      />

      <Modal
        open={modalOpen}
        onClose={() => { if (!submitting) setModalOpen(false); }}
        title={editing ? "Chỉnh sửa hợp đồng nháp" : "Tạo hợp đồng nháp"}
        description="Hợp đồng mới được Backend tạo ở trạng thái bản nháp."
        footer={<><Button variant="secondary" disabled={submitting} onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit" form="contract-form" loading={submitting}>Lưu hợp đồng</Button></>}
      >
        <form id="contract-form" className="management-form" onSubmit={handleSubmit} noValidate>
          {formError ? <Alert title="Không thể lưu hợp đồng" tone="danger">{formError}</Alert> : null}
          {!editing ? <><Select label="Phòng" placeholder={options.loading ? "Đang tải phòng..." : "Chọn phòng"} value={form.roomId} options={(options.data?.rooms ?? []).map((room) => ({ value: room.id, label: `${room.roomNumber} · ${roomStatusMapLabel(room.status)}` }))} error={options.error || fieldErrors.roomId?.[0]} required onChange={(event) => setForm((current) => ({ ...current, roomId: event.target.value }))} /><Select label="Khách thuê" placeholder={options.loading ? "Đang tải khách thuê..." : "Chọn khách thuê"} value={form.tenantId} options={(options.data?.tenants ?? []).map((tenant) => ({ value: tenant.id, label: `${tenant.fullName} · @${tenant.username}` }))} error={options.error || fieldErrors.tenantId?.[0]} required onChange={(event) => setForm((current) => ({ ...current, tenantId: event.target.value }))} /></> : null}
          <div className="form-grid form-grid--two"><Input label="Ngày bắt đầu" type="date" value={form.startDate} error={fieldErrors.startDate?.[0]} required onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} /><Input label="Ngày kết thúc" type="date" value={form.endDate} error={fieldErrors.endDate?.[0]} required onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} /></div>
          <Input label="Giá thuê mỗi tháng" type="number" inputMode="numeric" min="1" suffix="VND" value={form.monthlyRent} error={fieldErrors.monthlyRent?.[0]} required onChange={(event) => setForm((current) => ({ ...current, monthlyRent: event.target.value }))} />
        </form>
      </Modal>
    </div>
  );
}

function roomStatusMapLabel(status: RoomResponse["status"]) {
  return status === "available" ? "Phòng trống" : status === "occupied" ? "Đang thuê" : status === "maintenance" ? "Bảo trì" : "Ngừng hoạt động";
}
