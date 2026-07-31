import {
  BedDouble,
  ClipboardList,
  MoreHorizontal,
  Pencil,
  Plus,
  Wrench,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import {
  Alert,
  Badge,
  Button,
  DataTable,
  Drawer,
  DropdownMenu,
  Input,
  PageHeader,
  Select,
  Tabs,
  type DataTableColumn,
} from "../../components/ui";
import { properties, rooms as initialRooms } from "../../data/mockData";
import type { Room, RoomStatus } from "../../types/models";
import { formatCurrency } from "../../utils/formatters";
import { roomStatusMap } from "../../utils/status";
import "../../styles/management.css";

type RoomTab = "all" | RoomStatus;

interface RoomFormState {
  code: string;
  propertyId: string;
  floor: string;
  area: string;
  monthlyRent: string;
  status: RoomStatus;
}

const initialFormState: RoomFormState = {
  code: "",
  propertyId: "",
  floor: "1",
  area: "",
  monthlyRent: "",
  status: "vacant",
};

export function RoomsPage() {
  const [rooms, setRooms] = useState(initialRooms);
  const [activeTab, setActiveTab] = useState<RoomTab>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<RoomFormState>(initialFormState);
  const [formError, setFormError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const visibleRooms =
    activeTab === "all"
      ? rooms
      : rooms.filter((room) => room.status === activeTab);

  const columns = useMemo<DataTableColumn<Room>[]>(
    () => [
      {
        id: "code",
        header: "Phòng",
        sortValue: (room) => room.code,
        cell: (room) => (
          <span className="primary-cell">
            <strong>{room.code}</strong>
            <small>{room.area} m²</small>
          </span>
        ),
      },
      {
        id: "property",
        header: "Khu trọ",
        sortValue: (room) => room.propertyName,
        cell: (room) => room.propertyName,
      },
      {
        id: "floor",
        header: "Tầng",
        sortValue: (room) => room.floor,
        cell: (room) => `Tầng ${room.floor}`,
      },
      {
        id: "tenant",
        header: "Khách thuê",
        cell: (room) => room.tenantLabel ?? "Chưa có khách",
      },
      {
        id: "rent",
        header: "Giá thuê",
        align: "end",
        sortValue: (room) => room.monthlyRent,
        cell: (room) => (
          <span className="tabular">{formatCurrency(room.monthlyRent)}</span>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        sortValue: (room) => room.status,
        cell: (room) => {
          const status = roomStatusMap[room.status];
          return <Badge tone={status.tone}>{status.label}</Badge>;
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        align: "end",
        width: "5rem",
        cell: (room) => (
          <div className="row-actions">
            <DropdownMenu
              label={`Thao tác cho phòng ${room.code}`}
              trigger={<MoreHorizontal size={18} aria-hidden="true" />}
              items={[
                {
                  label: "Xem chi tiết",
                  icon: ClipboardList,
                  onSelect: () =>
                    setSavedMessage(`Đang xem thông tin phòng ${room.code}.`),
                },
                {
                  label: "Chỉnh sửa",
                  icon: Pencil,
                  onSelect: () =>
                    setSavedMessage(`Đã mở chỉnh sửa phòng ${room.code}.`),
                },
                {
                  label: "Tạo yêu cầu sửa chữa",
                  icon: Wrench,
                  separatorBefore: true,
                  onSelect: () =>
                    setSavedMessage(
                      `Đã chuẩn bị yêu cầu sửa chữa cho phòng ${room.code}.`,
                    ),
                },
              ]}
            />
          </div>
        ),
      },
    ],
    [],
  );

  const roomCounts = {
    all: rooms.length,
    vacant: rooms.filter((room) => room.status === "vacant").length,
    occupied: rooms.filter((room) => room.status === "occupied").length,
    maintenance: rooms.filter((room) => room.status === "maintenance").length,
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const property = properties.find((item) => item.id === form.propertyId);
    const monthlyRent = Number(form.monthlyRent);
    const floor = Number(form.floor);
    const area = Number(form.area);

    if (
      !form.code.trim() ||
      !property ||
      monthlyRent <= 0 ||
      floor <= 0 ||
      area <= 0
    ) {
      setFormError(
        "Hãy nhập đủ mã phòng, khu trọ, tầng, diện tích và giá thuê hợp lệ.",
      );
      return;
    }

    const newRoom: Room = {
      id: `room-local-${Date.now()}`,
      code: form.code.trim().toLocaleUpperCase("vi"),
      propertyId: property.id,
      propertyName: property.name,
      floor,
      area,
      monthlyRent,
      status: form.status,
    };

    setRooms((current) => [newRoom, ...current]);
    setSavedMessage(`Đã thêm phòng ${newRoom.code} vào dữ liệu mô phỏng.`);
    setForm(initialFormState);
    setFormError("");
    setDrawerOpen(false);
    setActiveTab("all");
  };

  return (
    <div className="management-page rooms-page">
      <PageHeader
        title="Quản lý phòng"
        description="Theo dõi tình trạng, khách thuê và giá của từng phòng trên toàn hệ thống."
        actions={
          <Button
            leadingIcon={Plus}
            onClick={() => {
              setFormError("");
              setDrawerOpen(true);
            }}
          >
            Thêm phòng
          </Button>
        }
      />

      {savedMessage ? (
        <Alert title="Đã cập nhật dữ liệu bản mẫu" tone="success">
          {savedMessage}
        </Alert>
      ) : null}

      <Tabs
        label="Lọc theo trạng thái phòng"
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as RoomTab)}
        items={[
          {
            id: "all",
            label: "Tất cả",
            icon: BedDouble,
            count: roomCounts.all,
          },
          {
            id: "occupied",
            label: "Đang thuê",
            count: roomCounts.occupied,
          },
          { id: "vacant", label: "Phòng trống", count: roomCounts.vacant },
          {
            id: "maintenance",
            label: "Bảo trì",
            count: roomCounts.maintenance,
          },
        ]}
      />

      <DataTable
        rows={visibleRooms}
        columns={columns}
        getRowId={(room) => room.id}
        getSearchText={(room) =>
          `${room.code} ${room.propertyName} ${room.tenantLabel ?? ""}`
        }
        searchPlaceholder="Tìm mã phòng, khu trọ, khách thuê..."
        selectable
        filters={[
          {
            id: "property",
            label: "Khu trọ",
            options: properties.map((property) => ({
              label: property.name,
              value: property.id,
            })),
            predicate: (room, value) => room.propertyId === value,
          },
        ]}
        emptyTitle="Không tìm thấy phòng"
        emptyDescription="Thử đổi từ khóa, bộ lọc hoặc thêm một phòng mới."
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Thêm phòng mới"
        description="Tạo phòng trong dữ liệu bản mẫu. Thông tin có thể chỉnh sửa sau."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" form="add-room-form">
              Lưu phòng
            </Button>
          </>
        }
      >
        <form
          id="add-room-form"
          className="management-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {formError ? (
            <Alert title="Chưa thể lưu phòng" tone="danger">
              {formError}
            </Alert>
          ) : null}
          <Input
            label="Mã phòng"
            placeholder="Ví dụ: A-305"
            value={form.code}
            required
            onChange={(event) =>
              setForm((current) => ({ ...current, code: event.target.value }))
            }
          />
          <Select
            label="Khu trọ"
            placeholder="Chọn khu trọ"
            value={form.propertyId}
            options={properties.map((property) => ({
              value: property.id,
              label: property.name,
            }))}
            required
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                propertyId: event.target.value,
              }))
            }
          />
          <div className="form-grid form-grid--two">
            <Input
              label="Tầng"
              type="number"
              inputMode="numeric"
              min="1"
              value={form.floor}
              required
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  floor: event.target.value,
                }))
              }
            />
            <Input
              label="Diện tích"
              type="number"
              inputMode="decimal"
              min="1"
              suffix="m²"
              value={form.area}
              required
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  area: event.target.value,
                }))
              }
            />
          </div>
          <Input
            label="Giá thuê mỗi tháng"
            type="number"
            inputMode="numeric"
            min="0"
            step="100000"
            suffix="VND"
            value={form.monthlyRent}
            helperText="Nhập số tiền chưa bao gồm điện, nước và dịch vụ."
            required
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                monthlyRent: event.target.value,
              }))
            }
          />
          <Select
            label="Trạng thái ban đầu"
            value={form.status}
            options={[
              { value: "vacant", label: "Phòng trống" },
              { value: "maintenance", label: "Đang bảo trì" },
              { value: "occupied", label: "Đang thuê" },
            ]}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as RoomStatus,
              }))
            }
          />
        </form>
      </Drawer>
    </div>
  );
}
