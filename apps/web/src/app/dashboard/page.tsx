import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName ?? "there"}
          </p>
        </div>
        <UserButton />
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-12">
        <div className="text-center">
          <p className="text-lg text-gray-500">No servers yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Create your first MCP server to get started
          </p>
        </div>
      </div>
    </main>
  );
}
