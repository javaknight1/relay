import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    if (!user.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 400 },
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${req.nextUrl.origin}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
