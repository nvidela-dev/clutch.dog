/// <reference lib="webworker" />

export interface ConsoleEntry {
  type: "log" | "error" | "warn" | "info";
  args: unknown[];
  timestamp: number;
}

export interface ExecutionResult {
  success: boolean;
  logs: ConsoleEntry[];
  error?: string;
  returnValue?: unknown;
}

export interface ExecutionMessage {
  code: string;
}

const logs: ConsoleEntry[] = [];

function createConsoleMock() {
  const methods = ["log", "error", "warn", "info"] as const;

  const mock: Record<string, (...args: unknown[]) => void> = {};

  for (const method of methods) {
    mock[method] = (...args: unknown[]) => {
      logs.push({
        type: method,
        args: args.map(serializeArg),
        timestamp: Date.now(),
      });
    };
  }

  return mock as Pick<Console, "log" | "error" | "warn" | "info">;
}

function serializeArg(arg: unknown): unknown {
  if (arg === undefined) return "undefined";
  if (arg === null) return null;
  if (typeof arg === "function") return `[Function: ${arg.name || "anonymous"}]`;
  if (typeof arg === "symbol") return arg.toString();
  if (arg instanceof Error) return { name: arg.name, message: arg.message };

  try {
    // Test if it's serializable
    JSON.stringify(arg);
    return arg;
  } catch {
    return String(arg);
  }
}

self.onmessage = (event: MessageEvent<ExecutionMessage>) => {
  const { code } = event.data;

  // Clear previous logs
  logs.length = 0;

  const consoleMock = createConsoleMock();

  try {
    // Create a function with console methods in scope
    const fn = new Function(
      "console",
      `"use strict";
${code}
`
    );

    const returnValue = fn(consoleMock);

    const result: ExecutionResult = {
      success: true,
      logs: [...logs],
      returnValue: serializeArg(returnValue),
    };

    self.postMessage(result);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);

    const result: ExecutionResult = {
      success: false,
      logs: [...logs],
      error,
    };

    self.postMessage(result);
  }
};

export {};
