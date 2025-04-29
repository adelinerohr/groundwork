"use server";

import { cache } from "react";
import Stripe from "stripe";

import { getAuthOrganizationContext } from "@workspace/auth/context";
import { stripeServer } from "@workspace/billing/stripe-server";
import {
  mapSubscriptionToTier,
  pickSubscription,
} from "@workspace/billing/subscription";
import { Tier } from "@workspace/billing/tier";
import { GatewayError, PreConditionError } from "@workspace/common/errors";

import { tierLabels } from "~/lib/labels";
import { BillingLineItem } from "~/types/billing/billing-breakdown";
import { BillingDetails } from "~/types/billing/billing-details";

const FALLBACK_CURRENCY = "usd";

function getTierNameFromLineItem(
  item: Stripe.InvoiceLineItem,
  subscriptions: Stripe.Subscription[]
): string {
  // For proration or adjustment line items
  if (item.parent?.invoice_item_details?.proration) {
    return "Plan Adjustment";
  }

  const subscription = subscriptions.find(
    (sub) => sub.id === item.subscription
  );
  if (subscription) {
    return `${tierLabels[mapSubscriptionToTier(subscription) as Tier]} Plan`;
  }

  return item.description ?? "Unknown Item";
}

function calculateSubscriptionAmount(
  subscription: Stripe.Subscription | undefined,
  position: "current" | "projected"
): number {
  if (!subscription) {
    return 0;
  }

  if (position === "projected" && subscription.cancel_at_period_end) {
    return 0;
  }

  // For current billing, Stripe has already calculated the total with discounts and tax
  return (
    subscription.items.data.reduce((total, item) => {
      return total + (item.price?.unit_amount ?? 0) * (item.quantity ?? 1);
    }, 0) / 100
  );
}

function generateLineItemsFromSubscription(
  subscription: Stripe.Subscription | undefined
): BillingLineItem[] {
  if (!subscription) {
    return [];
  }

  return subscription.items.data.map((item) => ({
    name: `${tierLabels[mapSubscriptionToTier(subscription) as Tier]} Plan`,
    quantity: item.quantity ?? 1,
    unitPrice: (item.price?.unit_amount ?? 0) / 100,
    currency: item.price?.currency || FALLBACK_CURRENCY,
    totalPrice: ((item.price?.unit_amount ?? 0) * (item.quantity ?? 1)) / 100,
    subscriptionId: subscription.id,
    status: subscription.cancel_at_period_end ? "canceled" : "active",
  }));
}

async function getBillingDetails(): Promise<BillingDetails> {
  const ctx = await getAuthOrganizationContext();
  if (!ctx.organization.stripe_customer_id) {
    throw new PreConditionError("Stripe customer ID is missing");
  }

  try {
    const customer = await stripeServer.customers.retrieve(
      ctx.organization.stripe_customer_id,
      {
        expand: ["subscriptions"],
      }
    );

    if ("deleted" in customer) {
      throw new PreConditionError("Customer has been deleted");
    }

    const subscriptions = customer.subscriptions?.data ?? [];
    const subscription = pickSubscription(subscriptions);

    // Prepare the upcoming invoice only if there is a subscription
    const upcomingInvoicePromise = subscription
      ? stripeServer.invoices
          .createPreview({
            customer: ctx.organization.stripe_customer_id,
            subscription: subscription.id,
            expand: ["lines.data.price"],
          })
          .catch((error) => {
            if (error.code === "invoice_upcoming_none") {
              return null;
            }
            throw error;
          })
      : Promise.resolve(null); // no subscription → no upcoming invoice needed

    const [upcomingInvoice, invoices] = await Promise.all([
      upcomingInvoicePromise,
      stripeServer.invoices.list({
        customer: ctx.organization.stripe_customer_id,
        expand: ["data.total_tax_amounts", "data.lines.data.price"],
      }),
    ]);

    const currentPeriodInvoices = invoices.data.filter((invoice) =>
      subscription?.billing_cycle_anchor
        ? invoice.period_end >= subscription.billing_cycle_anchor
        : false
    );
    const totalCurrentAmount =
      currentPeriodInvoices.length > 0
        ? currentPeriodInvoices.reduce(
            (total, invoice) => total + invoice.amount_paid,
            0
          ) / 100
        : calculateSubscriptionAmount(subscription, "current");
    const totalProjectedAmount = upcomingInvoice
      ? upcomingInvoice.total / 100
      : calculateSubscriptionAmount(subscription, "projected");

    const response: BillingDetails = {
      plan: {
        displayName: tierLabels[mapSubscriptionToTier(subscription) as Tier],
        isCanceled: subscription?.cancel_at_period_end ?? false,
        stripeCurrentPeriod: subscription?.billing_cycle_anchor,
      },
      breakdown: {
        lineItems: upcomingInvoice
          ? upcomingInvoice.lines.data.map((item) => {
              const price = item.pricing?.price_details?.price ?? undefined;
              const subscriptionId =
                item.parent?.invoice_item_details?.subscription ?? undefined;

              return {
                name: getTierNameFromLineItem(item, subscriptions),
                quantity: item.quantity ?? 1,
                unitPrice: Number(item.pricing?.unit_amount_decimal ?? 0) / 100,
                currency: item.currency,
                // Don't use Math.abs - preserve negative amounts for credits
                totalPrice: (item.amount ?? 0) / 100,
                subscriptionId: subscriptionId as string,
                status: item.period?.end ? "upcoming" : "active",
              };
            })
          : generateLineItemsFromSubscription(subscription),
        taxes:
          upcomingInvoice?.total_taxes?.map((tax) => ({
            amount: tax.amount / 100,
            taxRateId: tax.tax_rate_details?.tax_rate as string,
          })) ?? [],
        currency:
          upcomingInvoice?.currency ??
          subscription?.items.data[0]?.price?.currency ??
          FALLBACK_CURRENCY,
        totalCurrentAmount,
        totalProjectedAmount,
      },
      email: customer.email ?? undefined,
      address: {
        line1: customer.address?.line1 ?? undefined,
        line2: customer.address?.line2 ?? undefined,
        city: customer.address?.city ?? undefined,
        state: customer.address?.state ?? undefined,
        postalCode: customer.address?.postal_code ?? undefined,
        country: customer.address?.country ?? undefined,
      },
      invoices: invoices.data.map((invoice) => ({
        id: invoice.id ?? "",
        number: invoice.number,
        invoicePdfUrl: invoice.invoice_pdf,
        date: invoice.created,
        amount: invoice.total / 100,
        currency: invoice.currency || FALLBACK_CURRENCY,
        status: invoice.status,
        taxes:
          invoice.total_taxes?.map((tax) => ({
            amount: tax.amount / 100,
            taxRateId: tax.tax_rate_details?.tax_rate as string,
          })) ?? [],
      })),
    };

    return response;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new GatewayError(
        `Failed to retrieve billing details: ${error.message}`
      );
    }
    throw error;
  }
}

export const getDedupedBillingDetails = cache(getBillingDetails);
