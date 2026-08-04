// Khớp 100% với backend/src/TroConnect.Api/Features/Tenants/TenantDtos.cs — đã verify trực
// tiếp qua API thật. Route: /api/tenants (flat), không phân trang, không response wrapper.
//
// QUAN TRỌNG — đã báo lại người dùng: entity Tenant ở BE là **hồ sơ người thuê độc lập**,
// KHÔNG có liên kết tới Room. Không có RoomId, không có MoveInDate/MoveOutDate, không có
// tiền cọc, không có enum trạng thái (Active/CheckedOut), và KHÔNG có endpoint checkout/
// move-out. Theo docs/contract-management.md, quan hệ Người thuê <-> Phòng đi qua module
// Contract (bảng nối ContractTenant với vai trò Representative/CoTenant) — module Contract
// hiện CHƯA tồn tại. Không tự thêm các field/khái niệm đó ở FE cho tới khi BE có.

// Enum TenantGender — BE serialize ra JSON dạng SỐ (chưa bật JsonStringEnumConverter),
// giống Account.Role. Lưu trong DB dạng string nhưng JSON vẫn là số.
export const TenantGender = {
  Male: 0,
  Female: 1,
  Other: 2,
} as const

export type TenantGenderValue = (typeof TenantGender)[keyof typeof TenantGender]

// Label tiếng Việt chỉ là lớp hiển thị — giá trị gửi lên API luôn là số enum gốc
export const TENANT_GENDER_LABELS: Record<TenantGenderValue, string> = {
  [TenantGender.Male]: 'Nam',
  [TenantGender.Female]: 'Nữ',
  [TenantGender.Other]: 'Khác',
}

// TenantListDto — GET /tenants, GET /tenants?search=. Chỉ 4 field; muốn xem đủ thông tin
// (quê quán, ngày sinh, giới tính, email) phải gọi getById.
export interface Tenant {
  id: string
  fullName: string
  idNumber: string
  phoneNumber: string
}

// TenantDetailDto — GET /tenants/{id}, và cũng là response của POST/PUT /tenants
export interface TenantDetail {
  id: string
  fullName: string
  idNumber: string
  phoneNumber: string
  hometown: string
  dateOfBirth: string | null // "yyyy-MM-dd" (DateOnly), nullable
  gender: TenantGenderValue | null
  email: string | null
  createdAt: string
  updatedAt: string
}

// CreateTenantRequest / UpdateTenantRequest — hai request cùng shape ở BE
export interface TenantPayload {
  fullName: string
  idNumber: string
  phoneNumber: string
  hometown: string
  dateOfBirth: string | null
  gender: TenantGenderValue | null
  email: string | null
}
