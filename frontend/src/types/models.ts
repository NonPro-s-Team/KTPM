export type {
  ContractStatus,
  InvoiceStatus,
  MaintenanceRequestStatus,
  RoomStatus,
  UserRole,
} from "./api";

export type StatusTone = "neutral" | "success" | "info" | "warning" | "danger";

export interface StatusDefinition {
  label: string;
  tone: StatusTone;
}
