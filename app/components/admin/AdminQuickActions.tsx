import React from "react";
import { Link } from "@remix-run/react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "~/lib/utils";

export interface QuickActionItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  external?: boolean;
}

export interface AdminQuickActionsProps {
  items: QuickActionItem[];
  className?: string;
}

export function AdminQuickActions({ items, className }: AdminQuickActionsProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const inner = (
          <div className="group flex items-start gap-3.5 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all duration-200">
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
              <Icon className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                  {item.title}
                </span>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {item.description}
              </p>
            </div>

            <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0 self-center" />
          </div>
        );

        if (item.external) {
          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="block focus:outline-hidden"
            >
              {inner}
            </a>
          );
        }

        return (
          <Link key={item.href} to={item.href} className="block focus:outline-hidden">
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
