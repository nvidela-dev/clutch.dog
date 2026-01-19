"use client";

import type { TestRunResult } from "@/lib/testRunner";

interface TestResultsProps {
  result: TestRunResult | null;
  isRunning: boolean;
}

export function TestResults({ result, isRunning }: TestResultsProps) {
  if (isRunning) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-gray-300" />
          <span>Running tests...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Click &quot;Run Tests&quot; to execute
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2 text-red-400">
          <span className="text-lg">✕</span>
          <span className="font-semibold">Error</span>
        </div>
        <div className="rounded bg-red-950/50 p-3 font-mono text-sm text-red-300">
          {result.error}
        </div>
      </div>
    );
  }

  const passedCount = result.tests.filter((t) => t.passed).length;
  const totalCount = result.tests.length;
  const allPassed = passedCount === totalCount;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={allPassed ? "text-green-400" : "text-red-400"}>
            {allPassed ? "✓" : "✕"}
          </span>
          <span
            className={`font-semibold ${allPassed ? "text-green-400" : "text-red-400"}`}
          >
            {passedCount}/{totalCount} tests passing
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {result.tests.map((test, i) => (
            <div
              key={i}
              className={`rounded border p-3 ${
                test.passed
                  ? "border-green-800/50 bg-green-950/30"
                  : "border-red-800/50 bg-red-950/30"
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={test.passed ? "text-green-400" : "text-red-400"}
                >
                  {test.passed ? "✓" : "✕"}
                </span>
                <div className="flex-1">
                  <div
                    className={`font-medium ${test.passed ? "text-green-300" : "text-red-300"}`}
                  >
                    {test.name}
                  </div>
                  {test.error && (
                    <div className="mt-1 font-mono text-sm text-red-400">
                      {test.error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
