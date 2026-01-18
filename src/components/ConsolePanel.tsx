"use client";

import { useEffect, useRef } from "react";
import type { ConsoleEntry, ExecutionResult } from "@/hooks/useCodeExecution";

interface ConsolePanelProps {
  logs: ConsoleEntry[];
  error?: string;
  isRunning: boolean;
  result: ExecutionResult | null;
  onClear: () => void;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (arg === null) return "null";
      if (arg === undefined) return "undefined";
      if (typeof arg === "object") {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(" ");
}

const typeStyles: Record<ConsoleEntry["type"], string> = {
  log: "text-gray-300",
  info: "text-blue-400",
  warn: "text-yellow-400",
  error: "text-red-400",
};

const typeLabels: Record<ConsoleEntry["type"], string> = {
  log: "",
  info: "ℹ ",
  warn: "⚠ ",
  error: "✕ ",
};

export function ConsolePanel({
  logs,
  error,
  isRunning,
  result,
  onClear,
}: ConsolePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, error]);

  const hasContent = logs.length > 0 || error;

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Console
        </span>
        <button
          onClick={onClear}
          disabled={!hasContent}
          className="text-xs text-gray-500 transition-colors hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm"
      >
        {result === null && !isRunning && logs.length === 0 && (
          <div className="text-gray-500">
            Click &quot;Run Code&quot; to execute
          </div>
        )}
        {isRunning && <div className="text-gray-400">Executing...</div>}
        {logs.length > 0 && (
          <div className="space-y-1">
            {logs.map((entry, i) => (
              <div key={i} className={`flex gap-2 ${typeStyles[entry.type]}`}>
                <span className="shrink-0 text-gray-600">
                  {formatTimestamp(entry.timestamp)}
                </span>
                <span className="shrink-0">{typeLabels[entry.type]}</span>
                <span className="whitespace-pre-wrap break-all">
                  {formatArgs(entry.args)}
                </span>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="mt-2 flex gap-2 text-red-400">
            <span className="shrink-0">✕</span>
            <span>Error: {error}</span>
          </div>
        )}
        {result?.success && logs.length === 0 && !error && (
          <div className="text-gray-500">(No output)</div>
        )}
      </div>
    </div>
  );
}
