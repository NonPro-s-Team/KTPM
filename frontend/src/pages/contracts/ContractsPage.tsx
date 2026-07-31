import {
  CalendarClock,
  FileCheck2,
  FileSignature,
  MoreHorizontal,
  Pencil,
  Plus,
  ScrollText,
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
import { contracts as initialContracts, tenants } from "../../data/mockData";
import type { Contract } from "../../types/models";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { contractStatusMap } from "../../utils/status";
import "../../styles/management.css";

interface ContractFormState {
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: string;
  deposit: string;
}

const initialForm: ContractFormState = {
  tenantId: "",
  startDate: "2026-08-01",
  endDate: "2027-07-31",
  monthlyRent: "",
  deposit: "",
};

export function ContractsPage() {
  const [contractRows, setContractRows] = useState(initialContracts);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const columns = useMemo<DataTableColumn<Contract>[]>(
    () => [
      {
        id: "code",
        header: "Hợp đồng",
        sortValue: (contract) => contract.code,
        cell: (contract) => (
          <span className="primary-cell">
            <strong>{contract.code}</strong>
            <small>{contract.tenantLabel}</small>
          </span>
        ),
      },
      {
        id: "room",
        header: "Phòng",
        sortValue: (contract) => contract.roomCode,
        cell: (contract) => contract.roomCode,
      },
      {
        id: "period",
        header: "Thời hạn",
        sortValue: (contract) => contract.endDate,
        cell: (contract) => (
          <span className="primary-cell">
            <strong>
              {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
            </strong>
            <small>12 tháng</small>
          </span>
        ),
      },
      {
        id: "rent",
        header: "Giá thuê",
        align: "end",
        sortValue: (contract) => contract.monthlyRent,
        cell: (contract) => (
          <span className="tabular">
            {formatCurrency(contract.monthlyRent)}
          </span>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        sortValue: (contract) => contract.status,
        cell: (contract) => {
          const status = contractStatusMap[contract.status];
          return <Badge tone={status.tone}>{status.label}</Badge>;
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        align: "end",
        width: "5rem",
        cell: (contract) => (
          <div className="row-actions">
            <DropdownMenu
              label={`Thao tác cho ${contract.code}`}
              trigger={<MoreHorizontal size={18} aria-hidden="true" />}
              items={[
                {
                  label: "Xem hợp đồng",
                  icon: ScrollText,
                  onSelect: () =>
                    setMessage(`Đang xem hợp đồng ${contract.code}.`),
                },
                {
                  label: "Chỉnh sửa",
                  icon: Pencil,
                  onSelect: () =>
                    setMessage(`Đã chọn chỉnh sửa ${contract.code}.`),
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
    const tenant = tenants.find((item) => item.id === form.tenantId);
    const monthlyRent = Number(form.monthlyRent);
    const deposit = Number(form.deposit);

    if (
      !tenant ||
      !form.startDate ||
      !form.endDate ||
      form.endDate <= form.startDate ||
      monthlyRent <= 0 ||
      deposit < 0
    ) {
      setError(
        "Hãy chọn khách thuê, thời hạn hợp lệ và nhập đủ giá thuê, tiền cọc.",
      );
      return;
    }

    const nextContract: Contract = {
      id: `contract-local-${Date.now()}`,
      code: `HD-${String(contractRows.length + 1).padStart(6, "0")}`,
      tenantLabel: tenant.displayName,
      roomCode: tenant.roomCode,
      startDate: form.startDate,
      endDate: form.endDate,
      monthlyRent,
      deposit,
      status: "active",
    };
    setContractRows((current) => [nextContract, ...current]);
    setMessage(`Đã tạo hợp đồng ${nextContract.code} trong dữ liệu mô phỏng.`);
    setForm(initialForm);
    setError("");
    setModalOpen(false);
  };

  return (
    <div className="management-page">
      <PageHeader
        title="Quản lý hợp đồng"
        description="Theo dõi thời hạn, giá thuê và trạng thái hiệu lực của hợp đồng."
        actions={
          <Button
            leadingIcon={Plus}
            onClick={() => {
              setError("");
              setModalOpen(true);
            }}
          >
            Tạo hợp đồng
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
            label: "Tổng hợp đồng",
            value: String(contractRows.length),
            meta: "Trong dữ liệu hiện tại",
            icon: FileSignature,
          },
          {
            label: "Đang hiệu lực",
            value: String(
              contractRows.filter((item) => item.status === "active").length,
            ),
            meta: "Đang phát sinh tiền thuê",
            icon: FileCheck2,
          },
          {
            label: "Sắp hết hạn",
            value: String(
              contractRows.filter((item) => item.status === "expiring").length,
            ),
            meta: "Trong 30 ngày tới",
            icon: CalendarClock,
          },
          {
            label: "Đã kết thúc",
            value: String(
              contractRows.filter((item) => item.status === "ended").length,
            ),
            meta: "Đang lưu trữ",
            icon: ScrollText,
          },
        ]}
      />
      <DataTable
        rows={contractRows}
        columns={columns}
        getRowId={(contract) => contract.id}
        getSearchText={(contract) =>
          `${contract.code} ${contract.tenantLabel} ${contract.roomCode}`
        }
        searchPlaceholder="Tìm hợp đồng, khách thuê hoặc phòng..."
        filters={[
          {
            id: "status",
            label: "Trạng thái",
            options: [
              { value: "active", label: "Hiệu lực" },
              { value: "expiring", label: "Sắp hết hạn" },
              { value: "ended", label: "Đã kết thúc" },
            ],
            predicate: (contract, value) => contract.status === value,
          },
        ]}
        selectable
        emptyTitle="Không tìm thấy hợp đồng"
        emptyDescription="Thử đổi từ khóa, bộ lọc hoặc tạo hợp đồng mới."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tạo hợp đồng"
        description="Thông tin chỉ được lưu trong phiên dữ liệu mô phỏng."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" form="create-contract-form">
              Tạo hợp đồng
            </Button>
          </>
        }
      >
        <form
          id="create-contract-form"
          className="management-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {error ? (
            <Alert title="Chưa thể tạo hợp đồng" tone="danger">
              {error}
            </Alert>
          ) : null}
          <Select
            label="Khách thuê và phòng"
            placeholder="Chọn hồ sơ khách thuê"
            value={form.tenantId}
            options={tenants
              .filter((tenant) => tenant.contractStatus !== "ended")
              .map((tenant) => ({
                value: tenant.id,
                label: `${tenant.displayName} · ${tenant.roomCode}`,
              }))}
            required
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                tenantId: event.target.value,
              }))
            }
          />
          <div className="form-grid form-grid--two">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={form.startDate}
              required
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={form.endDate}
              required
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
            />
          </div>
          <Input
            label="Giá thuê mỗi tháng"
            type="number"
            inputMode="numeric"
            min="1"
            suffix="VND"
            value={form.monthlyRent}
            required
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                monthlyRent: event.target.value,
              }))
            }
          />
          <Input
            label="Tiền đặt cọc"
            type="number"
            inputMode="numeric"
            min="0"
            suffix="VND"
            value={form.deposit}
            helperText="Có thể nhập 0 nếu chưa thu cọc tại thời điểm tạo."
            required
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                deposit: event.target.value,
              }))
            }
          />
        </form>
      </Modal>
    </div>
  );
}
