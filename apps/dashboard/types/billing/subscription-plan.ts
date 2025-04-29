import type { Maybe } from "@workspace/common/maybe";

export type SubscriptionPlan = {
  displayName: string;
  isCanceled: boolean;
  stripeCurrentPeriod: Maybe<number>;
};
