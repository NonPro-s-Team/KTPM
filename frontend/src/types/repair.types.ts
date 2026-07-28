export const RepairStatus = {
  Submitted: 'Submitted',
  InProgress: 'InProgress',
  Resolved: 'Resolved',
  Closed: 'Closed',
} as const;

export type RepairStatus = (typeof RepairStatus)[keyof typeof RepairStatus];

export interface RepairRequestDto {
  id: string;
  roomId: string;
  roomNumber: string;
  tenantId: string;
  tenantName: string;
  title: string;
  description: string;
  status: RepairStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface CreateRepairRequest {
  roomId: string;
  title: string;
  description: string;
}

export interface UpdateRepairStatusRequest {
  status: RepairStatus;
}
