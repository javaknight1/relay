import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome back, {user?.firstName ?? "there"}
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white p-12">
        <div className="text-center">
          <p className="text-lg text-gray-500">No servers yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Create your first MCP server to get started
          </p>
        </div>
      </div>
    </>
  );
}
