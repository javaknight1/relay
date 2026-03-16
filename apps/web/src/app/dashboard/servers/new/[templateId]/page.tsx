import Link from "next/link";
import { notFound } from "next/navigation";
import { TEMPLATES } from "@/lib/templates";
import { ArrowLeft } from "lucide-react";
import CredentialForm from "./CredentialForm";

export default async function CredentialFormPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const template = TEMPLATES.find((t) => t.id === templateId);

  if (!template || template.comingSoon) notFound();

  return (
    <>
      <Link
        href="/dashboard/servers/new"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to templates
      </Link>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
          <template.icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            New {template.name} Server
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {template.description}
          </p>
        </div>
      </div>

      <CredentialForm templateId={template.id} />
    </>
  );
}
