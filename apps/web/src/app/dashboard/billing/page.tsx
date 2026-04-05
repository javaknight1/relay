import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { BILLING } from "@relay/shared";
import type { UserRow, ServerRow } from "@relay/shared";
import { TEMPLATES } from "@/lib/templates";
import { CreditCard, Server } from "lucide-react";
import { ManageSubscriptionButton } from "./manage-subscription-button";

async function getBillingData(clerkId: string) {
  const supabase = createServiceClient();

  const { data: dbUser } = (await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single()) as { data: UserRow | null };

  if (!dbUser) return { servers: [], user: null };

  const { data: servers } = (await supabase
    .from("servers")
    .select("*")
    .eq("user_id", dbUser.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })) as {
    data: ServerRow[] | null;
  };

  return { servers: servers ?? [], user: dbUser };
}

function getTemplateName(type: string) {
  return TEMPLATES.find((t) => t.id === type)?.name ?? type;
}

export default async function BillingPage() {
  const { userId: clerkId } = await auth();
  const { servers, user } = clerkId
    ? await getBillingData(clerkId)
    : { servers: [], user: null };

  const pricePerServer = BILLING.pricePerServerCents / 100;
  const totalMonthlyCents = servers.length * BILLING.pricePerServerCents;
  const hasSubscription = !!user?.stripe_subscription_id;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-gray-600">
          Manage your subscription and view usage.
        </p>
      </div>

      {/* Current plan summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <CreditCard className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Current Plan
            </h2>
            <p className="text-xs text-gray-500">
              ${pricePerServer}/server/month — pay only for what you use
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs font-medium text-gray-500">Active Servers</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {servers.length}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs font-medium text-gray-500">Per Server</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              ${pricePerServer}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs font-medium text-gray-500">Monthly Total</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              ${(totalMonthlyCents / 100).toFixed(0)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          {hasSubscription ? (
            <ManageSubscriptionButton />
          ) : (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
            >
              View Pricing
            </Link>
          )}
        </div>
      </div>

      {/* Server breakdown */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">
          Server Breakdown
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Each active server costs ${pricePerServer}/month.
        </p>

        {servers.length === 0 ? (
          <div className="mt-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Server className="h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-3 text-sm text-gray-500">
              No active servers. Create one to get started.
            </p>
            <Link
              href="/dashboard/servers/new"
              className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Add a server
            </Link>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-gray-100">
            {servers.map((server) => (
              <div
                key={server.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <Link
                    href={`/dashboard/servers/${server.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-brand-600"
                  >
                    {server.name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {getTemplateName(server.type)}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  ${pricePerServer}/mo
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between pt-3">
              <span className="text-sm font-semibold text-gray-900">
                Total
              </span>
              <span className="text-sm font-semibold text-gray-900">
                ${(totalMonthlyCents / 100).toFixed(0)}/mo
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
