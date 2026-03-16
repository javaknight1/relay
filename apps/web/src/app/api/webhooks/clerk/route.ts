import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createServiceClient } from "@/lib/supabase";
import type { Database } from "@relay/shared";

type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserEvent {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
}

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  // Verify the webhook signature via Svix
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  const body = await req.text();

  let event: { type: string; data: ClerkUserEvent };
  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "user.created": {
      const { id, email_addresses, primary_email_address_id, first_name, last_name } = event.data;
      const primaryEmail = email_addresses.find(
        (e) => e.id === primary_email_address_id,
      );
      const name = [first_name, last_name].filter(Boolean).join(" ") || null;

      const row: UserInsert = {
        clerk_id: id,
        email: primaryEmail?.email_address ?? email_addresses[0].email_address,
        name,
        plan: "free",
      };
      const { error } = await supabase.from("users").insert(row as never);

      if (error) {
        console.error("Failed to insert user:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
      break;
    }

    case "user.updated": {
      const { id, email_addresses, primary_email_address_id, first_name, last_name } = event.data;
      const primaryEmail = email_addresses.find(
        (e) => e.id === primary_email_address_id,
      );
      const name = [first_name, last_name].filter(Boolean).join(" ") || null;

      const updates: UserUpdate = {
        email: primaryEmail?.email_address ?? email_addresses[0].email_address,
        name,
      };
      const { error } = await supabase
        .from("users")
        .update(updates as never)
        .eq("clerk_id", id);

      if (error) {
        console.error("Failed to update user:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
      break;
    }

    case "user.deleted": {
      const { id } = event.data;

      // Soft-delete: anonymize PII but keep the row for referential integrity
      const updates: UserUpdate = {
        email: `deleted-${id}@removed.relay.app`,
        name: null,
      };
      const { error } = await supabase
        .from("users")
        .update(updates as never)
        .eq("clerk_id", id);

      if (error) {
        console.error("Failed to soft-delete user:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
