import { redirect } from "next/navigation";

export default async function ServerDetailPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  redirect(`/dashboard/servers/${serverId}/connect`);
}
