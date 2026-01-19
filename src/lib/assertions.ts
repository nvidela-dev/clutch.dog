// Assertion library that gets injected into the worker
// This code runs in the worker context, not in React

export const assertionsCode = `
const __testResults = [];
let __currentTest = null;

function describe(name, fn) {
  fn();
}

function it(name, fn) {
  __currentTest = { name, passed: true, error: null };
  try {
    fn();
  } catch (err) {
    __currentTest.passed = false;
    __currentTest.error = err.message || String(err);
  }
  __testResults.push(__currentTest);
  __currentTest = null;
}

// Alias for it
const test = it;

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(
          \`Expected \${JSON.stringify(expected)} but got \${JSON.stringify(actual)}\`
        );
      }
    },

    toEqual(expected) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(
          \`Expected \${expectedStr} but got \${actualStr}\`
        );
      }
    },

    toBeTruthy() {
      if (!actual) {
        throw new Error(
          \`Expected \${JSON.stringify(actual)} to be truthy\`
        );
      }
    },

    toBeFalsy() {
      if (actual) {
        throw new Error(
          \`Expected \${JSON.stringify(actual)} to be falsy\`
        );
      }
    },

    toBeGreaterThan(expected) {
      if (!(actual > expected)) {
        throw new Error(
          \`Expected \${actual} to be greater than \${expected}\`
        );
      }
    },

    toBeLessThan(expected) {
      if (!(actual < expected)) {
        throw new Error(
          \`Expected \${actual} to be less than \${expected}\`
        );
      }
    },

    toContain(expected) {
      if (Array.isArray(actual)) {
        if (!actual.includes(expected)) {
          throw new Error(
            \`Expected array to contain \${JSON.stringify(expected)}\`
          );
        }
      } else if (typeof actual === 'string') {
        if (!actual.includes(expected)) {
          throw new Error(
            \`Expected string to contain "\${expected}"\`
          );
        }
      } else {
        throw new Error('toContain can only be used with arrays or strings');
      }
    },

    toHaveLength(expected) {
      if (actual.length !== expected) {
        throw new Error(
          \`Expected length \${expected} but got \${actual.length}\`
        );
      }
    },

    toThrow(expectedMessage) {
      if (typeof actual !== 'function') {
        throw new Error('toThrow expects a function');
      }
      let threw = false;
      let thrownError = null;
      try {
        actual();
      } catch (err) {
        threw = true;
        thrownError = err;
      }
      if (!threw) {
        throw new Error('Expected function to throw');
      }
      if (expectedMessage && thrownError.message !== expectedMessage) {
        throw new Error(
          \`Expected error message "\${expectedMessage}" but got "\${thrownError.message}"\`
        );
      }
    },

    toBeNull() {
      if (actual !== null) {
        throw new Error(
          \`Expected null but got \${JSON.stringify(actual)}\`
        );
      }
    },

    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(
          \`Expected undefined but got \${JSON.stringify(actual)}\`
        );
      }
    },

    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
  };
}
`;

export const getTestResultsCode = `
__testResults;
`;
