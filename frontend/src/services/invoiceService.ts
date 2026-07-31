import type { Invoice } from "../types/models";
import { apiClient } from "./apiClient";

export const invoiceService = {
  list: () => apiClient.get<Invoice[]>("/invoices"),
  create: (invoice: Omit<Invoice, "id">) =>
    apiClient.post<Invoice, Omit<Invoice, "id">>("/invoices", invoice),
};
