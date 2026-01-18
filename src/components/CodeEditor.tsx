"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useState, useCallback } from "react";

interface CodeEditorProps {
  defaultValue?: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  height?: string;
}

export function CodeEditor({
  defaultValue = "",
  language = "typescript",
  onChange,
  height = "100%",
}: CodeEditorProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleEditorDidMount: OnMount = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-gray-300" />
            <span className="text-sm text-gray-400">Loading editor...</span>
          </div>
        </div>
      )}
      <Editor
        height={height}
        defaultLanguage={language}
        defaultValue={defaultValue}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        onChange={onChange}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 16 },
        }}
      />
    </div>
  );
}
