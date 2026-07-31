import type {
  CreateInvoiceRequest,
  InvoiceDetailsResponse,
  InvoiceResponse,
  InvoiceStatus,
  PagedQuery,
  PagedResult,
  PaymentResponse,
  RegisterPaymentRequest,
  UpdateDraftInvoiceRequest,
} from "../types/api";
import { httpClient } from "./httpClient";

export const invoicesApi = {
  async list(query: PagedQuery<InvoiceStatus>, signal?: AbortSignal) {
    const response = await httpClient.get<PagedResult<InvoiceResponse>>(
      "/invoices",
      { params: query, signal },
    );
    return response.data;
  },
  async outstanding(tenantId?: string, signal?: AbortSignal) {
    const response = await httpClient.get<InvoiceResponse[]>(
      "/invoices/outstanding",
      { params: tenantId ? { tenantId } : undefined, signal },
    );
    return response.data;
  },
  async getById(id: string, signal?: AbortSignal) {
    const response = await httpClient.get<InvoiceDetailsResponse>(
      `/invoices/${id}`,
      { signal },
    );
    return response.data;
  },
  async create(request: CreateInvoiceRequest) {
    const response = await httpClient.post<InvoiceResponse>(
      "/invoices",
      request,
    );
    return response.data;
  },
  async update(id: string, request: UpdateDraftInvoiceRequest) {
    const response = await httpClient.put<InvoiceResponse>(
      `/invoices/${id}`,
      request,
    );
    return response.data;
  },
  async issue(id: string) {
    const response = await httpClient.post<InvoiceResponse>(
      `/invoices/${id}/issue`,
    );
    return response.data;
  },
  async registerPayment(id: string, request: RegisterPaymentRequest) {
    const response = await httpClient.post<PaymentResponse>(
      `/invoices/${id}/payments`,
      request,
    );
    return response.data;
  },
  async payments(id: string, signal?: AbortSignal) {
    const response = await httpClient.get<PaymentResponse[]>(
      `/invoices/${id}/payments`,
      { signal },
    );
    return response.data;
  },
};
