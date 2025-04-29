export type BillingLineItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  totalPrice: number;
  subscriptionId: string;
  status: "upcoming" | "active" | "canceled" | "trialing";
};

export type Tax = {
  amount: number;
  taxRateId: string;
};

export type BillingBreakdown = {
  lineItems: BillingLineItem[];
  taxes?: Tax[];
  currency: string;
  totalCurrentAmount: number;
  totalProjectedAmount: number;
};
