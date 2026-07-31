import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  MoreHorizontal,
  Pencil,
  Plus,
  Siren,
  UserRoundCheck,
  Wrench,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { ManagementSummary } from "../../components/management/ManagementSummary";
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
  Textarea,
  type DataTableColumn,
} from "../../components/ui";
import {
  maintenanceRequests as initialRequests,
  properties,
  rooms,
} from "../../data/mockData";
import type {
  MaintenancePriority,
  MaintenanceRequest,
  MaintenanceStatus,
} from "../../types/models";
import { formatDate } from "../../utils/formatters";
import {
  maintenancePriorityMap,
  maintenanceStatusMap,
} from "../../utils/status";
import "../../styles/management.css";

type MaintenanceTab = "all" | MaintenanceStatus;

interface MaintenanceFormState {
  title: string;
  propertyName: string;
  roomCode: string;
  priority: MaintenancePriority;
  description: string;
}

const initialForm: MaintenanceFormState = {
  title: "",
  propertyName: "",
  roomCode: "",
  priority: "normal",
  description: "",
};

export function MaintenancePage() {
  const [requests, setRequests] = useState(initialRequests);
  const [activeTab, setActiveTab] = useState<MaintenanceTab>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const visibleRequests =
    activeTab === "all"
      ? requests
      : requests.filter((request) => request.status === activeTab);

  const columns = useMemo<DataTableColumn<MaintenanceRequest>[]>(
    () => [
      {
        id: "request",
        header: "Yêu cầu",
        sortValue: (request) => request.code,
        cell: (request) => (
          <span className="primary-cell">
            <strong>{request.title}</strong>
            <small>{request.code}</small>
          </span>
        ),
      },
      {
        id: "room",
        header: "Vị trí",
        sortValue: (request) => request.roomCode,
        cell: (request) => (
          <span className="primary-cell">
            <strong>Phòng {request.roomCode}</strong>
            <small>{request.propertyName}</small>
          </span>
        ),
      },
      {
        id: "createdAt",
        header: "Ngày tạo",
        sortValue: (request) => request.createdAt,
        cell: (request) => formatDate(request.createdAt),
      },
      {
        id: "assignee",
        header: "Phụ trách",
        sortValue: (request) => request.assignee,
        cell: (request) => request.assignee,
      },
      {
        id: "priority",
        header: "Mức độ",
        sortValue: (request) => request.priority,
        cell: (request) => {
          const priority = maintenancePriorityMap[request.priority];
          return <Badge tone={priority.tone}>{priority.label}</Badge>;
        },
      },
      {
        id: "status",
        header: "Trạng thái",
        sortValue: (request) => request.status,
        cell: (request) => {
          const status = maintenanceStatusMap[request.status];
          return <Badge tone={status.tone}>{status.label}</Badge>;
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        align: "end",
        width: "5rem",
        cell: (request) => (
          <div className="row-actions">
            <DropdownMenu
              label={`Thao tác cho ${request.code}`}
              trigger={<MoreHorizontal size={18} aria-hidden="true" />}
              items={[
                {
                  label: "Phân công kỹ thuật",
                  icon: UserRoundCheck,
                  onSelect: () =>
                    setMessage(`Đã mở phân công cho ${request.code}.`),
                },
                {
                  label: "Cập nhật tiến độ",
                  icon: Pencil,
                  onSelect: () => setMessage(`Đã mở cập nhật ${request.code}.`),
                },
                {
                  label: "Đánh dấu hoàn tất",
                  icon: CheckCircle2,
                  separatorBefore: true,
                  onSelect: () => {
                    setRequests((current) =>
                      current.map((item) =>
                        item.id === request.id
                          ? { ...item, status: "completed" }
                          : item,
                      ),
                    );
                    setMessage(`Đã đánh dấu ${request.code} hoàn tất.`);
                  },
                },
              ]}
            />
          </div>
        ),
      },
    ],
    [],
  );

  const countByStatus = (status: MaintenanceStatus) =>
    requests.filter((request) => request.status === status).length;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !form.title.trim() ||
      !form.propertyName ||
      !form.roomCode ||
      form.description.trim().length < 10
    ) {
      setError(
        "Hãy chọn vị trí, nhập tiêu đề và mô tả ít nhất 10 ký tự để kỹ thuật có đủ thông tin.",
      );
      return;
    }

    const request: MaintenanceRequest = {
      id: `maintenance-local-${Date.now()}`,
      code: `SC-${String(requests.length + 1).padStart(6, "0")}`,
      title: form.title.trim(),
      roomCode: form.roomCode,
      propertyName: form.propertyName,
      createdAt: "2026-07-31",
      assignee: "Chưa phân công",
      status: "new",
      priority: form.priority,
    };
    setRequests((current) => [request, ...current]);
    setMessage(`Đã tạo yêu cầu ${request.code} trong dữ liệu mô phỏng.`);
    setForm(initialForm);
    setError("");
    setDrawerOpen(false);
    setActiveTab("all");
  };

  return (
    <div className="management-page">
      <PageHeader
        title="Yêu cầu sửa chữa"
        description="Tiếp nhận, ưu tiên và theo dõi tiến độ xử lý sự cố tại các phòng."
        actions={
          <Button
            leadingIcon={Plus}
            onClick={() => {
              setError("");
              setDrawerOpen(true);
            }}
          >
            Tạo yêu cầu
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
            label: "Tổng yêu cầu",
            value: String(requests.length),
            meta: "Trong kỳ hiện tại",
            icon: Wrench,
          },
          {
            label: "Yêu cầu mới",
            value: String(countByStatus("new")),
            meta: "Chờ tiếp nhận",
            icon: ClipboardCheck,
          },
          {
            label: "Đang xử lý",
            value: String(countByStatus("in_progress")),
            meta: "Đã phân công",
            icon: Clock3,
          },
          {
            label: "Khẩn cấp",
            value: String(
              requests.filter((request) => request.priority === "urgent")
                .length,
            ),
            meta: "Cần ưu tiên",
            icon: Siren,
          },
        ]}
      />
      <Tabs
        label="Lọc theo tiến độ sửa chữa"
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as MaintenanceTab)}
        items={[
          { id: "all", label: "Tất cả", count: requests.length },
          { id: "new", label: "Yêu cầu mới", count: countByStatus("new") },
          {
            id: "in_progress",
            label: "Đang xử lý",
            count: countByStatus("in_progress"),
          },
          {
            id: "completed",
            label: "Hoàn tất",
            count: countByStatus("completed"),
          },
        ]}
      />
      <DataTable
        rows={visibleRequests}
        columns={columns}
        getRowId={(request) => request.id}
        getSearchText={(request) =>
          `${request.code} ${request.title} ${request.roomCode} ${request.propertyName} ${request.assignee}`
        }
        searchPlaceholder="Tìm yêu cầu, phòng hoặc người phụ trách..."
        filters={[
          {
            id: "priority",
            label: "Mức độ",
            options: [
              { value: "normal", label: "Bình thường" },
              { value: "high", label: "Ưu tiên cao" },
              { value: "urgent", label: "Khẩn cấp" },
            ],
            predicate: (request, value) => request.priority === value,
          },
        ]}
        selectable
        emptyTitle="Không tìm thấy yêu cầu"
        emptyDescription="Thử đổi từ khóa, mức độ hoặc tạo một yêu cầu mới."
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Tạo yêu cầu sửa chữa"
        description="Cung cấp đủ vị trí và mô tả để đội kỹ thuật xử lý nhanh."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" form="create-maintenance-form">
              Tạo yêu cầu
            </Button>
          </>
        }
      >
        <form
          id="create-maintenance-form"
          className="management-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {error ? (
            <Alert title="Chưa thể tạo yêu cầu" tone="danger">
              {error}
            </Alert>
          ) : null}
          <Input
            label="Tiêu đề sự cố"
            placeholder="Ví dụ: Rò rỉ đường nước"
            value={form.title}
            required
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />
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
              .filter((room) => room.propertyName === form.propertyName)
              .map((room) => ({ value: room.code, label: room.code }))}
            required
            disabled={!form.propertyName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                roomCode: event.target.value,
              }))
            }
          />
          <Select
            label="Mức độ ưu tiên"
            value={form.priority}
            options={[
              { value: "normal", label: "Bình thường" },
              { value: "high", label: "Ưu tiên cao" },
              { value: "urgent", label: "Khẩn cấp" },
            ]}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                priority: event.target.value as MaintenancePriority,
              }))
            }
          />
          <Textarea
            label="Mô tả chi tiết"
            placeholder="Mô tả hiện tượng, thời điểm phát hiện và ảnh hưởng hiện tại..."
            value={form.description}
            helperText="Tối thiểu 10 ký tự. Không đưa thông tin cá nhân vào mô tả."
            required
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </form>
      </Drawer>
    </div>
  );
}
