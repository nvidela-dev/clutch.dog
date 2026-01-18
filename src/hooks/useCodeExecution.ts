"use client";

import { useState, useCallback, useRef } from "react";
import type { ExecutionResult } from "@/workers/codeRunner.worker";

export type { ExecutionResult };
export type { ConsoleEntry } from "@/workers/codeRunner.worker";

interface UseCodeExecutionOptions {
  timeout?: number;
}

interface UseCodeExecutionReturn {
  execute: (code: string) => void;
  isRunning: boolean;
  result: ExecutionResult | null;
}

export function useCodeExecution(
  options: UseCodeExecutionOptions = {}
): UseCodeExecutionReturn {
  const { timeout = 2000 } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const execute = useCallback(
    (code: string) => {
      // Clean up any previous execution
      cleanup();

      setIsRunning(true);
      setResult(null);

      // Create a new worker for each execution
      const worker = new Worker(
        new URL("@/workers/codeRunner.worker.ts", import.meta.url)
      );
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent<ExecutionResult>) => {
        cleanup();
        setResult(event.data);
        setIsRunning(false);
      };

      worker.onerror = (error) => {
        cleanup();
        setResult({
          success: false,
          logs: [],
          error: error.message || "Worker error occurred",
        });
        setIsRunning(false);
      };

      // Set up timeout
      timeoutRef.current = setTimeout(() => {
        cleanup();
        setResult({
          success: false,
          logs: [],
          error: `Execution timed out after ${timeout}ms`,
        });
        setIsRunning(false);
      }, timeout);

      // Send code to worker
      worker.postMessage({ code });
    },
    [cleanup, timeout]
  );

  return { execute, isRunning, result };
}
