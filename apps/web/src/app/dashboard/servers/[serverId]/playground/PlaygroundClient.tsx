"use client";

import { useState, useCallback } from "react";
import type { ToolInfo } from "@/lib/templates";
import {
  Play,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Trash2,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────

interface HistoryEntry {
  id: string;
  toolName: string;
  request: object;
  response: object | null;
  status: "success" | "error";
  durationMs: number;
  timestamp: Date;
}

// ── Component ───────────────────────────────────────────────

export default function PlaygroundClient({
  serverId,
  serverStatus,
  tools,
}: {
  serverId: string;
  serverStatus: string;
  tools: ToolInfo[];
}) {
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [argsJson, setArgsJson] = useState<string>("{}");
  const [executing, setExecuting] = useState(false);
  const [lastRequest, setLastRequest] = useState<object | null>(null);
  const [lastResponse, setLastResponse] = useState<object | null>(null);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  const [lastStatus, setLastStatus] = useState<"success" | "error" | null>(
    null,
  );
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const currentTool = tools.find((t) => t.name === selectedTool) ?? null;
  const isServerLive = serverStatus === "running";

  const handleToolChange = useCallback(
    (toolName: string) => {
      setSelectedTool(toolName);
      setArgsJson("{}");
      setJsonError(null);
    },
    [],
  );

  const handleExecute = useCallback(async () => {
    if (!selectedTool) return;

    // Validate JSON
    let parsedArgs: Record<string, unknown>;
    try {
      parsedArgs = JSON.parse(argsJson) as Record<string, unknown>;
    } catch {
      setJsonError("Invalid JSON. Please check your input.");
      return;
    }
    setJsonError(null);

    const jsonRpcRequest = {
      jsonrpc: "2.0" as const,
      id: Date.now(),
      method: "tools/call",
      params: {
        name: selectedTool,
        arguments: parsedArgs,
      },
    };

    setLastRequest(jsonRpcRequest);
    setLastResponse(null);
    setLastDuration(null);
    setLastStatus(null);
    setExecuting(true);

    const startTime = performance.now();

    try {
      const res = await fetch(`/api/servers/${serverId}/playground`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: selectedTool,
          arguments: parsedArgs,
        }),
      });

      const elapsed = Math.round(performance.now() - startTime);
      const data = (await res.json()) as object;

      const status = res.ok ? "success" : "error";

      setLastResponse(data);
      setLastDuration(elapsed);
      setLastStatus(status as "success" | "error");

      // Add to history
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        toolName: selectedTool,
        request: jsonRpcRequest,
        response: data,
        status: status as "success" | "error",
        durationMs: elapsed,
        timestamp: new Date(),
      };
      setHistory((prev) => [entry, ...prev].slice(0, 50));
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      const errorResponse = {
        error: err instanceof Error ? err.message : "Network error",
      };

      setLastResponse(errorResponse);
      setLastDuration(elapsed);
      setLastStatus("error");

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        toolName: selectedTool,
        request: jsonRpcRequest,
        response: errorResponse,
        status: "error",
        durationMs: elapsed,
        timestamp: new Date(),
      };
      setHistory((prev) => [entry, ...prev].slice(0, 50));
    } finally {
      setExecuting(false);
    }
  }, [selectedTool, argsJson, serverId]);

  const handleHistoryClick = useCallback((entry: HistoryEntry) => {
    setSelectedTool(entry.toolName);
    const params = (entry.request as { params?: { arguments?: unknown } })
      ?.params?.arguments;
    setArgsJson(JSON.stringify(params ?? {}, null, 2));
    setLastRequest(entry.request);
    setLastResponse(entry.response);
    setLastDuration(entry.durationMs);
    setLastStatus(entry.status);
    setJsonError(null);
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Server status warning */}
      {!isServerLive && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            Server is not running. Tool calls may fail until the server is live.
          </p>
        </div>
      )}

      {/* Main playground area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: Tool selection + arguments */}
        <div className="space-y-4">
          {/* Tool picker */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">
              Select Tool
            </h2>
            <div className="relative mt-2">
              <select
                value={selectedTool}
                onChange={(e) => handleToolChange(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Choose a tool...</option>
                {tools.map((tool) => (
                  <option key={tool.name} value={tool.name}>
                    {tool.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Tool description */}
            {currentTool && (
              <p className="mt-2 text-xs text-gray-500">
                {currentTool.description}
              </p>
            )}
          </div>

          {/* Argument editor */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Arguments (JSON)
              </h2>
              {jsonError && (
                <span className="text-xs text-red-600">{jsonError}</span>
              )}
            </div>
            <textarea
              value={argsJson}
              onChange={(e) => {
                setArgsJson(e.target.value);
                setJsonError(null);
              }}
              rows={8}
              spellCheck={false}
              className={`mt-2 w-full rounded-lg border px-3 py-2 font-mono text-sm text-gray-900 focus:outline-none focus:ring-1 ${
                jsonError
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-brand-500 focus:ring-brand-500"
              }`}
              placeholder='{ "key": "value" }'
            />

            {/* Execute button */}
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={handleExecute}
                disabled={!selectedTool || executing}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
              >
                {executing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Execute
                  </>
                )}
              </button>

              {/* Status display */}
              {lastStatus && lastDuration !== null && (
                <div className="flex items-center gap-2 text-sm">
                  {lastStatus === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={
                      lastStatus === "success"
                        ? "text-emerald-700"
                        : "text-red-700"
                    }
                  >
                    {lastStatus === "success" ? "Success" : "Error"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-gray-500">
                    <Clock className="h-3 w-3" />
                    {lastDuration}ms
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Request + Response panels */}
        <div className="space-y-4">
          {/* Request panel */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">
              Request (JSON-RPC)
            </h2>
            <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-gray-50 p-3 font-mono text-xs text-gray-700">
              {lastRequest
                ? JSON.stringify(lastRequest, null, 2)
                : "// Execute a tool call to see the request"}
            </pre>
          </div>

          {/* Response panel */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Response</h2>
              {lastStatus && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                    lastStatus === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {lastStatus === "success" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {lastStatus === "success" ? "200 OK" : "Error"}
                </span>
              )}
            </div>
            <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-gray-50 p-3 font-mono text-xs text-gray-700">
              {executing
                ? "// Waiting for response..."
                : lastResponse
                  ? JSON.stringify(lastResponse, null, 2)
                  : "// Response will appear here"}
            </pre>
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              History ({history.length})
            </h2>
            <button
              type="button"
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          </div>
          <div className="mt-3 divide-y divide-gray-100">
            {history.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => handleHistoryClick(entry)}
                className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-gray-50"
              >
                {entry.status === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                )}
                <code className="min-w-0 truncate rounded bg-gray-50 px-1.5 py-0.5 font-mono text-xs text-gray-800">
                  {entry.toolName}
                </code>
                <span className="ml-auto shrink-0 text-xs text-gray-400">
                  {entry.durationMs}ms
                </span>
                <span className="shrink-0 text-xs text-gray-400">
                  {entry.timestamp.toLocaleTimeString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no tools */}
      {tools.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-8 py-16 text-center">
          <h2 className="text-sm font-semibold text-gray-900">
            No tools available
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            This server template does not define any tools yet.
          </p>
        </div>
      )}
    </div>
  );
}
