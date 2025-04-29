import { BillingAddress } from "./billing-address";
import { BillingBreakdown } from "./billing-breakdown";
import { BillingEmail } from "./billing-email";
import { Invoice } from "./invoice";
import { SubscriptionPlan } from "./subscription-plan";

export type BillingDetails = {
  plan: SubscriptionPlan;
  breakdown: BillingBreakdown;
  email: BillingEmail;
  address: BillingAddress;
  invoices: Invoice[];
};
