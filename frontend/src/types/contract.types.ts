export const ContractStatus = {
  Draft: 'Draft',
  Active: 'Active',
  Terminated: 'Terminated',
  Cancelled: 'Cancelled',
} as const;

export type ContractStatus = (typeof ContractStatus)[keyof typeof ContractStatus];

export interface ContractDto {
  id: string;
  roomId: string;
  roomNumber: string;
  tenantId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: ContractStatus;
  createdAt: string;
}

export interface CreateContractRequest {
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
}
