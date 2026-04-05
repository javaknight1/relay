import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import type { UserRow, ServerRow } from "@relay/shared";
import { TEMPLATES } from "@/lib/templates";
import type { ToolInfo } from "@/lib/templates";
import PlaygroundClient from "./PlaygroundClient";

async function getServer(
  serverId: string,
  clerkId: string,
): Promise<ServerRow | null> {
  const supabase = createServiceClient();

  const { data: dbUser } = (await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single()) as { data: UserRow | null };
  if (!dbUser) return null;

  const { data: server } = (await supabase
    .from("servers")
    .select("*")
    .eq("id", serverId)
    .eq("user_id", dbUser.id)
    .is("deleted_at", null)
    .single()) as { data: ServerRow | null };

  return server;
}

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) notFound();

  const server = await getServer(serverId, clerkId);
  if (!server) notFound();

  const template = TEMPLATES.find((t) => t.id === server.type);
  const tools: ToolInfo[] = template?.tools ?? [];

  return (
    <PlaygroundClient
      serverId={server.id}
      serverStatus={server.status}
      tools={tools}
    />
  );
}
