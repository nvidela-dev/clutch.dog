"use client";

import { useState, useCallback, useRef } from "react";
import { buildTestScript, parseTestResults } from "@/lib/testRunner";
import type { TestRunResult } from "@/lib/testRunner";

interface UseTestRunnerOptions {
  timeout?: number;
}

interface UseTestRunnerReturn {
  runTests: (userCode: string, testCode: string) => void;
  isRunning: boolean;
  result: TestRunResult | null;
  clear: () => void;
}

export function useTestRunner(
  options: UseTestRunnerOptions = {}
): UseTestRunnerReturn {
  const { timeout = 5000 } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<TestRunResult | null>(null);

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

  const runTests = useCallback(
    (userCode: string, testCode: string) => {
      cleanup();

      setIsRunning(true);
      setResult(null);

      const combinedCode = buildTestScript(userCode, testCode);

      const worker = new Worker(
        new URL("@/workers/codeRunner.worker.ts", import.meta.url)
      );
      workerRef.current = worker;

      worker.onmessage = (event) => {
        cleanup();
        const testResult = parseTestResults(event.data);
        setResult(testResult);
        setIsRunning(false);
      };

      worker.onerror = (error) => {
        cleanup();
        setResult({
          success: false,
          tests: [],
          error: error.message || "Worker error occurred",
        });
        setIsRunning(false);
      };

      timeoutRef.current = setTimeout(() => {
        cleanup();
        setResult({
          success: false,
          tests: [],
          error: `Tests timed out after ${timeout}ms`,
        });
        setIsRunning(false);
      }, timeout);

      worker.postMessage({ code: combinedCode });
    },
    [cleanup, timeout]
  );

  const clear = useCallback(() => {
    setResult(null);
  }, []);

  return { runTests, isRunning, result, clear };
}
