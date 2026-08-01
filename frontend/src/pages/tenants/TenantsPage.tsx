import { MoreHorizontal, Pencil, Plus, UserRoundPlus } from "lucide-react";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { normalizeApiError } from "../../api/httpClient";
import { tenantsApi } from "../../api/tenantsApi";
import {
  Alert,
  Button,
  DataTable,
  DropdownMenu,
  Input,
  Modal,
  PageHeader,
  type DataTableColumn,
} from "../../components/ui";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAuthStore } from "../../store/authStore";
import type { PagedResult, TenantResponse } from "../../types/api";
import "../../styles/management.css";

const PAGE_SIZE = 10;

interface TenantFormState {
  username: string;
  initialPassword: string;
  fullName: string;
  phoneNumber: string;
  citizenId: string;
}

const emptyForm: TenantFormState = { username: "", initialPassword: "", fullName: "", phoneNumber: "", citizenId: "" };

function maskCitizenId(value: string) {
  if (value.length <= 4) return value;
  return `${"•".repeat(Math.min(8, value.length - 4))}${value.slice(-4)}`;
}

export function TenantsPage() {
  const role = useAuthStore((state) => state.role);
  const canWrite = role === "admin" || role === "staff";
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TenantResponse | null>(null);
  const [form, setForm] = useState<TenantFormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(
    async (signal: AbortSignal): Promise<PagedResult<TenantResponse>> => {
      if (role === "tenant") {
        const tenant = await tenantsApi.me(signal);
        return { items: [tenant], pageNumber: 1, pageSize: 1, totalCount: 1, totalPages: 1 };
      }
      return tenantsApi.list(page, PAGE_SIZE, signal);
    },
    [page, role],
  );
  const { data, loading, error, retry } = useApiQuery(load);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const openEdit = (tenant: TenantResponse) => {
    setEditing(tenant);
    setForm({ username: tenant.username, initialPassword: "", fullName: tenant.fullName, phoneNumber: tenant.phoneNumber, citizenId: tenant.citizenId });
    setFormError("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const columns = useMemo<DataTableColumn<TenantResponse>[]>(
    () => [
      { id: "tenant", header: "Khách thuê", sortValue: (tenant) => tenant.fullName, cell: (tenant) => <span className="primary-cell"><strong>{tenant.fullName}</strong><small>@{tenant.username}</small></span> },
      { id: "phone", header: "Số điện thoại", sortValue: (tenant) => tenant.phoneNumber, cell: (tenant) => tenant.phoneNumber },
      { id: "citizenId", header: "Căn cước", cell: (tenant) => <span className="tabular">{maskCitizenId(tenant.citizenId)}</span> },
      { id: "createdAt", header: "Ngày tạo", sortValue: (tenant) => tenant.createdAt, cell: (tenant) => new Intl.DateTimeFormat("vi-VN").format(new Date(tenant.createdAt)) },
      ...(canWrite ? [{ id: "actions", header: "Thao tác", align: "end" as const, width: "5rem", cell: (tenant: TenantResponse) => <DropdownMenu label={`Thao tác cho ${tenant.fullName}`} trigger={<MoreHorizontal size={18} aria-hidden="true" />} items={[{ label: "Chỉnh sửa hồ sơ", icon: Pencil, onSelect: () => openEdit(tenant) }]} /> }] : []),
    ],
    [canWrite],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (!form.fullName.trim() || !form.phoneNumber.trim() || !form.citizenId.trim() || (!editing && (!form.username.trim() || !form.initialPassword))) {
      setFormError("Hãy nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setFieldErrors({});
    try {
      const saved = editing
        ? await tenantsApi.update(editing.id, { fullName: form.fullName.trim(), phoneNumber: form.phoneNumber.trim(), citizenId: form.citizenId.trim() })
        : await tenantsApi.create({ username: form.username.trim(), initialPassword: form.initialPassword, fullName: form.fullName.trim(), phoneNumber: form.phoneNumber.trim(), citizenId: form.citizenId.trim() });
      setMessage(`${editing ? "Đã cập nhật" : "Đã tạo"} hồ sơ ${saved.fullName}.`);
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
      <PageHeader
        title={role === "tenant" ? "Hồ sơ của tôi" : "Quản lý khách thuê"}
        description={role === "tenant" ? "Thông tin hồ sơ được lấy từ tài khoản khách thuê hiện tại." : "Quản lý hồ sơ khách thuê; số căn cước được che bớt trong bảng."}
        actions={canWrite ? <Button leadingIcon={UserRoundPlus} onClick={openCreate}>Thêm khách thuê</Button> : undefined}
      />
      {message ? <Alert title="Cập nhật thành công" tone="success">{message}</Alert> : null}
      <DataTable
        rows={data?.items ?? []}
        columns={columns}
        getRowId={(tenant) => tenant.id}
        getSearchText={(tenant) => `${tenant.fullName} ${tenant.username} ${tenant.phoneNumber}`}
        searchPlaceholder="Tìm trong trang hiện tại (Backend chưa hỗ trợ tìm kiếm toàn cục)"
        loading={loading}
        error={error}
        onRetry={retry}
        page={data?.pageNumber ?? page}
        pageSize={role === "tenant" ? 1 : PAGE_SIZE}
        totalPages={data?.totalPages ?? 1}
        totalItems={data?.totalCount ?? 0}
        onPageChange={setPage}
        serverPagination
        emptyTitle="Chưa có hồ sơ khách thuê"
        emptyDescription="Backend chưa trả về hồ sơ phù hợp với tài khoản hiện tại."
      />

      <Modal
        open={modalOpen}
        onClose={() => { if (!submitting) setModalOpen(false); }}
        title={editing ? "Chỉnh sửa khách thuê" : "Thêm khách thuê"}
        description="Tài khoản mới sẽ sử dụng tên đăng nhập và mật khẩu ban đầu do bạn cung cấp."
        footer={<><Button variant="secondary" disabled={submitting} onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit" form="tenant-form" leadingIcon={Plus} loading={submitting}>Lưu hồ sơ</Button></>}
      >
        <form id="tenant-form" className="management-form" onSubmit={handleSubmit} noValidate>
          {formError ? <Alert title="Không thể lưu hồ sơ" tone="danger">{formError}</Alert> : null}
          {!editing ? <><Input label="Tên đăng nhập" autoComplete="off" value={form.username} error={fieldErrors.username?.[0]} required onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} /><Input label="Mật khẩu ban đầu" type="password" autoComplete="new-password" value={form.initialPassword} error={fieldErrors.initialPassword?.[0]} required onChange={(event) => setForm((current) => ({ ...current, initialPassword: event.target.value }))} /></> : null}
          <Input label="Họ và tên" value={form.fullName} error={fieldErrors.fullName?.[0]} required onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
          <Input label="Số điện thoại" inputMode="tel" value={form.phoneNumber} error={fieldErrors.phoneNumber?.[0]} required onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))} />
          <Input label="Số căn cước" inputMode="numeric" value={form.citizenId} error={fieldErrors.citizenId?.[0]} required onChange={(event) => setForm((current) => ({ ...current, citizenId: event.target.value }))} />
        </form>
      </Modal>
    </div>
  );
}
