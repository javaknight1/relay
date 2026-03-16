import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TemplateCatalog from "./TemplateCatalog";

export default function NewServerPage() {
  return (
    <>
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add a Server</h1>
        <p className="mt-1 text-gray-600">
          Choose a template to get started. Each template connects to a
          different service.
        </p>
      </div>

      <TemplateCatalog />
    </>
  );
}
