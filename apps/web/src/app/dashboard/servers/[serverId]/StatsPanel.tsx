"use client";

import { useEffect, useState } from "react";
import { BarChart3, Clock, AlertTriangle, Zap } from "lucide-react";

interface Stats {
  totalCalls: number;
  successCount: number;
  errorCount: number;
  avgLatency: number;
  errorRate: number;
  callsToday: number;
  callsByDay: Record<string, number>;
}

export default function StatsPanel({ serverId }: { serverId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch(`/api/servers/${serverId}/stats`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        if (!cancelled) {
          setStats(data);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [serverId]);

  if (loading) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="h-4 w-20 rounded bg-gray-100" />
            <div className="mt-3 h-7 w-16 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  const cards = [
    {
      label: "Total Calls (7d)",
      value: stats.totalCalls.toLocaleString(),
      icon: BarChart3,
      iconColor: "text-blue-500",
    },
    {
      label: "Avg Latency",
      value: `${stats.avgLatency}ms`,
      icon: Clock,
      iconColor: "text-amber-500",
    },
    {
      label: "Error Rate",
      value: `${stats.errorRate}%`,
      icon: AlertTriangle,
      iconColor: stats.errorRate > 5 ? "text-red-500" : "text-emerald-500",
    },
    {
      label: "Calls Today",
      value: stats.callsToday.toLocaleString(),
      icon: Zap,
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${card.iconColor}`} />
              <span className="text-xs font-medium text-gray-500">
                {card.label}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
