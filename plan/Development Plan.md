# clutch.dog Development Plan

## Project Vision

A browser-based course platform where students can:
- Write code in a Monaco-powered editor (VS Code-like experience)
- Execute code safely in the browser using Web Workers
- Run tests and get instant pass/fail feedback
- Work through exercises starting with Express APIs, then React

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Code Editor | Monaco Editor (@monaco-editor/react) |
| Execution | Web Workers (client-side isolation) |
| State | React Context |
| Exercise Content | JSON + MDX files |

## Development Philosophy

### Incremental PRs
After the initial setup (pushed directly to `main`), every feature ships as a PR:
- One PR = one focused feature
- Each PR should be reviewable in isolation
- PRs build on each other sequentially
- No PR should be too large to review in one sitting

### Why Small Increments?
1. **Easier to review** - Smaller diffs, clearer intent
2. **Safer to merge** - Less risk of breaking things
3. **Faster feedback** - Ship and validate quickly
4. **Better git history** - Each commit tells a story

---

## Phase 1: Foundation (Complete)

**Status:** Pushed to `main`

Created the project skeleton:
- Next.js 16 with TypeScript
- Tailwind CSS v4 configuration
- ESLint 9 with TypeScript support
- Prettier for formatting
- Basic `src/app` and `src/components` structure

---

## Phase 2: Core Editor Experience

### PR #1: Monaco Editor Component

**Branch:** `feat/monaco-editor`

**Goal:** Get a working code editor on the page with syntax highlighting.

**Why First:** The editor is the heart of the platform. Everything else (execution, tests, exercises) depends on having a working editor.

**Implementation Steps:**

1. Install Monaco Editor
   ```bash
   npm install @monaco-editor/react
   ```

2. Create `src/components/CodeEditor.tsx`
   - Client-side only component (`"use client"`)
   - Monaco requires `window`/`navigator`, can't SSR
   - Configure for "course" feel:
     - `fontSize: 14`
     - `minimap: { enabled: false }`
     - `lineNumbers: "on"`
     - `scrollBeyondLastLine: false`
     - `automaticLayout: true`

3. Create a demo page at `src/app/editor/page.tsx`
   - Full-height editor
   - TypeScript/JavaScript language mode
   - Dark theme (matches site)

4. Handle loading state
   - Monaco takes a moment to load
   - Show skeleton/spinner while loading

**Files to Create/Modify:**
- `src/components/CodeEditor.tsx` (new)
- `src/app/editor/page.tsx` (new)

**Verification:**
- Navigate to `/editor`
- Editor loads without errors
- Syntax highlighting works for JS/TS
- Can type and edit code
- No SSR errors in console

---

### PR #2: Web Worker Execution Engine

**Branch:** `feat/web-worker-execution`

**Goal:** Execute user code safely in a Web Worker with timeout protection.

**Why Second:** Before we can show output or run tests, we need a safe way to execute arbitrary code.

**Key Constraints:**
- Code runs in Web Worker (separate thread)
- User code cannot access DOM, cookies, React state
- Infinite loops don't freeze the UI
- Execution has a timeout (2000ms default)

**Implementation Steps:**

1. Create the Worker file `src/workers/codeRunner.worker.ts`
   ```typescript
   // Receives code string via postMessage
   // Wraps in try/catch
   // Captures console.log output
   // Posts back result or error
   ```

2. Create execution hook `src/hooks/useCodeExecution.ts`
   ```typescript
   // Manages Worker lifecycle
   // Handles timeout (terminates Worker if too slow)
   // Returns: { execute, isRunning, result, error }
   ```

3. Add "Run Code" button to editor page
   - Disabled while code is running
   - Shows loading state

4. Display raw execution result (temporary)
   - Just show success/error below editor
   - Console panel comes in next PR

**Files to Create/Modify:**
- `src/workers/codeRunner.worker.ts` (new)
- `src/hooks/useCodeExecution.ts` (new)
- `src/app/editor/page.tsx` (modify)
- `next.config.ts` (may need Worker config)

**Verification:**
- Write `console.log("hello")` → see captured output
- Write `while(true){}` → times out, doesn't freeze page
- Write `throw new Error("oops")` → error is captured and shown
- Write `document.body` → returns undefined (no DOM access)

---

### PR #3: Console Output Panel

**Branch:** `feat/console-panel`

**Goal:** Display execution output in a proper console panel.

**Why Third:** Now that we can execute code, we need a good way to display the output.

**Implementation Steps:**

1. Create `src/components/ConsolePanel.tsx`
   - Scrollable output area
   - Different styling for:
     - `log` (white/gray)
     - `error` (red)
     - `warn` (yellow)
   - Timestamps optional
   - Clear button

2. Update Worker to capture all console methods
   - `console.log`, `console.error`, `console.warn`, `console.info`
   - Each entry has: `type`, `args`, `timestamp`

3. Create layout with editor + console
   - Split view (editor top/left, console bottom/right)
   - Resizable panels (optional, can defer)

4. Persist output across runs (or clear on each run - TBD)

**Files to Create/Modify:**
- `src/components/ConsolePanel.tsx` (new)
- `src/workers/codeRunner.worker.ts` (modify)
- `src/app/editor/page.tsx` (modify)

**Verification:**
- Multiple `console.log` calls appear in order
- Errors show in red
- Console scrolls if output is long
- Clear button works

---

### PR #4: Test Runner Integration

**Branch:** `feat/test-runner`

**Goal:** Run hidden tests against user code and show pass/fail results.

**Why Fourth:** This is the core educational mechanic - students write code, tests validate it.

**Test Injection Pattern:**
```
userCode (visible to student)
+
testAssertions (hidden, appended by system)
=
Combined script sent to Worker
```

**Implementation Steps:**

1. Create `src/lib/testRunner.ts`
   - Takes `userCode` and `testCode` strings
   - Combines them
   - Sends to Worker
   - Parses results

2. Define test result format
   ```typescript
   interface TestResult {
     name: string;
     passed: boolean;
     error?: string;
   }
   ```

3. Create `src/components/TestResults.tsx`
   - Shows list of tests
   - Green checkmark for pass
   - Red X with error message for fail
   - Summary: "3/5 tests passing"

4. Create simple assertion helpers (injected into Worker)
   ```typescript
   function expect(actual) {
     return {
       toBe(expected) { ... },
       toEqual(expected) { ... },
       toThrow() { ... },
     };
   }
   ```

5. Add "Run Tests" button (separate from "Run Code")

**Files to Create/Modify:**
- `src/lib/testRunner.ts` (new)
- `src/lib/assertions.ts` (new)
- `src/components/TestResults.tsx` (new)
- `src/app/editor/page.tsx` (modify)

**Verification:**
- Write correct code → all tests pass (green)
- Write wrong code → specific tests fail with helpful message
- Syntax error → shows error, tests don't run
- Tests run independently of console output

---

## Phase 3: Exercise System

### PR #5: Exercise Data Model

**Branch:** `feat/exercise-model`

**Goal:** Define how exercises are structured and stored.

**Exercise Structure:**
```
src/data/exercises/
├── express-01-hello-world/
│   ├── instructions.mdx    # What the student sees
│   ├── starter.ts          # Initial code in editor
│   ├── solution.ts         # Reference solution (hidden)
│   └── tests.ts            # Test assertions
├── express-02-route-params/
│   └── ...
```

**TypeScript Types:**
```typescript
interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "express" | "react";
  starterCode: string;
  testCode: string;
  instructions: string; // MDX content
}
```

**Implementation Steps:**

1. Create type definitions in `src/types/exercise.ts`

2. Create loader function `src/lib/exercises.ts`
   - `getExercise(id)` - load single exercise
   - `listExercises()` - list all exercises
   - `getExercisesByCategory(category)` - filter

3. Create first exercise content
   - `express-01-hello-world`
   - Simple: "Create a function that returns 'Hello, World!'"

4. Set up MDX for instructions (if needed)

**Files to Create/Modify:**
- `src/types/exercise.ts` (new)
- `src/lib/exercises.ts` (new)
- `src/data/exercises/express-01-hello-world/` (new directory)

**Verification:**
- Can import and load exercise data
- TypeScript types are correct
- MDX renders (if used)

---

### PR #6: Exercise Page

**Branch:** `feat/exercise-page`

**Goal:** Create the full exercise experience page.

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Exercise Title                    [Run Tests]   │
├───────────────────┬─────────────────────────────┤
│                   │                             │
│   Instructions    │        Code Editor          │
│   (MDX content)   │                             │
│                   │                             │
│                   ├─────────────────────────────┤
│                   │      Console / Tests        │
│                   │                             │
└───────────────────┴─────────────────────────────┘
```

**Implementation Steps:**

1. Create `src/app/exercises/[id]/page.tsx`
   - Dynamic route for each exercise
   - Load exercise data server-side
   - Render layout with all components

2. Create `src/components/ExerciseLayout.tsx`
   - Three-panel layout
   - Responsive (stack on mobile?)

3. Create `src/components/Instructions.tsx`
   - Renders MDX content
   - Styled for readability

4. Wire everything together
   - Editor shows starter code
   - Run Tests button executes tests
   - Results show in panel

**Files to Create/Modify:**
- `src/app/exercises/[id]/page.tsx` (new)
- `src/components/ExerciseLayout.tsx` (new)
- `src/components/Instructions.tsx` (new)

**Verification:**
- Navigate to `/exercises/express-01-hello-world`
- See instructions, editor with starter code
- Run tests, see results
- Complete the exercise successfully

---

### PR #7: Exercise Navigation

**Branch:** `feat/exercise-navigation`

**Goal:** List exercises and navigate between them.

**Implementation Steps:**

1. Create `src/app/exercises/page.tsx`
   - List all exercises
   - Group by category (Express, React)
   - Show difficulty badge

2. Add navigation within exercise page
   - "Previous" / "Next" buttons
   - Progress indicator

3. Create `src/components/ExerciseCard.tsx`
   - Title, description, difficulty
   - Link to exercise page

**Files to Create/Modify:**
- `src/app/exercises/page.tsx` (new)
- `src/components/ExerciseCard.tsx` (new)
- `src/app/exercises/[id]/page.tsx` (modify)

**Verification:**
- `/exercises` shows list of all exercises
- Can click to navigate to exercise
- Can navigate between exercises

---

## Phase 4: Polish & Content

### PR #8-12: Additional Express Exercises

Create 4-5 more Express exercises:
- Route parameters
- Query strings
- POST requests
- Middleware basics
- Error handling

Each exercise = one PR with:
- Instructions (MDX)
- Starter code
- Tests
- Solution

### PR #13+: Future Enhancements

- Progress persistence (localStorage or auth)
- Syntax error highlighting in editor
- Hints system
- Solution reveal
- Dark/light theme toggle
- Mobile improvements

---

## PR Checklist Template

Before merging any PR:

- [ ] Code compiles (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Manual testing complete
- [ ] No console errors
- [ ] Responsive check (if UI)
- [ ] Code reviewed

---

## Open Questions

1. **Express execution in browser?**
   - Express can't actually run in a browser
   - Options:
     a. Mock Express API for exercises
     b. Test the handler functions, not full Express app
     c. Use a different approach for Express exercises
   - **Recommendation:** Test handler functions in isolation

2. **Progress tracking?**
   - Start with localStorage (no auth needed)
   - Add auth + database later if needed

3. **Mobile support priority?**
   - Monaco works on mobile but not ideal
   - Focus on desktop first, improve mobile later

---

## Timeline

No specific dates - work at your own pace. The PR structure ensures:
- Each feature is complete and working before moving on
- Progress is visible and measurable
- Easy to pause and resume
