import React from "react";
import { Link } from "@remix-run/react";
import type { IconType as LucideIcon } from "react-icons";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { LuArrowUpRight as ArrowUpRight, LuLoaderCircle as Loader2 } from "react-icons/lu";
import { cn } from "~/lib/utils";

export interface AdminSectionToggleCardProps {
  title: string;
  sectionKey: string;
  description: string;
  icon: LucideIcon;
  isVisible: boolean;
  itemCount?: number;
  itemLabel?: string;
  manageHref?: string;
  isPending?: boolean;
  onToggle: (key: string, nextValue: boolean) => void;
  className?: string;
}

export function AdminSectionToggleCard({
  title,
  sectionKey,
  description,
  icon: Icon,
  isVisible,
  itemCount,
  itemLabel,
  manageHref,
  isPending = false,
  onToggle,
  className,
}: AdminSectionToggleCardProps) {
  const switchId = `toggle-${sectionKey}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border p-4 sm:p-5 transition-all duration-200",
        isVisible
          ? "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700"
          : "border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/40 opacity-80 hover:opacity-100",
        className
      )}
    >
      <div className="space-y-3">
        {/* Header row: Icon, Title, Status badge & Switch */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "p-2.5 rounded-lg transition-colors shrink-0",
                isVisible
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Label
                  htmlFor={switchId}
                  className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 cursor-pointer select-none"
                >
                  {title}
                </Label>
                <span
                  className={cn(
                    "text-[10px] font-mono font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1",
                    isVisible
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isVisible ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                    )}
                  />
                  {isVisible ? "Active on Homepage" : "Hidden"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-0.5">
            {isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
            )}
            <Switch
              id={switchId}
              checked={isVisible}
              disabled={isPending}
              onCheckedChange={(checked) => onToggle(sectionKey, checked)}
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Footer row: Items Count & Direct Manage Link */}
      {(itemCount !== undefined || manageHref) && (
        <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
          {itemCount !== undefined ? (
            <span className="font-mono text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {itemCount}
              </span>{" "}
              {itemLabel || (itemCount === 1 ? "item" : "items")}
            </span>
          ) : (
            <span />
          )}

          {manageHref && (
            <Link
              to={manageHref}
              className="inline-flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
            >
              <span>Manage</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
