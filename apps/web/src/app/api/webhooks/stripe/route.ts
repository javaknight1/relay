import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription && session.customer) {
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer.id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;

        await supabase
          .from("users")
          .update({ stripe_subscription_id: subscriptionId } as never)
          .eq("stripe_customer_id", customerId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      // Sync is handled -- quantity updates are managed by our API
      console.log(
        `Subscription ${subscription.id} updated, status: ${subscription.status}`,
      );
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      // Clear subscription ID
      await supabase
        .from("users")
        .update({ stripe_subscription_id: null } as never)
        .eq("stripe_customer_id", customerId);

      // Stop all user's servers
      const { data: userData } = (await supabase
        .from("users")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single()) as { data: { id: string } | null };

      if (userData) {
        await supabase
          .from("servers")
          .update({ status: "stopped" } as never)
          .eq("user_id", userData.id)
          .is("deleted_at", null);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`Payment failed for invoice ${invoice.id}`);
      // TODO: Send payment failure email when Resend is integrated
      break;
    }
  }

  return NextResponse.json({ received: true });
}
