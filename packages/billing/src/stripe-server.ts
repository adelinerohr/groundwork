import Stripe from 'stripe';

import { keys } from '../keys';

export const stripeServer = Object.freeze(
  new Stripe(keys().BILLING_STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2025-03-31.basil'
  })
);
