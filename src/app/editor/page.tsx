"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { ConsolePanel } from "@/components/ConsolePanel";
import { TestResults } from "@/components/TestResults";
import { useCodeExecution } from "@/hooks/useCodeExecution";
import { useTestRunner } from "@/hooks/useTestRunner";

const defaultCode = `// Write a function that adds two numbers
function add(a, b) {
  return a + b;
}

// Try it out:
console.log("2 + 3 =", add(2, 3));
`;

// Hidden test code (in real exercises, this would come from exercise data)
const testCode = `
test("add(2, 3) should return 5", () => {
  expect(add(2, 3)).toBe(5);
});

test("add(0, 0) should return 0", () => {
  expect(add(0, 0)).toBe(0);
});

test("add(-1, 1) should return 0", () => {
  expect(add(-1, 1)).toBe(0);
});

test("add(10, 20) should return 30", () => {
  expect(add(10, 20)).toBe(30);
});
`;

type OutputTab = "console" | "tests";

export default function EditorPage() {
  const [code, setCode] = useState(defaultCode);
  const [activeTab, setActiveTab] = useState<OutputTab>("console");

  const {
    execute,
    clear: clearConsole,
    isRunning: isCodeRunning,
    result: codeResult,
  } = useCodeExecution();

  const {
    runTests,
    isRunning: isTestsRunning,
    result: testResult,
  } = useTestRunner();

  const handleRunCode = () => {
    execute(code);
    setActiveTab("console");
  };

  const handleRunTests = () => {
    runTests(code, testCode);
    setActiveTab("tests");
  };

  const isRunning = isCodeRunning || isTestsRunning;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-gray-800 px-4">
        <h1 className="text-lg font-semibold">Code Editor</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="rounded bg-gray-700 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCodeRunning ? "Running..." : "Run Code"}
          </button>
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="rounded bg-green-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isTestsRunning ? "Testing..." : "Run Tests"}
          </button>
        </div>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <CodeEditor
            defaultValue={defaultCode}
            language="javascript"
            onChange={(value) => setCode(value ?? "")}
          />
        </div>
        <div className="flex w-96 flex-col border-l border-gray-800">
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab("console")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "console"
                  ? "bg-[#1e1e1e] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Console
            </button>
            <button
              onClick={() => setActiveTab("tests")}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "tests"
                  ? "bg-[#1e1e1e] text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Tests
              {testResult && (
                <span
                  className={`ml-2 ${testResult.success ? "text-green-400" : "text-red-400"}`}
                >
                  {testResult.success ? "✓" : "✕"}
                </span>
              )}
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {activeTab === "console" ? (
              <ConsolePanel
                logs={codeResult?.logs ?? []}
                error={codeResult?.error}
                isRunning={isCodeRunning}
                result={codeResult}
                onClear={clearConsole}
              />
            ) : (
              <TestResults result={testResult} isRunning={isTestsRunning} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
