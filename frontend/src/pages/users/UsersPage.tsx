import {
  KeyRound,
  LockKeyhole,
  MailPlus,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldCheck,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { ManagementSummary } from "../../components/management/ManagementSummary";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  DropdownMenu,
  Input,
  Modal,
  PageHeader,
  Select,
  type DataTableColumn,
} from "../../components/ui";
import { users as initialUsers } from "../../data/mockData";
import type { User, UserRole } from "../../types/models";
import { formatDate } from "../../utils/formatters";
import { userRoleMap, userStatusMap } from "../../utils/status";
import "../../styles/management.css";

interface InviteFormState {
  displayName: string;
  email: string;
  role: UserRole;
}

const initialForm: InviteFormState = {
  displayName: "",
  email: "",
  role: "manager",
};

export function UsersPage() {
  const [userRows, setUserRows] = useState(initialUsers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const columns = useMemo<DataTableColumn<User>[]>(
    () => [
      {
        id: "user",
        header: "Người dùng",
        sortValue: (user) => user.displayName,
        cell: (user) => (
          <span className="primary-cell">
            <strong>{user.displayName}</strong>
            <small>{user.email}</small>
          </span>
        ),
      },
      {
        id: "role",
        header: "Vai trò",
        sortValue: (user) => user.role,
        cell: (user) => {
          const role = userRoleMap[user.role];
          return <Badge tone={role.tone}>{role.label}</Badge>;
        },
      },
      {
        id: "status",
        header: "Trạng thái",
        sortValue: (user) => user.status,
        cell: (user) => {
          const status = userStatusMap[user.status];
          return <Badge tone={status.tone}>{status.label}</Badge>;
        },
      },
      {
        id: "lastActive",
        header: "Hoạt động gần nhất",
        sortValue: (user) => user.lastActiveAt,
        cell: (user) => formatDate(user.lastActiveAt),
      },
      {
        id: "actions",
        header: "Thao tác",
        align: "end",
        width: "5rem",
        cell: (user) => (
          <div className="row-actions">
            <DropdownMenu
              label={`Thao tác cho ${user.displayName}`}
              trigger={<MoreHorizontal size={18} aria-hidden="true" />}
              items={[
                {
                  label: "Chỉnh sửa vai trò",
                  icon: Pencil,
                  onSelect: () =>
                    setMessage(`Đã mở quyền của ${user.displayName}.`),
                },
                {
                  label: "Đặt lại mật khẩu",
                  icon: KeyRound,
                  onSelect: () =>
                    setMessage(
                      `Đã mô phỏng gửi yêu cầu đặt lại cho ${user.displayName}.`,
                    ),
                },
                {
                  label:
                    user.status === "locked"
                      ? "Tài khoản đã khóa"
                      : "Khóa tài khoản",
                  icon: LockKeyhole,
                  danger: user.status !== "locked",
                  separatorBefore: true,
                  onSelect: () => {
                    if (user.status !== "locked") setConfirmUser(user);
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

  const handleInvite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !form.displayName.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      setError("Hãy nhập tên hiển thị và email hợp lệ.");
      return;
    }

    const user: User = {
      id: `user-local-${Date.now()}`,
      displayName: form.displayName.trim(),
      email: form.email.trim().toLocaleLowerCase("vi"),
      role: form.role,
      status: "invited",
      lastActiveAt: "2026-07-31",
    };
    setUserRows((current) => [user, ...current]);
    setMessage(`Đã tạo lời mời mô phỏng cho ${user.displayName}.`);
    setForm(initialForm);
    setError("");
    setInviteOpen(false);
  };

  const handleLockUser = () => {
    if (!confirmUser) return;
    setUserRows((current) =>
      current.map((user) =>
        user.id === confirmUser.id ? { ...user, status: "locked" } : user,
      ),
    );
    setMessage(`Đã khóa tài khoản ${confirmUser.displayName} trong mock data.`);
    setConfirmUser(null);
  };

  return (
    <div className="management-page">
      <PageHeader
        title="Tài khoản & phân quyền"
        description="Quản lý người dùng theo vai trò nghiệp vụ và trạng thái truy cập."
        actions={
          <Button
            leadingIcon={MailPlus}
            onClick={() => {
              setError("");
              setInviteOpen(true);
            }}
          >
            Mời người dùng
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
            label: "Tổng tài khoản",
            value: String(userRows.length),
            meta: "Trong hệ thống",
            icon: UsersRound,
          },
          {
            label: "Đang hoạt động",
            value: String(
              userRows.filter((user) => user.status === "active").length,
            ),
            meta: "Có quyền truy cập",
            icon: UserCheck,
          },
          {
            label: "Đang chờ",
            value: String(
              userRows.filter((user) => user.status === "invited").length,
            ),
            meta: "Đã gửi lời mời",
            icon: MailPlus,
          },
          {
            label: "Vai trò",
            value: "4",
            meta: "Phân quyền nghiệp vụ",
            icon: ShieldCheck,
          },
        ]}
      />
      <DataTable
        rows={userRows}
        columns={columns}
        getRowId={(user) => user.id}
        getSearchText={(user) =>
          `${user.displayName} ${user.email} ${userRoleMap[user.role].label}`
        }
        searchPlaceholder="Tìm người dùng, email hoặc vai trò..."
        filters={[
          {
            id: "role",
            label: "Vai trò",
            options: Object.entries(userRoleMap).map(([value, item]) => ({
              value,
              label: item.label,
            })),
            predicate: (user, value) => user.role === value,
          },
        ]}
        emptyTitle="Không tìm thấy người dùng"
        emptyDescription="Thử đổi từ khóa, vai trò hoặc gửi một lời mời mới."
      />

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Mời người dùng"
        description="Email trong bản review nên dùng miền example.local."
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" form="invite-user-form" leadingIcon={Plus}>
              Gửi lời mời
            </Button>
          </>
        }
      >
        <form
          id="invite-user-form"
          className="management-form"
          onSubmit={handleInvite}
          noValidate
        >
          {error ? (
            <Alert title="Chưa thể gửi lời mời" tone="danger">
              {error}
            </Alert>
          ) : null}
          <Input
            label="Tên hiển thị"
            placeholder="Ví dụ: Người dùng Quản lý 02"
            value={form.displayName}
            required
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                displayName: event.target.value,
              }))
            }
          />
          <Input
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="manager02@example.local"
            value={form.email}
            required
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
          />
          <Select
            label="Vai trò"
            value={form.role}
            options={Object.entries(userRoleMap).map(([value, item]) => ({
              value,
              label: item.label,
            }))}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                role: event.target.value as UserRole,
              }))
            }
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmUser)}
        title="Khóa tài khoản?"
        description={`Tài khoản ${
          confirmUser?.displayName ?? ""
        } sẽ không thể truy cập hệ thống cho tới khi được mở khóa.`}
        confirmLabel="Khóa tài khoản"
        danger
        onConfirm={handleLockUser}
        onClose={() => setConfirmUser(null)}
      />
    </div>
  );
}
