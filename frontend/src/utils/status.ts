import type {
  ContractStatus,
  InvoiceStatus,
  MaintenancePriority,
  MaintenanceStatus,
  PaymentStatus,
  RoomStatus,
  StatusTone,
  UserRole,
  UserStatus,
} from "../types/models";

export interface StatusDefinition {
  label: string;
  tone: StatusTone;
}

export const roomStatusMap = {
  vacant: { label: "Phòng trống", tone: "neutral" },
  occupied: { label: "Đang thuê", tone: "success" },
  maintenance: { label: "Đang bảo trì", tone: "warning" },
} satisfies Record<RoomStatus, StatusDefinition>;

export const contractStatusMap = {
  active: { label: "Hiệu lực", tone: "success" },
  expiring: { label: "Sắp hết hạn", tone: "warning" },
  ended: { label: "Đã kết thúc", tone: "neutral" },
} satisfies Record<ContractStatus, StatusDefinition>;

export const invoiceStatusMap = {
  paid: { label: "Đã thanh toán", tone: "success" },
  pending: { label: "Chờ thanh toán", tone: "info" },
  overdue: { label: "Quá hạn", tone: "danger" },
} satisfies Record<InvoiceStatus, StatusDefinition>;

export const paymentStatusMap = {
  completed: { label: "Hoàn tất", tone: "success" },
  processing: { label: "Đang xử lý", tone: "info" },
  failed: { label: "Thất bại", tone: "danger" },
} satisfies Record<PaymentStatus, StatusDefinition>;

export const maintenanceStatusMap = {
  new: { label: "Yêu cầu mới", tone: "info" },
  in_progress: { label: "Đang xử lý", tone: "warning" },
  completed: { label: "Hoàn tất", tone: "success" },
} satisfies Record<MaintenanceStatus, StatusDefinition>;

export const maintenancePriorityMap = {
  normal: { label: "Bình thường", tone: "neutral" },
  high: { label: "Ưu tiên cao", tone: "warning" },
  urgent: { label: "Khẩn cấp", tone: "danger" },
} satisfies Record<MaintenancePriority, StatusDefinition>;

export const userRoleMap = {
  owner: { label: "Chủ nhà", tone: "neutral" },
  manager: { label: "Quản lý", tone: "info" },
  accountant: { label: "Kế toán", tone: "success" },
  admin: { label: "Quản trị", tone: "warning" },
} satisfies Record<UserRole, StatusDefinition>;

export const userStatusMap = {
  active: { label: "Đang hoạt động", tone: "success" },
  invited: { label: "Đã mời", tone: "info" },
  locked: { label: "Đã khóa", tone: "danger" },
} satisfies Record<UserStatus, StatusDefinition>;
