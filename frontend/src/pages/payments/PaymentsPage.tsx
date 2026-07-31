import { CircleDollarSign, Plus } from "lucide-react";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { normalizeApiError } from "../../api/httpClient";
import { invoicesApi } from "../../api/invoicesApi";
import { Alert, Button, DataTable, Input, Modal, PageHeader, Select, Textarea, type DataTableColumn } from "../../components/ui";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAuthStore } from "../../store/authStore";
import type { PaymentResponse } from "../../types/api";
import { formatCurrency, formatDate } from "../../utils/formatters";
import "../../styles/management.css";

export function PaymentsPage() {
  const role = useAuthStore((state) => state.role);
  const canWrite = role === "admin" || role === "staff";
  const [invoiceId, setInvoiceId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadInvoices = useCallback(
    (signal: AbortSignal) => invoicesApi.list({ pageNumber: 1, pageSize: 100 }, signal),
    [],
  );
  const invoices = useApiQuery(loadInvoices);
  const selectedInvoice = invoices.data?.items.find((invoice) => invoice.id === invoiceId);

  const loadPayments = useCallback(
    (signal: AbortSignal) => invoiceId ? invoicesApi.payments(invoiceId, signal) : Promise.resolve([]),
    [invoiceId],
  );
  const payments = useApiQuery(loadPayments);

  const columns = useMemo<DataTableColumn<PaymentResponse>[]>(
    () => [
      { id: "payment", header: "Thanh toán", sortValue: (payment) => payment.paidAt, cell: (payment) => <span className="primary-cell"><strong>{payment.id.slice(0, 8)}</strong><small>{formatDate(payment.paidAt)}</small></span> },
      { id: "amount", header: "Số tiền", align: "end", sortValue: (payment) => payment.amount, cell: (payment) => <strong className="tabular">{formatCurrency(payment.amount)}</strong> },
      { id: "note", header: "Ghi chú", cell: (payment) => payment.note || "Không có ghi chú" },
      { id: "recordedBy", header: "Người ghi nhận", cell: (payment) => payment.recordedByUserId.slice(0, 8) },
    ],
    [],
  );

  const openPayment = () => {
    if (!selectedInvoice) return;
    setAmount(String(selectedInvoice.outstandingAmount));
    setNote("");
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!invoiceId || submitting) return;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError("Số tiền thanh toán phải lớn hơn 0.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await invoicesApi.registerPayment(invoiceId, { amount: numericAmount, note: note.trim() || null });
      setMessage("Đã ghi nhận thanh toán theo xác nhận từ máy chủ.");
      setModalOpen(false);
      payments.retry();
      invoices.retry();
    } catch (requestError) {
      setFormError(normalizeApiError(requestError).detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="management-page">
      <PageHeader
        title="Lịch sử thanh toán theo hóa đơn"
        description="Backend không có danh sách thanh toán toàn hệ thống; hãy chọn một hóa đơn để tải lịch sử của hóa đơn đó."
        actions={canWrite && selectedInvoice && ["issued", "partiallyPaid", "overdue"].includes(selectedInvoice.status) ? <Button leadingIcon={Plus} onClick={openPayment}>Ghi nhận thanh toán</Button> : undefined}
      />
      {message ? <Alert title="Cập nhật thành công" tone="success">{message}</Alert> : null}
      <Select
        label="Hóa đơn"
        placeholder={invoices.loading ? "Đang tải hóa đơn..." : "Chọn một hóa đơn"}
        value={invoiceId}
        options={(invoices.data?.items ?? []).map((invoice) => ({ value: invoice.id, label: `${invoice.id.slice(0, 8)} · ${String(invoice.billingMonth).padStart(2, "0")}/${invoice.billingYear} · ${formatCurrency(invoice.totalAmount)}` }))}
        error={invoices.error}
        onChange={(event) => setInvoiceId(event.target.value)}
      />
      <DataTable
        rows={payments.data ?? []}
        columns={columns}
        getRowId={(payment) => payment.id}
        getSearchText={(payment) => `${payment.id} ${payment.note ?? ""} ${payment.recordedByUserId}`}
        searchPlaceholder="Tìm trong lịch sử hóa đơn đã chọn..."
        loading={Boolean(invoiceId) && payments.loading}
        error={payments.error}
        onRetry={payments.retry}
        emptyTitle={invoiceId ? "Chưa có thanh toán" : "Chưa chọn hóa đơn"}
        emptyDescription={invoiceId ? "Hóa đơn này chưa có khoản thanh toán được ghi nhận." : "Chọn một hóa đơn ở phía trên để tải lịch sử thanh toán."}
      />

      <Modal open={modalOpen} onClose={() => { if (!submitting) setModalOpen(false); }} title="Ghi nhận thanh toán" description={selectedInvoice ? `Công nợ hiện tại: ${formatCurrency(selectedInvoice.outstandingAmount)}` : undefined} footer={<><Button variant="secondary" disabled={submitting} onClick={() => setModalOpen(false)}>Hủy</Button><Button type="submit" form="payment-page-form" leadingIcon={CircleDollarSign} loading={submitting}>Ghi nhận</Button></>}>
        <form id="payment-page-form" className="management-form" onSubmit={handleSubmit} noValidate>
          {formError ? <Alert title="Không thể ghi nhận thanh toán" tone="danger">{formError}</Alert> : null}
          <Input label="Số tiền" type="number" min="1" suffix="VND" value={amount} required onChange={(event) => setAmount(event.target.value)} />
          <Textarea label="Ghi chú" value={note} onChange={(event) => setNote(event.target.value)} />
        </form>
      </Modal>
    </div>
  );
}
