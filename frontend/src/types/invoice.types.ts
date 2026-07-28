export const InvoiceStatus = {
  Draft: 'Draft',
  Issued: 'Issued',
  PartiallyPaid: 'PartiallyPaid',
  Paid: 'Paid',
  Overdue: 'Overdue',
  Cancelled: 'Cancelled',
} as const;

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export interface InvoiceDto {
  id: string;
  contractId: string;
  billingMonth: number;
  billingYear: number;
  rentAmount: number;
  electricAmount: number;
  waterAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  createdAt: string;
}

export interface CreateInvoiceRequest {
  contractId: string;
  billingMonth: number;
  billingYear: number;
}

export interface UtilityReadingRequest {
  electricStart: number;
  electricEnd: number;
  waterStart: number;
  waterEnd: number;
}
