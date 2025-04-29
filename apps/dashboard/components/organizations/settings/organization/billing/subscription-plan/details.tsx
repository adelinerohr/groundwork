"use client";

import * as React from "react";
import { differenceInDays, format } from "date-fns";

import { getStripeClient } from "@workspace/billing/stripe-client";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";
import { cn } from "@workspace/ui/lib/utils";

import { createBillingPortalSessionUrl } from "~/actions/billing/create-billing-portal-session-url";
import { createCheckoutSession } from "~/actions/billing/create-checkout-session";
import { SubscriptionPlan } from "~/types/billing/subscription-plan";

export type SubscriptionPlanDetailsProps =
  React.HtmlHTMLAttributes<HTMLDivElement> & {
    plan: SubscriptionPlan;
  };

export function SubscriptionPlanDetails({
  plan,
  className,
  ...other
}: SubscriptionPlanDetailsProps): React.JSX.Element {
  const [loading, setLoading] = React.useState<boolean>(false);

  const isFreePlan = plan.displayName === "Free";

  const handleUpgrade = async (): Promise<void> => {
    const result = await createCheckoutSession();
    if (result?.data?.session?.id) {
      const stripe = await getStripeClient();
      const { error } = await stripe!.redirectToCheckout({
        sessionId: result.data.session.id,
      });
      if (error?.message) {
        toast.error(error.message);
      }
    } else {
      toast.error("Failed to create checkout session. Please try again.");
    }
  };

  const handleBillingPortalRedirect = async (): Promise<void> => {
    const result = await createBillingPortalSessionUrl();
    if (result?.data?.url) {
      window.location.href = result.data.url;
    } else {
      toast.error("Failed to create billing portal session. Please try again.");
    }
  };

  const handleBillingRedirect = async (): Promise<void> => {
    setLoading(true);
    try {
      if (isFreePlan) {
        await handleUpgrade();
      } else {
        await handleBillingPortalRedirect();
      }
    } catch (error) {
      console.error("Billing redirect error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)} {...other}>
      <div>
        <p className="text-sm text-muted-foreground">
          This organization is currently on the plan:
        </p>
        <p>
          <span className="text-2xl">{plan.displayName}</span>
          {plan.isCanceled && (
            <span className="ml-2 text-sm text-muted-foreground">
              (Canceled)
            </span>
          )}
        </p>
      </div>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          loading={loading}
          onClick={handleBillingRedirect}
        >
          {isFreePlan ? "Upgrade to Pro" : "Change subscription"}
        </Button>
      </div>
    </div>
  );
}

function formatStripeDate(timestamp: number): string {
  return format(new Date(timestamp * 1000), "MMM dd");
}
