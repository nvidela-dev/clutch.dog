import { assertionsCode, getTestResultsCode } from "./assertions";

export interface TestResult {
  name: string;
  passed: boolean;
  error: string | null;
}

export interface TestRunResult {
  success: boolean;
  tests: TestResult[];
  error?: string;
}

/**
 * Combines user code with test code for execution in the worker.
 * The assertions framework is injected first, then user code, then tests.
 */
export function buildTestScript(userCode: string, testCode: string): string {
  return `
${assertionsCode}

// User code
${userCode}

// Test code
${testCode}

// Return test results
${getTestResultsCode}
`;
}

/**
 * Parses the worker result to extract test results.
 */
export function parseTestResults(workerResult: {
  success: boolean;
  returnValue?: unknown;
  error?: string;
}): TestRunResult {
  if (!workerResult.success) {
    return {
      success: false,
      tests: [],
      error: workerResult.error,
    };
  }

  const tests = workerResult.returnValue as TestResult[] | undefined;

  if (!Array.isArray(tests)) {
    return {
      success: false,
      tests: [],
      error: "Failed to retrieve test results",
    };
  }

  const allPassed = tests.every((t) => t.passed);

  return {
    success: allPassed,
    tests,
  };
}
