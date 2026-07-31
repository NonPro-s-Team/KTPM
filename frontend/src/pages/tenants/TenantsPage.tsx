import {
  CalendarDays,
  FileSignature,
  MoreHorizontal,
  Pencil,
  Plus,
  UserRoundPlus,
  UsersRound,
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
import {
  properties,
  rooms,
  tenants as initialTenants,
} from "../../data/mockData";
import type { ContractStatus, Tenant } from "../../types/models";
import { formatDate } from "../../utils/formatters";
import { contractStatusMap } from "../../utils/status";
import "../../styles/management.css";

interface TenantFormState {
  code: string;
  displayName: string;
  roomCode: string;
  propertyName: string;
  moveInDate: string;
}

const initialForm: TenantFormState = {
  code: "",
  displayName: "",
  roomCode: "",
  propertyName: "",
  moveInDate: "2026-07-31",
};

export function TenantsPage() {
  const [tenantRows, setTenantRows] = useState(initialTenants);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const columns = useMemo<DataTableColumn<Tenant>[]>(
    () => [
      {
        id: "tenant",
        header: "Khách thuê",
        sortValue: (tenant) => tenant.displayName,
        cell: (tenant) => (
          <span className="primary-cell">
            <strong>{tenant.displayName}</strong>
            <small>{tenant.code}</small>
          </span>
        ),
      },
      {
        id: "room",
        header: "Phòng",
        sortValue: (tenant) => tenant.roomCode,
        cell: (tenant) => (
          <span className="primary-cell">
            <strong>{tenant.roomCode}</strong>
            <small>{tenant.propertyName}</small>
          </span>
        ),
      },
      {
        id: "moveIn",
        header: "Ngày vào ở",
        sortValue: (tenant) => tenant.moveInDate,
        cell: (tenant) => formatDate(tenant.moveInDate),
      },
      {
        id: "contract",
        header: "Hợp đồng",
        sortValue: (tenant) => tenant.contractStatus,
        cell: (tenant) => {
          const status = contractStatusMap[tenant.contractStatus];
          return <Badge tone={status.tone}>{status.label}</Badge>;
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        align: "end",
        width: "5rem",
        cell: (tenant) => (
          <div className="row-actions">
            <DropdownMenu
              label={`Thao tác cho ${tenant.displayName}`}
              trigger={<MoreHorizontal size={18} aria-hidden="true" />}
              items={[
                {
                  label: "Xem hợp đồng",
                  icon: FileSignature,
                  onSelect: () =>
                    setMessage(`Đang xem hợp đồng của ${tenant.displayName}.`),
                },
                {
                  label: "Chỉnh sửa hồ sơ",
                  icon: Pencil,
                  onSelect: () =>
                    setMessage(`Đã chọn chỉnh sửa ${tenant.displayName}.`),
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
    if (
      !form.code.trim() ||
      !form.displayName.trim() ||
      !form.roomCode ||
      !form.propertyName ||
      !form.moveInDate
    ) {
      setError("Hãy nhập đủ mã hồ sơ, tên hiển thị, phòng và ngày vào ở.");
      return;
    }

    const tenant: Tenant = {
      id: `tenant-local-${Date.now()}`,
      code: form.code.trim().toLocaleUpperCase("vi"),
      displayName: form.displayName.trim(),
      roomCode: form.roomCode,
      propertyName: form.propertyName,
      moveInDate: form.moveInDate,
      contractStatus: "active",
    };
    setTenantRows((current) => [tenant, ...current]);
    setMessage(`Đã thêm hồ sơ ${tenant.displayName} vào dữ liệu mô phỏng.`);
    setForm(initialForm);
    setError("");
    setModalOpen(false);
  };

  const statusCounts = (status: ContractStatus) =>
    tenantRows.filter((tenant) => tenant.contractStatus === status).length;

  return (
    <div className="management-page">
      <PageHeader
        title="Quản lý khách thuê"
        description="Theo dõi hồ sơ lưu trú và trạng thái hợp đồng mà không hiển thị dữ liệu định danh nhạy cảm."
        actions={
          <Button
            leadingIcon={UserRoundPlus}
            onClick={() => setModalOpen(true)}
          >
            Thêm khách thuê
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
            label: "Tổng hồ sơ",
            value: String(tenantRows.length),
            meta: "Khách thuê hiện có",
            icon: UsersRound,
          },
          {
            label: "Hợp đồng hiệu lực",
            value: String(statusCounts("active")),
            meta: "Đang lưu trú",
            icon: FileSignature,
          },
          {
            label: "Sắp hết hạn",
            value: String(statusCounts("expiring")),
            meta: "Cần liên hệ sớm",
            icon: CalendarDays,
          },
          {
            label: "Đã kết thúc",
            value: String(statusCounts("ended")),
            meta: "Hồ sơ lưu trữ",
            icon: FileSignature,
          },
        ]}
      />
      <DataTable
        rows={tenantRows}
        columns={columns}
        getRowId={(tenant) => tenant.id}
        getSearchText={(tenant) =>
          `${tenant.displayName} ${tenant.code} ${tenant.roomCode} ${tenant.propertyName}`
        }
        searchPlaceholder="Tìm mã hồ sơ, phòng hoặc khu trọ..."
        filters={[
          {
            id: "contract",
            label: "Hợp đồng",
            options: [
              { value: "active", label: "Hiệu lực" },
              { value: "expiring", label: "Sắp hết hạn" },
              { value: "ended", label: "Đã kết thúc" },
            ],
            predicate: (tenant, value) => tenant.contractStatus === value,
          },
        ]}
        selectable
        emptyTitle="Không tìm thấy khách thuê"
        emptyDescription="Thử đổi từ khóa, trạng thái hoặc thêm một hồ sơ mới."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Thêm khách thuê"
        description="Chỉ dùng nhãn mô phỏng trong bản giao diện review."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" form="add-tenant-form" leadingIcon={Plus}>
              Lưu hồ sơ
            </Button>
          </>
        }
      >
        <form
          id="add-tenant-form"
          className="management-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {error ? (
            <Alert title="Chưa thể lưu hồ sơ" tone="danger">
              {error}
            </Alert>
          ) : null}
          <div className="form-grid form-grid--two">
            <Input
              label="Mã hồ sơ"
              placeholder="Ví dụ: KH-007"
              value={form.code}
              required
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  code: event.target.value,
                }))
              }
            />
            <Input
              label="Tên hiển thị"
              placeholder="Ví dụ: Khách thuê 07"
              value={form.displayName}
              helperText="Không dùng tên cá nhân thật trong dữ liệu review."
              required
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  displayName: event.target.value,
                }))
              }
            />
          </div>
          <Select
            label="Khu trọ"
            placeholder="Chọn khu trọ"
            value={form.propertyName}
            options={properties.map((property) => ({
              value: property.name,
              label: property.name,
            }))}
            required
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                propertyName: event.target.value,
                roomCode: "",
              }))
            }
          />
          <Select
            label="Phòng"
            placeholder="Chọn phòng"
            value={form.roomCode}
            options={rooms
              .filter(
                (room) =>
                  room.propertyName === form.propertyName &&
                  room.status === "vacant",
              )
              .map((room) => ({
                value: room.code,
                label: `${room.code} · ${room.area} m²`,
              }))}
            required
            disabled={!form.propertyName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                roomCode: event.target.value,
              }))
            }
          />
          <Input
            label="Ngày vào ở"
            type="date"
            value={form.moveInDate}
            required
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                moveInDate: event.target.value,
              }))
            }
          />
        </form>
      </Modal>
    </div>
  );
}
