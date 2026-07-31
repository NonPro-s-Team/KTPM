export type RoomStatus = "vacant" | "occupied" | "maintenance";
export type ContractStatus = "active" | "expiring" | "ended";
export type InvoiceStatus = "paid" | "pending" | "overdue";
export type PaymentStatus = "completed" | "processing" | "failed";
export type MaintenanceStatus = "new" | "in_progress" | "completed";
export type MaintenancePriority = "normal" | "high" | "urgent";
export type UserRole = "owner" | "manager" | "accountant" | "admin";
export type UserStatus = "active" | "invited" | "locked";
export type StatusTone = "neutral" | "success" | "info" | "warning" | "danger";

export interface Property {
  id: string;
  name: string;
  code: string;
  address: string;
  roomCount: number;
  occupiedCount: number;
  managerName: string;
}

export interface Room {
  id: string;
  code: string;
  propertyId: string;
  propertyName: string;
  floor: number;
  area: number;
  monthlyRent: number;
  status: RoomStatus;
  tenantLabel?: string;
  contractEndDate?: string;
}

export interface Tenant {
  id: string;
  code: string;
  displayName: string;
  roomCode: string;
  propertyName: string;
  moveInDate: string;
  contractStatus: ContractStatus;
}

export interface Contract {
  id: string;
  code: string;
  tenantLabel: string;
  roomCode: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: ContractStatus;
}

export interface Invoice {
  id: string;
  code: string;
  roomCode: string;
  tenantLabel: string;
  billingPeriod: string;
  total: number;
  dueDate: string;
  status: InvoiceStatus;
}

export interface Payment {
  id: string;
  code: string;
  invoiceCode: string;
  roomCode: string;
  amount: number;
  paidAt: string;
  method: "bank_transfer" | "cash" | "wallet";
  status: PaymentStatus;
}

export interface MaintenanceRequest {
  id: string;
  code: string;
  title: string;
  roomCode: string;
  propertyName: string;
  createdAt: string;
  assignee: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActiveAt: string;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  displayValue: string;
  meta: string;
  tone: StatusTone;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  target: number;
}

export interface RoomStatusPoint {
  status: RoomStatus;
  label: string;
  value: number;
  tone: "success" | "warning" | "neutral";
}

export interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  tone: "warning" | "danger" | "info";
  href: string;
}
