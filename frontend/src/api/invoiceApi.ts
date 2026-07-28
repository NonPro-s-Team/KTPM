import api from './axiosConfig';
import type { InvoiceDto, CreateInvoiceRequest } from '../types/invoice.types';

export const getInvoices = async (): Promise<InvoiceDto[]> => {
  const response = await api.get<InvoiceDto[]>('/invoices');
  return response.data;
};

export const getInvoiceById = async (id: string): Promise<InvoiceDto> => {
  const response = await api.get<InvoiceDto>(`/invoices/${id}`);
  return response.data;
};

export const createInvoice = async (data: CreateInvoiceRequest): Promise<InvoiceDto> => {
  const response = await api.post<InvoiceDto>('/invoices', data);
  return response.data;
};
