import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}

export const FREE_DOWNLOAD_LIMIT = 5;
export const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID!;
export const TEAM_PRICE_ID = process.env.STRIPE_TEAM_PRICE_ID!;

export function planFromPriceId(priceId: string): "pro" | "team" {
  if (priceId === TEAM_PRICE_ID) return "team";
  return "pro";
}

export async function getOrCreateCustomer(
  userId: string,
  email: string
): Promise<string> {
  const { createServiceClient } = await import("@/lib/supabase/server");
  const supabase = await createServiceClient();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (sub?.stripe_customer_id) return sub.stripe_customer_id;

  const customer = await getStripe().customers.create({
    email,
    metadata: { user_id: userId },
  });

  await supabase.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customer.id,
    plan: "free",
    status: "active",
  });

  return customer.id;
}
