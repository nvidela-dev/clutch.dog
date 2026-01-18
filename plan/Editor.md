# Implementation Spec: Next.js Code Execution Environment

## Context

I am building a course platform using **Next.js**. I need a component that replicates the "VS Code" experience, allowing users to write code and run tests against it in the browser.

## Core Requirements

### 1. Editor Component

* **Library:** Use `@monaco-editor/react`.
* **Rationale:** Provides IntelliSense, Minimap, and standard VS Code keybindings without the complex Webpack configuration of the raw `monaco-editor` package.
* **Constraint:** Must be client-side rendered (CSR) only, as Monaco relies on `window`/`navigator`.

### 2. Execution Engine (Strategy: Client-Side Isolation)

* **Mechanism:** Web Workers.
* **Rationale:**
  * Prevents the main thread (UI) from freezing if the user writes an infinite loop.
  * Provides a clean global scope, preventing the user from accessing DOM elements or React state/cookies.
* **Safety:** The worker must have a termination timeout (e.g., 2000ms) to kill the process if execution hangs.

### 3. Test Runner Logic

* **Pattern:** Injection & Eval.
* **Flow:**
    1. Receive `userCode` (string) from Monaco.
    2. Append `testAssertions` (string, hidden from user) to the `userCode`.
    3. Send combined string to the Web Worker.
    4. Worker evaluates the script.
    5. Worker posts back `success` or `error` message.

## Implementation Details

### A. Monaco Setup (Next.js)

```tsx
"use client";
import Editor from "@monaco-editor/react";

// Configuration for minimalist "course" feel
const options = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  automaticLayout: true,
};
