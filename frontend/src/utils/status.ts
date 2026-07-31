import type {
  ContractStatus,
  InvoiceStatus,
  MaintenanceRequestStatus,
  RoomStatus,
  UserRole,
} from "../types/api";
import type { StatusDefinition } from "../types/models";

export const roomStatusMap = {
  available: { label: "Phòng trống", tone: "neutral" },
  occupied: { label: "Đang thuê", tone: "success" },
  maintenance: { label: "Đang bảo trì", tone: "warning" },
  inactive: { label: "Ngừng hoạt động", tone: "danger" },
} satisfies Record<RoomStatus, StatusDefinition>;

export const contractStatusMap = {
  draft: { label: "Bản nháp", tone: "neutral" },
  active: { label: "Hiệu lực", tone: "success" },
  terminated: { label: "Đã chấm dứt", tone: "warning" },
  cancelled: { label: "Đã hủy", tone: "danger" },
} satisfies Record<ContractStatus, StatusDefinition>;

export const invoiceStatusMap = {
  draft: { label: "Bản nháp", tone: "neutral" },
  issued: { label: "Đã phát hành", tone: "info" },
  partiallyPaid: { label: "Thanh toán một phần", tone: "warning" },
  paid: { label: "Đã thanh toán", tone: "success" },
  overdue: { label: "Quá hạn", tone: "danger" },
  cancelled: { label: "Đã hủy", tone: "danger" },
} satisfies Record<InvoiceStatus, StatusDefinition>;

export const maintenanceStatusMap = {
  submitted: { label: "Đã gửi", tone: "info" },
  inProgress: { label: "Đang xử lý", tone: "warning" },
  resolved: { label: "Đã xử lý", tone: "success" },
  closed: { label: "Đã đóng", tone: "neutral" },
} satisfies Record<MaintenanceRequestStatus, StatusDefinition>;

export const userRoleMap = {
  admin: { label: "Quản trị viên", tone: "warning" },
  staff: { label: "Nhân viên", tone: "info" },
  tenant: { label: "Khách thuê", tone: "success" },
} satisfies Record<UserRole, StatusDefinition>;

export function isContractExpiringSoon(
  status: ContractStatus,
  endDate: string,
  now = new Date(),
) {
  if (status !== "active") return false;

  const end = new Date(`${endDate}T23:59:59`);
  const threshold = new Date(now);
  threshold.setDate(threshold.getDate() + 30);
  return end >= now && end <= threshold;
}
