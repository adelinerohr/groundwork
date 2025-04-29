'use server';

import { createClient } from '@workspace/database/server';

import { keys } from '../keys';
import { BillingUnit } from './billing-unit';
import { stripeServer } from './stripe-server';
import { mapSubscriptionToTier, pickSubscription } from './subscription';

export async function addOrganizationToStripe(
  name: string,
  email: string,
  organizationId: string
): Promise<string> {
  const stripeCustomer = await stripeServer.customers.create({
    name,
    email,
    metadata: {
      organizationId
    }
  });

  return stripeCustomer.id;
}

export async function updateOrganizationSubscriptionPlan(
  stripeCustomerId: string | null | undefined
): Promise<void> {
  const supabase = await createClient();
  if (!stripeCustomerId) {
    console.warn('Missing stripeCustomerId');
    return;
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('id, tier, stripe_customer_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  if (!organization || !organization.stripe_customer_id) {
    console.warn('Organization not found or missing stripeCustomerId');
    return;
  }

  const subscriptionsResponse = await stripeServer.subscriptions.list({
    customer: organization.stripe_customer_id
  });

  const subscriptions = subscriptionsResponse.data || [];
  const subscription = pickSubscription(subscriptions);
  const tier = mapSubscriptionToTier(subscription);

  if (tier !== organization.tier) {
    await supabase
      .from('organizations')
      .update({ tier: tier })
      .eq('id', organization.id);
  }
}

export async function updateOrganizationSubscriptionQuantity(
  organizationId: string
): Promise<void> {
  if (keys().BILLING_UNIT !== BillingUnit.PerSeat) return;
  const supabase = await createClient();

  const { data: organization } = await supabase
    .from('organizations')
    .select('stripe_customer_id, memberships (id)')
    .eq('id', organizationId)
    .single();

  if (!organization) {
    console.warn(`Organization with id ${organizationId} not found`);
    return;
  }

  if (!organization.stripe_customer_id) {
    console.warn('Missing stripeCustomerId');
    return;
  }

  const subscriptionsResponse = await stripeServer.subscriptions.list({
    customer: organization.stripe_customer_id
  });
  const subscriptions = subscriptionsResponse.data || [];
  const subscription = pickSubscription(subscriptions);

  if (subscription) {
    await stripeServer.subscriptions.update(subscription.id, {
      items: [
        {
          quantity: organization.memberships.length,
          id: subscription.items.data[0].id
        }
      ],
      billing_cycle_anchor: 'unchanged', // Keeps the current cycle
      proration_behavior: 'always_invoice' // Immediate invoice for changes
    });
  }
}

export async function deleteOrganizationFromStripe(
  stripeCustomerId: string
): Promise<void> {
  try {
    await stripeServer.customers.del(stripeCustomerId);
  } catch (error) {
    console.error('Error deleting stripe customer: ', error);
    throw error;
  }
}
