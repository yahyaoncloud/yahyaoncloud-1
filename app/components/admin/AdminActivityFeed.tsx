import React from "react";
import { Globe, Smartphone, Monitor, Clock, Activity } from "lucide-react";
import { cn } from "~/lib/utils";

export interface ActivityVisit {
  id: string;
  path: string;
  device?: string | null;
  country?: string | null;
  createdAt: string | Date;
}

export interface AdminActivityFeedProps {
  visits: ActivityVisit[];
  emptyMessage?: string;
  className?: string;
}

function formatRelativeTime(dateInput: string | Date): string {
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 60) return "just now";
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return "recent";
  }
}

function getDeviceIcon(deviceStr?: string | null) {
  const lower = (deviceStr || "").toLowerCase();
  if (lower.includes("mobile") || lower.includes("phone") || lower.includes("iphone") || lower.includes("android")) {
    return <Smartphone className="h-3.5 w-3.5 text-zinc-400" />;
  }
  return <Monitor className="h-3.5 w-3.5 text-zinc-400" />;
}

export function AdminActivityFeed({
  visits,
  emptyMessage = "No recent activity recorded yet.",
  className,
}: AdminActivityFeedProps) {
  if (!visits || visits.length === 0) {
    return (
      <div className={cn("text-center py-8 text-zinc-500 text-sm", className)}>
        <Activity className="h-8 w-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("divide-y divide-zinc-100 dark:divide-zinc-800/70", className)}>
      {visits.map((visit) => (
        <div
          key={visit.id}
          className="flex items-center justify-between py-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 px-2 rounded-lg transition-colors"
        >
          <div className="space-y-1 min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {visit.path}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1">
                {getDeviceIcon(visit.device)}
                <span>{visit.device || "Browser"}</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3 w-3 text-zinc-400" />
                <span>{visit.country || "Global"}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 shrink-0 font-mono">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(visit.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
