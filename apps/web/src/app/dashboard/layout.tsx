import { currentUser } from "@clerk/nextjs/server";
import Sidebar from "./Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        userName={user?.firstName ?? null}
        userEmail={user?.emailAddresses?.[0]?.emailAddress ?? null}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
