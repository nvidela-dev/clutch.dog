import { CodeEditor } from "@/components/CodeEditor";

const defaultCode = `// Welcome to clutch.dog!
// Start writing your code here

function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
`;

export default function EditorPage() {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center border-b border-gray-800 px-4">
        <h1 className="text-lg font-semibold">Code Editor</h1>
      </header>
      <main className="flex-1">
        <CodeEditor defaultValue={defaultCode} language="typescript" />
      </main>
    </div>
  );
}
