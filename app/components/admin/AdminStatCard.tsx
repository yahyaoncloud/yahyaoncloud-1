import React from "react";
import { Link } from "@remix-run/react";
import type { IconType as LucideIcon } from "react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  iconClassName?: string;
  href?: string;
  className?: string;
}

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  iconClassName,
  href,
  className,
}: AdminStatCardProps) {
  const content = (
    <Card
      className={cn(
        "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-200",
        href && "hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm cursor-pointer",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {title}
        </CardTitle>
        <div
          className={cn(
            "p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300",
            iconClassName
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {value}
        </div>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend.isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                {trend.value}
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link to={href} className="block focus:outline-hidden">
        {content}
      </Link>
    );
  }

  return content;
}
