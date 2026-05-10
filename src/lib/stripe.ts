import Stripe from "stripe"

const stripeKey = process.env.STRIPE_SECRET_KEY

export const stripe = stripeKey 
  ? new Stripe(stripeKey, {
      apiVersion: "2026-04-22.dahlia" as any, // Using as any to bypass specific version typing if needed
      typescript: true,
    })
  : null

export const PLANS = {
  alpha: {
    name: "Alpha Tier",
    priceId: process.env.STRIPE_ALPHA_PRICE_ID,
    price: 0,
  },
  pro: {
    name: "Pro Tier",
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    price: 29,
  },
  fleet: {
    name: "Fleet Tier",
    priceId: process.env.STRIPE_FLEET_PRICE_ID,
    price: 99,
  },
}
