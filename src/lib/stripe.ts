import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const FREE_DOWNLOAD_LIMIT = 3;
export const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID!;

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

  const customer = await stripe.customers.create({
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
