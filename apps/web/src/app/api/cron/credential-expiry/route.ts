import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendCredentialExpiryWarning } from "@/lib/email";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();
  const sevenDaysFromNow = new Date(
    now.getTime() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: expiringServers, error } = await supabase
    .from("servers")
    .select("id, user_id, name, type, credential_expires_at")
    .is("deleted_at", null)
    .lte("credential_expires_at", sevenDaysFromNow)
    .order("credential_expires_at", { ascending: true });

  if (error) {
    console.error("Credential expiry cron failed:", error);
    return NextResponse.json(
      { error: "Failed to query servers" },
      { status: 500 },
    );
  }

  const servers = (expiringServers ?? []) as Array<{
    id: string;
    user_id: string;
    name: string;
    type: string;
    credential_expires_at: string;
  }>;

  for (const server of servers) {
    const expiresAt = new Date(server.credential_expires_at);
    const daysRemaining = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    console.log(
      `[credential-expiry] Server "${server.name}" (${server.id}) — ` +
        `${daysRemaining <= 0 ? "EXPIRED" : `expires in ${daysRemaining} day(s)`}`,
    );

    // Look up the user's email and send a credential expiry warning
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("clerk_id", server.user_id)
      .single();

    const userEmail = (user as { email: string } | null)?.email;
    if (userEmail) {
      try {
        await sendCredentialExpiryWarning(
          userEmail,
          server.name,
          daysRemaining,
          server.credential_expires_at,
        );
      } catch (err) {
        console.error(
          `[credential-expiry] Failed to send email for server "${server.name}":`,
          err,
        );
      }
    }
  }

  return NextResponse.json({
    checked: servers.length,
    servers: servers.map((s) => ({
      id: s.id,
      name: s.name,
      credential_expires_at: s.credential_expires_at,
    })),
  });
}
