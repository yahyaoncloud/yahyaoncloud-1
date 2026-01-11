import React from "react";
import { Label } from "./label";

export function MultiSelect({
  label,
  name,
  options,
  selectedValues,
  onSelectionChange
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onSelectionChange: (value: string) => void;
}) {
  return (
    <div>
      <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">{label}</Label>
      <div className="space-y-2 max-h-32 overflow-y-auto border border-zinc-300 dark:border-zinc-600 rounded-md p-2 bg-white dark:bg-zinc-800">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={selectedValues.includes(opt.value)}
              onChange={() => onSelectionChange(opt.value)}
              className="rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100"
            />
            <span className="text-zinc-900 dark:text-zinc-100">{opt.label}</span>
          </label>
        ))}
      </div>
      {selectedValues.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedValues.map((value) => {
            const option = options.find(opt => opt.value === value);
            return option ? (
              <span
                key={value}
                className="inline-flex items-center px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded"
              >
                {option.label}
                <button
                  type="button"
                  onClick={() => onSelectionChange(value)}
                  className="ml-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  ×
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
