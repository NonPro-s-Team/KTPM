import {
  CircleCheck,
  CircleDollarSign,
  Clock3,
  Download,
  MoreHorizontal,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ManagementSummary } from "../../components/management/ManagementSummary";
import {
  Alert,
  Badge,
  Button,
  DataTable,
  DropdownMenu,
  PageHeader,
  type DataTableColumn,
} from "../../components/ui";
import { payments } from "../../data/mockData";
import type { Payment } from "../../types/models";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { paymentStatusMap } from "../../utils/status";
import "../../styles/management.css";

const paymentMethodLabels: Record<Payment["method"], string> = {
  bank_transfer: "Chuyển khoản",
  cash: "Tiền mặt",
  wallet: "Ví điện tử",
};

export function PaymentsPage() {
  const [message, setMessage] = useState("");
  const columns = useMemo<DataTableColumn<Payment>[]>(
    () => [
      {
        id: "payment",
        header: "Thanh toán",
        sortValue: (payment) => payment.code,
        cell: (payment) => (
          <span className="primary-cell">
            <strong>{payment.code}</strong>
            <small>{payment.invoiceCode}</small>
          </span>
        ),
      },
      {
        id: "room",
        header: "Phòng",
        sortValue: (payment) => payment.roomCode,
        cell: (payment) => payment.roomCode,
      },
      {
        id: "method",
        header: "Phương thức",
        sortValue: (payment) => payment.method,
        cell: (payment) => paymentMethodLabels[payment.method],
      },
      {
        id: "paidAt",
        header: "Ngày ghi nhận",
        sortValue: (payment) => payment.paidAt,
        cell: (payment) => formatDate(payment.paidAt),
      },
      {
        id: "amount",
        header: "Số tiền",
        align: "end",
        sortValue: (payment) => payment.amount,
        cell: (payment) => (
          <strong className="tabular">{formatCurrency(payment.amount)}</strong>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        sortValue: (payment) => payment.status,
        cell: (payment) => {
          const status = paymentStatusMap[payment.status];
          return <Badge tone={status.tone}>{status.label}</Badge>;
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        align: "end",
        width: "5rem",
        cell: (payment) => (
          <div className="row-actions">
            <DropdownMenu
              label={`Thao tác cho ${payment.code}`}
              trigger={<MoreHorizontal size={18} aria-hidden="true" />}
              items={[
                {
                  label: "Xem biên nhận",
                  icon: ReceiptText,
                  onSelect: () =>
                    setMessage(`Đang xem biên nhận ${payment.code}.`),
                },
                {
                  label: "Tải biên nhận",
                  icon: Download,
                  onSelect: () =>
                    setMessage(`Đã mô phỏng tải biên nhận ${payment.code}.`),
                },
              ]}
            />
          </div>
        ),
      },
    ],
    [],
  );

  const completedTotal = payments
    .filter((payment) => payment.status === "completed")
    .reduce((total, payment) => total + payment.amount, 0);

  return (
    <div className="management-page">
      <PageHeader
        title="Quản lý thanh toán"
        description="Đối soát các khoản thu, phương thức thanh toán và biên nhận."
        actions={
          <Button
            variant="secondary"
            leadingIcon={Download}
            onClick={() => setMessage("Đã chuẩn bị báo cáo đối soát mô phỏng.")}
          >
            Xuất đối soát
          </Button>
        }
      />
      {message ? (
        <Alert title="Thông tin thao tác" tone="info">
          {message}
        </Alert>
      ) : null}
      <ManagementSummary
        items={[
          {
            label: "Tổng giao dịch",
            value: String(payments.length),
            meta: "Trong kỳ hiện tại",
            icon: WalletCards,
          },
          {
            label: "Đã hoàn tất",
            value: String(
              payments.filter((item) => item.status === "completed").length,
            ),
            meta: "Đã đối soát",
            icon: CircleCheck,
          },
          {
            label: "Đang xử lý",
            value: String(
              payments.filter((item) => item.status === "processing").length,
            ),
            meta: "Chờ xác nhận",
            icon: Clock3,
          },
          {
            label: "Đã ghi nhận",
            value: formatCurrency(completedTotal),
            meta: "Tổng tiền hoàn tất",
            icon: CircleDollarSign,
          },
        ]}
      />
      <DataTable
        rows={payments}
        columns={columns}
        getRowId={(payment) => payment.id}
        getSearchText={(payment) =>
          `${payment.code} ${payment.invoiceCode} ${payment.roomCode}`
        }
        searchPlaceholder="Tìm giao dịch, hóa đơn hoặc phòng..."
        filters={[
          {
            id: "method",
            label: "Phương thức",
            options: Object.entries(paymentMethodLabels).map(
              ([value, label]) => ({ value, label }),
            ),
            predicate: (payment, value) => payment.method === value,
          },
        ]}
        emptyTitle="Không tìm thấy thanh toán"
        emptyDescription="Thử đổi từ khóa hoặc phương thức thanh toán."
      />
    </div>
  );
}
