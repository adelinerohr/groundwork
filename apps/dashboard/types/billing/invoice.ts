import type { Maybe } from "@workspace/common/maybe";

export type InvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "uncollectible"
  | "void";

export type Invoice = {
  id: string;
  number: string | null;
  invoicePdfUrl: Maybe<string>;
  date: number;
  amount: number;
  currency: string;
  status: InvoiceStatus | null;
};
