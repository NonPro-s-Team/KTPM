import {
  CircleDollarSign,
  Clock3,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Send,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { ManagementSummary } from "../../components/management/ManagementSummary";
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
  type DataTableColumn,
} from "../../components/ui";
import { invoices as initialInvoices, rooms } from "../../data/mockData";
import type { Invoice } from "../../types/models";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { invoiceStatusMap } from "../../utils/status";
import "../../styles/management.css";

interface InvoiceFormState {
  roomId: string;
  billingPeriod: string;
  total: string;
  dueDate: string;
}

const initialForm: InvoiceFormState = {
  roomId: "",
  billingPeriod: "2026-08",
  total: "",
  dueDate: "2026-08-05",
};

export function InvoicesPage() {
  const [invoiceRows, setInvoiceRows] = useState(initialInvoices);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const columns = useMemo<DataTableColumn<Invoice>[]>(
    () => [
      {
        id: "invoice",
        header: "Hóa đơn",
        sortValue: (invoice) => invoice.code,
        cell: (invoice) => (
          <span className="primary-cell">
            <strong>{invoice.code}</strong>
            <small>Kỳ {invoice.billingPeriod}</small>
          </span>
        ),
      },
      {
        id: "tenant",
        header: "Khách thuê",
        sortValue: (invoice) => invoice.tenantLabel,
        cell: (invoice) => (
          <span className="primary-cell">
            <strong>{invoice.tenantLabel}</strong>
            <small>Phòng {invoice.roomCode}</small>
          </span>
        ),
      },
      {
        id: "dueDate",
        header: "Hạn thanh toán",
        sortValue: (invoice) => invoice.dueDate,
        cell: (invoice) => formatDate(invoice.dueDate),
      },
      {
        id: "total",
        header: "Tổng tiền",
        align: "end",
        sortValue: (invoice) => invoice.total,
        cell: (invoice) => (
          <strong className="tabular">{formatCurrency(invoice.total)}</strong>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        sortValue: (invoice) => invoice.status,
        cell: (invoice) => {
          const status = invoiceStatusMap[invoice.status];
          return <Badge tone={status.tone}>{status.label}</Badge>;
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        align: "end",
        width: "5rem",
        cell: (invoice) => (
          <div className="row-actions">
            <DropdownMenu
              label={`Thao tác cho ${invoice.code}`}
              trigger={<MoreHorizontal size={18} aria-hidden="true" />}
              items={[
                {
                  label: "Gửi nhắc thanh toán",
                  icon: Send,
                  onSelect: () =>
                    setMessage(`Đã mô phỏng gửi nhắc cho ${invoice.code}.`),
                },
                {
                  label: "Xem hóa đơn",
                  icon: ReceiptText,
                  onSelect: () =>
                    setMessage(`Đang xem hóa đơn ${invoice.code}.`),
                },
              ]}
            />
          </div>
        ),
      },
    ],
    [],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const room = rooms.find((item) => item.id === form.roomId);
    const total = Number(form.total);
    if (!room || !form.billingPeriod || !form.dueDate || total <= 0) {
      setError(
        "Hãy chọn phòng, kỳ hóa đơn, hạn thanh toán và tổng tiền hợp lệ.",
      );
      return;
    }

    const [year, month] = form.billingPeriod.split("-");
    const invoice: Invoice = {
      id: `invoice-local-${Date.now()}`,
      code: `INV-${year?.slice(-2)}${month}-${String(
        invoiceRows.length + 1,
      ).padStart(3, "0")}`,
      roomCode: room.code,
      tenantLabel: room.tenantLabel ?? "Khách thuê mô phỏng",
      billingPeriod: `${month}/${year}`,
      total,
      dueDate: form.dueDate,
      status: "pending",
    };
    setInvoiceRows((current) => [invoice, ...current]);
    setMessage(`Đã tạo hóa đơn ${invoice.code} trong dữ liệu mô phỏng.`);
    setForm(initialForm);
    setError("");
    setModalOpen(false);
  };

  const totalDue = invoiceRows
    .filter((invoice) => invoice.status !== "paid")
    .reduce((total, invoice) => total + invoice.total, 0);

  return (
    <div className="management-page">
      <PageHeader
        title="Quản lý hóa đơn"
        description="Lập hóa đơn theo kỳ, theo dõi hạn thanh toán và công nợ."
        actions={
          <Button
            leadingIcon={Plus}
            onClick={() => {
              setError("");
              setModalOpen(true);
            }}
          >
            Tạo hóa đơn
          </Button>
        }
      />
      {message ? (
        <Alert title="Đã cập nhật dữ liệu bản mẫu" tone="success">
          {message}
        </Alert>
      ) : null}
      <ManagementSummary
        items={[
          {
            label: "Tổng hóa đơn",
            value: String(invoiceRows.length),
            meta: "Trong hai kỳ gần nhất",
            icon: ReceiptText,
          },
          {
            label: "Đã thanh toán",
            value: String(
              invoiceRows.filter((item) => item.status === "paid").length,
            ),
            meta: "Đã đối soát",
            icon: CircleDollarSign,
          },
          {
            label: "Chờ thanh toán",
            value: String(
              invoiceRows.filter((item) => item.status === "pending").length,
            ),
            meta: "Trong thời hạn",
            icon: Clock3,
          },
          {
            label: "Công nợ cần thu",
            value: formatCurrency(totalDue),
            meta: "Bao gồm quá hạn",
            icon: TriangleAlert,
          },
        ]}
      />
      <DataTable
        rows={invoiceRows}
        columns={columns}
        getRowId={(invoice) => invoice.id}
        getSearchText={(invoice) =>
          `${invoice.code} ${invoice.roomCode} ${invoice.tenantLabel} ${invoice.billingPeriod}`
        }
        searchPlaceholder="Tìm hóa đơn, phòng hoặc khách thuê..."
        filters={[
          {
            id: "status",
            label: "Trạng thái",
            options: [
              { value: "paid", label: "Đã thanh toán" },
              { value: "pending", label: "Chờ thanh toán" },
              { value: "overdue", label: "Quá hạn" },
            ],
            predicate: (invoice, value) => invoice.status === value,
          },
        ]}
        selectable
        emptyTitle="Không tìm thấy hóa đơn"
        emptyDescription="Thử đổi từ khóa, bộ lọc hoặc tạo hóa đơn mới."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tạo hóa đơn"
        description="Lập hóa đơn mới cho một phòng đang thuê."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" form="create-invoice-form">
              Tạo hóa đơn
            </Button>
          </>
        }
      >
        <form
          id="create-invoice-form"
          className="management-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {error ? (
            <Alert title="Chưa thể tạo hóa đơn" tone="danger">
              {error}
            </Alert>
          ) : null}
          <Select
            label="Phòng đang thuê"
            placeholder="Chọn phòng"
            value={form.roomId}
            options={rooms
              .filter((room) => room.status === "occupied")
              .map((room) => ({
                value: room.id,
                label: `${room.code} · ${room.tenantLabel}`,
              }))}
            required
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                roomId: event.target.value,
              }))
            }
          />
          <div className="form-grid form-grid--two">
            <Input
              label="Kỳ hóa đơn"
              type="month"
              value={form.billingPeriod}
              required
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  billingPeriod: event.target.value,
                }))
              }
            />
            <Input
              label="Hạn thanh toán"
              type="date"
              value={form.dueDate}
              required
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  dueDate: event.target.value,
                }))
              }
            />
          </div>
          <Input
            label="Tổng tiền"
            type="number"
            inputMode="numeric"
            min="1"
            step="1000"
            suffix="VND"
            value={form.total}
            helperText="Bao gồm tiền thuê và các dịch vụ đã chốt trong kỳ."
            required
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                total: event.target.value,
              }))
            }
          />
        </form>
      </Modal>
    </div>
  );
}
