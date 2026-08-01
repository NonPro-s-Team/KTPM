export type UserRole = "admin" | "staff" | "tenant";
export type RoomStatus =
  | "available"
  | "occupied"
  | "maintenance"
  | "inactive";
export type ContractStatus = "draft" | "active" | "terminated" | "cancelled";
export type InvoiceStatus =
  | "draft"
  | "issued"
  | "partiallyPaid"
  | "paid"
  | "overdue"
  | "cancelled";
export type MaintenanceRequestStatus =
  | "submitted"
  | "inProgress"
  | "resolved"
  | "closed";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  userId: string;
  username: string;
  role: UserRole;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface CreateInvitationRequest {
  email: string;
  role: Exclude<UserRole, "tenant">;
}

export interface InvitationResponse {
  id: string;
  email: string;
  role: UserRole;
  expiresAt: string;
  createdAt: string;
}

export interface InvitationPreviewResponse {
  email: string;
  role: UserRole;
  expiresAt: string;
}

export interface AcceptInvitationRequest {
  token: string;
  username: string;
  password: string;
}

export interface AcceptInvitationResponse {
  userId: string;
  username: string;
  role: UserRole;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  code?: string;
  traceId?: string;
}

export interface ValidationProblemDetails extends ApiProblemDetails {
  errors?: Record<string, string[]>;
}

export interface ApiError {
  status?: number;
  title: string;
  detail: string;
  code?: string;
  traceId?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface RoomResponse {
  id: string;
  roomNumber: string;
  monthlyRent: number;
  description: string | null;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateRoomRequest {
  roomNumber: string;
  monthlyRent: number;
  description: string | null;
}

export type UpdateRoomRequest = CreateRoomRequest;

export interface ChangeRoomStatusRequest {
  targetStatus: RoomStatus;
}

export interface TenantResponse {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  citizenId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateTenantRequest {
  username: string;
  initialPassword: string;
  fullName: string;
  phoneNumber: string;
  citizenId: string;
}

export interface UpdateTenantRequest {
  fullName: string;
  phoneNumber: string;
  citizenId: string;
}

export interface RentalContractResponse {
  id: string;
  roomId: string;
  roomNumber: string | null;
  tenantId: string;
  tenantName: string | null;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: ContractStatus;
  activatedAt: string | null;
  terminatedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateRentalContractRequest {
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
}

export interface UpdateDraftContractRequest {
  startDate: string;
  endDate: string;
  monthlyRent: number;
}

export interface InvoiceResponse {
  id: string;
  contractId: string;
  billingMonth: number;
  billingYear: number;
  rentAmount: number;
  electricityStartReading: number;
  electricityEndReading: number;
  waterStartReading: number;
  waterEndReading: number;
  electricityUnitPrice: number;
  waterUnitPrice: number;
  electricityAmount: number;
  waterAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  issuedAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PaymentResponse {
  id: string;
  invoiceId: string;
  amount: number;
  note: string | null;
  recordedByUserId: string;
  paidAt: string;
}

export interface InvoiceDetailsResponse {
  invoice: InvoiceResponse;
  payments: PaymentResponse[];
}

export interface CreateInvoiceRequest {
  contractId: string;
  billingMonth: number;
  billingYear: number;
  electricityStartReading: number;
  electricityEndReading: number;
  waterStartReading: number;
  waterEndReading: number;
  electricityUnitPrice: number;
  waterUnitPrice: number;
}

export interface UpdateDraftInvoiceRequest {
  rentAmount: number;
  electricityStartReading: number;
  electricityEndReading: number;
  waterStartReading: number;
  waterEndReading: number;
  electricityUnitPrice: number;
  waterUnitPrice: number;
}

export interface RegisterPaymentRequest {
  amount: number;
  note: string | null;
}

export interface CreateMaintenanceRequestRequest {
  title: string;
  description: string;
}

export interface StartMaintenanceRequestRequest {
  note: string | null;
}

export interface AddMaintenanceProgressRequest {
  note: string;
}

export interface ResolveMaintenanceRequestRequest {
  resolutionNote: string;
}

export interface CloseMaintenanceRequestRequest {
  note: string | null;
}

export interface MaintenanceUpdateResponse {
  previousStatus: MaintenanceRequestStatus;
  newStatus: MaintenanceRequestStatus;
  note: string | null;
  updatedByUserId: string;
  occurredAt: string;
}

export interface MaintenanceRequestResponse {
  id: string;
  tenantId: string;
  roomId: string;
  title: string;
  description: string;
  status: MaintenanceRequestStatus;
  startedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updates: MaintenanceUpdateResponse[];
}

export interface DashboardSummaryResponse {
  totalRooms: number;
  occupiedRooms: number;
  activeMaintenanceRequests: number;
  unpaidInvoices: number;
}

export interface HealthResponse {
  status: string;
  [key: string]: unknown;
}

export interface PagedQuery<TStatus extends string = string> {
  pageNumber: number;
  pageSize: number;
  status?: TStatus;
}
