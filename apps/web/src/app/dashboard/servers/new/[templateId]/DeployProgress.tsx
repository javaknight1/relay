"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TEMPLATES } from "@/lib/templates";
import { Loader2, CheckCircle2, XCircle, Circle } from "lucide-react";

const DEPLOY_STEPS = [
  "Encrypting credentials",
  "Storing to secure vault",
  "Generating endpoint URL",
  "Writing to routing table",
  "Starting server",
  "Verifying MCP handshake",
];

const STEP_DELAY_MS = 500;

export interface DeployPayload {
  name: string;
  type: string;
  credentials: Record<string, string>;
  enabledTools: string[];
}

export default function DeployProgress({
  templateId,
  payload,
  onRetry,
}: {
  templateId: string;
  payload: DeployPayload;
  onRetry: () => void;
}) {
  const template = TEMPLATES.find((t) => t.id === templateId)!;
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const serverIdRef = useRef<string | null>(null);
  const apiResult = useRef<{
    ok: boolean;
    id?: string;
    error?: string;
  } | null>(null);

  // Fire API call + animate steps
  useEffect(() => {
    let cancelled = false;

    // Start the API call
    (async () => {
      try {
        const res = await fetch("/api/servers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          apiResult.current = { ok: true, id: data.id };
          serverIdRef.current = data.id;
        } else {
          apiResult.current = {
            ok: false,
            error: data.error ?? "Deployment failed",
          };
        }
      } catch {
        apiResult.current = {
          ok: false,
          error: "Network error. Please try again.",
        };
      }
    })();

    // Animate steps on an interval, in parallel with the API call
    const timer = setInterval(() => {
      if (cancelled) return;

      // Check for API error — stop at current step
      if (apiResult.current && !apiResult.current.ok) {
        setError(apiResult.current.error!);
        clearInterval(timer);
        return;
      }

      setCurrentStep((prev) => {
        // All steps done
        if (prev >= DEPLOY_STEPS.length) {
          clearInterval(timer);
          return prev;
        }
        // At last step — only finish if API completed successfully
        if (prev === DEPLOY_STEPS.length - 1) {
          if (apiResult.current?.ok) {
            clearInterval(timer);
            return DEPLOY_STEPS.length;
          }
          return prev; // keep spinning
        }
        return prev + 1;
      });
    }, STEP_DELAY_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate to server detail page on completion
  const allComplete = currentStep >= DEPLOY_STEPS.length;

  useEffect(() => {
    if (allComplete && serverIdRef.current) {
      const timer = setTimeout(() => {
        router.push(`/dashboard/servers/${serverIdRef.current}`);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [allComplete, router]);

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <h2 className="text-lg font-semibold text-gray-900">
          {allComplete
            ? `${template.name} server is live!`
            : `Deploying your ${template.name} server\u2026`}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {allComplete
            ? "Redirecting to your server\u2026"
            : "This usually takes a few seconds."}
        </p>

        <div className="mt-6 space-y-3">
          {DEPLOY_STEPS.map((step, i) => {
            let status: "pending" | "active" | "complete" | "error" = "pending";
            if (i < currentStep) status = "complete";
            else if (i === currentStep && error) status = "error";
            else if (i === currentStep) status = "active";

            return (
              <div key={step} className="flex items-center gap-3">
                {status === "complete" && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                )}
                {status === "active" && (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand-500" />
                )}
                {status === "error" && (
                  <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                )}
                {status === "pending" && (
                  <Circle className="h-5 w-5 shrink-0 text-gray-300" />
                )}
                <span
                  className={
                    status === "complete"
                      ? "text-sm text-emerald-700"
                      : status === "active"
                        ? "text-sm font-medium text-gray-900"
                        : status === "error"
                          ? "text-sm font-medium text-red-700"
                          : "text-sm text-gray-400"
                  }
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-6">
            <div className="rounded-lg bg-red-50 px-3 py-2.5">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
