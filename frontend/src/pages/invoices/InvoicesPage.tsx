import { CircleDollarSign, MoreHorizontal, Pencil, Plus, Send } from "lucide-react";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { contractsApi } from "../../api/contractsApi";
import { normalizeApiError } from "../../api/httpClient";
import { invoicesApi } from "../../api/invoicesApi";
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
  Textarea,
  type DataTableColumn,
} from "../../components/ui";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAuthStore } from "../../store/authStore";
import type { InvoiceResponse, InvoiceStatus, RentalContractResponse } from "../../types/api";
import { formatCurrency } from "../../utils/formatters";
import { invoiceStatusMap } from "../../utils/status";
import "../../styles/management.css";

const PAGE_SIZE = 10;
type InvoiceTab = "all" | InvoiceStatus;

interface InvoiceFormState {
  contractId: string;
  billingPeriod: string;
  rentAmount: string;
  electricityStartReading: string;
  electricityEndReading: string;
  waterStartReading: string;
  waterEndReading: string;
  electricityUnitPrice: string;
  waterUnitPrice: string;
}

const emptyForm: InvoiceFormState = {
  contractId: "",
  billingPeriod: "",
  rentAmount: "",
  electricityStartReading: "0",
  electricityEndReading: "0",
  waterStartReading: "0",
  waterEndReading: "0",
  electricityUnitPrice: "0",
  waterUnitPrice: "0",
};

function numericReadings(form: InvoiceFormState) {
  return {
    electricityStartReading: Number(form.electricityStartReading),
    electricityEndReading: Number(form.electricityEndReading),
    waterStartReading: Number(form.waterStartReading),
    waterEndReading: Number(form.waterEndReading),
    electricityUnitPrice: Number(form.electricityUnitPrice),
    waterUnitPrice: Number(form.waterUnitPrice),
  };
}

export function InvoicesPage() {
  const role = useAuthStore((state) => state.role);
  const canWrite = role === "admin" || role === "staff";
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<InvoiceTab>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceResponse | null>(null);
  const [editing, setEditing] = useState<InvoiceResponse | null>(null);
  const [form, setForm] = useState<InvoiceFormState>(emptyForm);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(
    (signal: AbortSignal) => invoicesApi.list({ pageNumber: page, pageSize: PAGE_SIZE, status: status === "all" ? undefined : status }, signal),
    [page, status],
  );
  const { data, loading, error, retry } = useApiQuery(load);

  const loadContracts = useCallback(
    (signal: AbortSignal) => contractsApi.list({ pageNumber: 1, pageSize: 100 }, signal),
    [],
  );
  const contractsQuery = useApiQuery(loadContracts);
  const contractMap = useMemo(
    () => new Map((contractsQuery.data?.items ?? []).map((contract) => [contract.id, contract])),
    [contractsQuery.data],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const openEdit = (invoice: InvoiceResponse) => {
    setEditing(invoice);
    setForm({
      contractId: invoice.contractId,
      billingPeriod: `${invoice.billingYear}-${String(invoice.billingMonth).padStart(2, "0")}`,
      rentAmount: String(invoice.rentAmount),
      electricityStartReading: String(invoice.electricityStartReading),
      electricityEndReading: String(invoice.electricityEndReading),
      waterStartReading: String(invoice.waterStartReading),
      waterEndReading: String(invoice.waterEndReading),
      electricityUnitPrice: String(invoice.electricityUnitPrice),
      waterUnitPrice: String(invoice.waterUnitPrice),
    });
    setFormError("");
    setFieldErrors({});
    setModalOpen(true);
  };

  const openPayment = (invoice: InvoiceResponse) => {
    setPaymentInvoice(invoice);
    setPaymentAmount(String(invoice.outstandingAmount));
    setPaymentNote("");
    setFormError("");
    setFieldErrors({});
  };

  const issueInvoice = async (invoice: InvoiceResponse) => {
    if (submitting) return;
    setSubmitting(true);
    setFormError("");
    try {
      const saved = await invoicesApi.issue(invoice.id);
      setMessage(`Đã phát hành hóa đơn ${saved.id.slice(0, 8)}.`);
      retry();
    } catch (requestError) {
      setFormError(normalizeApiError(requestError).detail);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo<DataTableColumn<InvoiceResponse>[]>(
    () => [
      { id: "invoice", header: "Hóa đơn", sortValue: (invoice) => invoice.createdAt, cell: (invoice) => <span className="primary-cell"><strong>{invoice.id.slice(0, 8)}</strong><small>Kỳ {String(invoice.billingMonth).padStart(2, "0")}/{invoice.billingYear}</small></span> },
      { id: "contract", header: "Hợp đồng", cell: (invoice) => { const contract = contractMap.get(invoice.contractId); return <span className="primary-cell"><strong>{contract?.roomNumber ?? invoice.contractId.slice(0, 8)}</strong><small>{contract?.tenantName ?? "Hợp đồng"}</small></span>; } },
      { id: "amounts", header: "Tiền thuê / Điện / Nước", align: "end", cell: (invoice) => <span className="primary-cell align-end"><strong>{formatCurrency(invoice.rentAmount)}</strong><small>{formatCurrency(invoice.electricityAmount)} / {formatCurrency(invoice.waterAmount)}</small></span> },
      { id: "total", header: "Tổng / Còn lại", align: "end", sortValue: (invoice) => invoice.totalAmount, cell: (invoice) => <span className="primary-cell align-end"><strong>{formatCurrency(invoice.totalAmount)}</strong><small>Còn {formatCurrency(invoice.outstandingAmount)}</small></span> },
      { id: "status", header: "Trạng thái", sortValue: (invoice) => invoice.status, cell: (invoice) => { const definition = invoiceStatusMap[invoice.status]; return <Badge tone={definition.tone}>{definition.label}</Badge>; } },
      ...(canWrite ? [{ id: "actions", header: "Thao tác", align: "end" as const, width: "5rem", cell: (invoice: InvoiceResponse) => {
        const items = invoice.status === "draft"
          ? [
              { label: "Chỉnh sửa", icon: Pencil, onSelect: () => openEdit(invoice) },
              { label: "Phát hành", icon: Send, onSelect: () => { void issueInvoice(invoice); } },
            ]
          : ["issued", "partiallyPaid", "overdue"].includes(invoice.status)
            ? [{ label: "Ghi nhận thanh toán", icon: CircleDollarSign, onSelect: () => openPayment(invoice) }]
            : [];
        return items.length ? <DropdownMenu label={`Thao tác cho hóa đơn ${invoice.id}`} trigger={<MoreHorizontal size={18} aria-hidden="true" />} items={items} /> : <span>Chỉ đọc</span>;
      } }] : []),
    ],
    [canWrite, contractMap, submitting],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const readings = numericReadings(form);
    const values = Object.values(readings);
    if ((!editing && (!form.contractId || !form.billingPeriod)) || values.some((value) => !Number.isFinite(value) || value < 0) || readings.electricityEndReading < readings.electricityStartReading || readings.waterEndReading < readings.waterStartReading) {
      setFormError("Hãy nhập hợp đồng, kỳ hóa đơn, chỉ số và đơn giá hợp lệ.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setFieldErrors({});
    try {
      let saved: InvoiceResponse;
      if (editing) {
        const rentAmount = Number(form.rentAmount);
        if (!Number.isFinite(rentAmount) || rentAmount < 0) throw new Error("Tiền thuê không hợp lệ.");
        saved = await invoicesApi.update(editing.id, { rentAmount, ...readings });
      } else {
        const [year, month] = form.billingPeriod.split("-").map(Number);
        saved = await invoicesApi.create({ contractId: form.contractId, billingMonth: month, billingYear: year, ...readings });
      }
      setMessage(`${editing ? "Đã cập nhật" : "Đã tạo"} hóa đơn ${saved.id.slice(0, 8)}.`);
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

  const registerPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!paymentInvoice || submitting) return;
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Số tiền thanh toán phải lớn hơn 0.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await invoicesApi.registerPayment(paymentInvoice.id, { amount, note: paymentNote.trim() || null });
      setMessage(`Đã ghi nhận thanh toán cho hóa đơn ${paymentInvoice.id.slice(0, 8)}.`);
      setPaymentInvoice(null);
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
        title="Quản lý hóa đơn"
        description="Theo dõi tiền thuê, điện, nước, tổng tiền và công nợ theo dữ liệu Backend."
        actions={<>{canWrite ? <Button leadingIcon={Plus} onClick={openCreate}>Tạo hóa đơn</Button> : null}<Link className="button button--secondary button--md" to="/payments">Lịch sử thanh toán</Link></>}
      />
      {message ? <Alert title="Cập nhật thành công" tone="success">{message}</Alert> : null}
      {formError && !modalOpen && !paymentInvoice ? <Alert title="Không thể cập nhật hóa đơn" tone="danger">{formError}</Alert> : null}
      <Tabs label="Lọc theo trạng thái hóa đơn" activeId={status} onChange={(id) => { setStatus(id as InvoiceTab); setPage(1); }} items={[{ id: "all", label: "Tất cả" }, ...Object.entries(invoiceStatusMap).map(([id, definition]) => ({ id, label: definition.label }))]} />
      <DataTable
        rows={data?.items ?? []}
        columns={columns}
        getRowId={(invoice) => invoice.id}
        getSearchText={(invoice) => `${invoice.id} ${invoice.contractId} ${invoice.billingMonth}/${invoice.billingYear}`}
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
        emptyTitle="Chưa có hóa đơn"
        emptyDescription="Không có hóa đơn phù hợp với trạng thái đang chọn."
      />

      <Modal open={modalOpen} onClose={() => { if (!submitting) setModalOpen(false); }} title={editing ? "Chỉnh sửa hóa đơn nháp" : "Tạo hóa đơn nháp"} description="Điền chỉ số đầu/cuối và đơn giá; Backend sẽ tính các thành tiền." footer={<><Button variant="secondary" disabled={submitting} onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit" form="invoice-form" loading={submitting}>Lưu hóa đơn</Button></>}>
        <form id="invoice-form" className="management-form" onSubmit={handleSubmit} noValidate>
          {formError ? <Alert title="Không thể lưu hóa đơn" tone="danger">{formError}</Alert> : null}
          {!editing ? <><Select label="Hợp đồng" placeholder={contractsQuery.loading ? "Đang tải hợp đồng..." : "Chọn hợp đồng"} value={form.contractId} options={(contractsQuery.data?.items ?? []).filter((contract: RentalContractResponse) => contract.status === "active").map((contract) => ({ value: contract.id, label: `${contract.roomNumber ?? contract.roomId.slice(0, 8)} · ${contract.tenantName ?? contract.tenantId.slice(0, 8)}` }))} error={contractsQuery.error || fieldErrors.contractId?.[0]} required onChange={(event) => setForm((current) => ({ ...current, contractId: event.target.value }))} /><Input label="Kỳ hóa đơn" type="month" value={form.billingPeriod} error={fieldErrors.billingMonth?.[0] ?? fieldErrors.billingYear?.[0]} required onChange={(event) => setForm((current) => ({ ...current, billingPeriod: event.target.value }))} /></> : <Input label="Tiền thuê" type="number" min="0" suffix="VND" value={form.rentAmount} error={fieldErrors.rentAmount?.[0]} required onChange={(event) => setForm((current) => ({ ...current, rentAmount: event.target.value }))} />}
          <div className="form-grid form-grid--two"><Input label="Chỉ số điện đầu" type="number" min="0" step="0.01" value={form.electricityStartReading} error={fieldErrors.electricityStartReading?.[0]} required onChange={(event) => setForm((current) => ({ ...current, electricityStartReading: event.target.value }))} /><Input label="Chỉ số điện cuối" type="number" min="0" step="0.01" value={form.electricityEndReading} error={fieldErrors.electricityEndReading?.[0]} required onChange={(event) => setForm((current) => ({ ...current, electricityEndReading: event.target.value }))} /></div>
          <div className="form-grid form-grid--two"><Input label="Chỉ số nước đầu" type="number" min="0" step="0.01" value={form.waterStartReading} error={fieldErrors.waterStartReading?.[0]} required onChange={(event) => setForm((current) => ({ ...current, waterStartReading: event.target.value }))} /><Input label="Chỉ số nước cuối" type="number" min="0" step="0.01" value={form.waterEndReading} error={fieldErrors.waterEndReading?.[0]} required onChange={(event) => setForm((current) => ({ ...current, waterEndReading: event.target.value }))} /></div>
          <div className="form-grid form-grid--two"><Input label="Đơn giá điện" type="number" min="0" suffix="VND" value={form.electricityUnitPrice} error={fieldErrors.electricityUnitPrice?.[0]} required onChange={(event) => setForm((current) => ({ ...current, electricityUnitPrice: event.target.value }))} /><Input label="Đơn giá nước" type="number" min="0" suffix="VND" value={form.waterUnitPrice} error={fieldErrors.waterUnitPrice?.[0]} required onChange={(event) => setForm((current) => ({ ...current, waterUnitPrice: event.target.value }))} /></div>
        </form>
      </Modal>

      <Modal open={Boolean(paymentInvoice)} onClose={() => { if (!submitting) setPaymentInvoice(null); }} title="Ghi nhận thanh toán" description={paymentInvoice ? `Công nợ hiện tại: ${formatCurrency(paymentInvoice.outstandingAmount)}` : undefined} footer={<><Button variant="secondary" disabled={submitting} onClick={() => setPaymentInvoice(null)}>Hủy</Button><Button type="submit" form="payment-form" loading={submitting}>Ghi nhận</Button></>}>
        <form id="payment-form" className="management-form" onSubmit={registerPayment} noValidate>
          {formError ? <Alert title="Không thể ghi nhận thanh toán" tone="danger">{formError}</Alert> : null}
          <Input label="Số tiền" type="number" min="1" suffix="VND" value={paymentAmount} error={fieldErrors.amount?.[0]} required onChange={(event) => setPaymentAmount(event.target.value)} />
          <Textarea label="Ghi chú" value={paymentNote} error={fieldErrors.note?.[0]} onChange={(event) => setPaymentNote(event.target.value)} />
        </form>
      </Modal>
    </div>
  );
}
