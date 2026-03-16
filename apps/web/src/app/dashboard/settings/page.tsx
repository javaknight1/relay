import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import type { UserRow } from "@relay/shared";
import UserSettingsForm from "./UserSettingsForm";

export default async function SettingsPage() {
  const { userId: clerkId } = await auth();
  const clerkUser = await currentUser();

  let dbName: string | null = null;

  if (clerkId) {
    const supabase = createServiceClient();
    const { data: dbUser } = (await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", clerkId)
      .single()) as { data: UserRow | null };
    dbName = dbUser?.name ?? null;
  }

  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
  const displayName = dbName ?? clerkUser?.firstName ?? null;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">
          Manage your account and preferences.
        </p>
      </div>

      <UserSettingsForm userName={displayName} userEmail={email} />
    </>
  );
}
