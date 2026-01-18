"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { ConsolePanel } from "@/components/ConsolePanel";
import { useCodeExecution } from "@/hooks/useCodeExecution";

const defaultCode = `// Welcome to clutch.dog!
// Try different console methods:

console.log("Hello, World!");
console.info("This is an info message");
console.warn("This is a warning");
console.error("This is an error");

// Try running some code:
const numbers = [1, 2, 3, 4, 5];
console.log("Sum:", numbers.reduce((a, b) => a + b, 0));
`;

export default function EditorPage() {
  const [code, setCode] = useState(defaultCode);
  const { execute, clear, isRunning, result } = useCodeExecution();

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
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <CodeEditor
            defaultValue={defaultCode}
            language="javascript"
            onChange={(value) => setCode(value ?? "")}
          />
        </div>
        <div className="w-96 border-l border-gray-800">
          <ConsolePanel
            logs={result?.logs ?? []}
            error={result?.error}
            isRunning={isRunning}
            result={result}
            onClear={clear}
          />
        </div>
      </main>
    </div>
  );
}
