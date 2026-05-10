import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
})

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
