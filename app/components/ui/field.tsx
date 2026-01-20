import React from "react";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";

export function Field({
  label,
  type = "text",
  className = "",
  value,
  onChange,
  ...props
}: {
  label?: string;
  type?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  [key: string]: any;
}) {
  const Component = type === "textarea" ? Textarea : Input;

  return (
    <div>
      {label && <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">{label}</Label>}
      <Component
        type={type !== "textarea" ? type : undefined}
        className={`bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-400 focus:ring-zinc-900 dark:focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 ${className}`}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}
