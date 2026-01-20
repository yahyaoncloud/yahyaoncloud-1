import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merges class names with Tailwind CSS support
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Truncates a string to a specified length and adds an ellipsis
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

// Formats a date to a readable string
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
