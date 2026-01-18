"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { useCodeExecution } from "@/hooks/useCodeExecution";

const defaultCode = `// Welcome to clutch.dog!
// Start writing your code here

function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("World"));
`;

export default function EditorPage() {
  const [code, setCode] = useState(defaultCode);
  const { execute, isRunning, result } = useCodeExecution();

  const handleRun = () => {
    execute(code);
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-gray-800 px-4">
        <h1 className="text-lg font-semibold">Code Editor</h1>
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="rounded bg-green-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? "Running..." : "Run Code"}
        </button>
      </header>
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1">
          <CodeEditor
            defaultValue={defaultCode}
            language="javascript"
            onChange={(value) => setCode(value ?? "")}
          />
        </div>
        <div className="h-48 overflow-auto border-t border-gray-800 bg-[#1e1e1e] p-4 font-mono text-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Output
          </div>
          {result === null && !isRunning && (
            <div className="text-gray-500">
              Click &quot;Run Code&quot; to execute
            </div>
          )}
          {isRunning && <div className="text-gray-400">Executing...</div>}
          {result && (
            <div className="space-y-1">
              {result.logs.map((entry, i) => (
                <div
                  key={i}
                  className={
                    entry.type === "error"
                      ? "text-red-400"
                      : entry.type === "warn"
                        ? "text-yellow-400"
                        : "text-gray-300"
                  }
                >
                  {entry.args
                    .map((arg) =>
                      typeof arg === "object"
                        ? JSON.stringify(arg)
                        : String(arg)
                    )
                    .join(" ")}
                </div>
              ))}
              {result.error && (
                <div className="text-red-400">Error: {result.error}</div>
              )}
              {result.success && result.logs.length === 0 && !result.error && (
                <div className="text-gray-500">(No output)</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
