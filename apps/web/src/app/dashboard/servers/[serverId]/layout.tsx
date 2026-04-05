import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { TEMPLATES } from "@/lib/templates";
import type { UserRow, ServerRow } from "@relay/shared";
import { ArrowLeft, Server, Circle, Clock } from "lucide-react";
import TabNav from "./TabNav";
import StatsPanel from "./StatsPanel";

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const STATUS_STYLES: Record<string, { dot: string; label: string }> = {
  running: { dot: "text-emerald-500", label: "Running" },
  deploying: { dot: "text-amber-500", label: "Deploying" },
  stopped: { dot: "text-gray-400", label: "Stopped" },
  error: { dot: "text-red-500", label: "Error" },
};

function getTemplateInfo(type: string) {
  const t = TEMPLATES.find((t) => t.id === type);
  return { icon: t?.icon ?? Server, label: t?.name ?? type };
}

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

export default async function ServerDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) notFound();

  const server = await getServer(serverId, clerkId);
  if (!server) notFound();

  const { icon: Icon, label: typeLabel } = getTemplateInfo(server.type);
  const status = STATUS_STYLES[server.status] ?? STATUS_STYLES.stopped;

  return (
    <>
      {/* Back link */}
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      {/* Server header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{server.name}</h1>
          <div className="mt-0.5 flex items-center gap-3 text-sm text-gray-500">
            <span>{typeLabel}</span>
            <span className="inline-flex items-center gap-1.5">
              <Circle className={`h-2 w-2 fill-current ${status.dot}`} />
              {status.label}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Last active {relativeTime(server.last_active_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <StatsPanel serverId={serverId} />

      {/* Tab navigation */}
      <TabNav serverId={serverId} />

      {/* Tab content */}
      {children}
    </>
  );
}
