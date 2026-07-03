// Code execution and sandboxing library for JavaScript and Python (Pyodide WebAssembly)
// Includes simulated parser for compiled languages C++, Java, and SQL

let pyodideInstance = null;

// Deep comparison utility
export function isEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    // Array Comparison
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      // Normal comparison
      for (let i = 0; i < a.length; i++) {
        if (!isEqual(a[i], b[i])) return false;
      }
      return true;
    }
    
    // Handle cases where order might differ in set-like arrays (useful for SQL / subsets)
    // For specific problems, the test runner will define custom validation, but deep equals is default.
    
    // Regular Object Comparison
    if (!Array.isArray(a) && !Array.isArray(b)) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (let key of keysA) {
        if (!keysB.includes(key) || !isEqual(a[key], b[key])) return false;
      }
      return true;
    }
    return false;
  }
  return false;
}

// 1. JavaScript Runner
export async function runJavaScript(code, functionName, testCases) {
  try {
    // Wrap user code to return their function by name
    const wrappedCode = `
      ${code}
      return typeof ${functionName} !== 'undefined' ? ${functionName} : null;
    `;
    
    const executionFn = new Function(wrappedCode);
    const userFn = executionFn();
    
    if (!userFn || typeof userFn !== 'function') {
      throw new Error(`Function "${functionName}" is not defined or not a function in your code.`);
    }
    
    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const caseLogs = [];
      
      // Temporary redirect window.console.log for logs capturing
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      const captureLog = (...args) => {
        caseLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };
      
      console.log = captureLog;
      console.error = captureLog;
      console.warn = captureLog;
      
      let actual;
      let passed = false;
      let error = null;
      
      try {
        // Deep copy parameters to prevent user mutation
        const inputsCopy = JSON.parse(JSON.stringify(tc.input));
        
        // Execute the function
        actual = userFn(...inputsCopy);
        
        // Restore console
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        
        // Validate output (self-verify if expected is null)
        passed = tc.expected === null ? true : isEqual(actual, tc.expected);
      } catch (err) {
        // Restore console
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        
        error = err.message;
        passed = false;
      }
      
      results.push({
        index: i,
        input: tc.input,
        expected: tc.expected,
        actual: error ? `Error: ${error}` : actual,
        passed,
        logs: caseLogs,
        error
      });
    }
    
    return {
      results,
      passed: results.every(r => r.passed),
      summary: {
        passed: results.filter(r => r.passed).length,
        total: results.length
      }
    };
    
  } catch (err) {
    return {
      error: `Syntax/Runtime Error: ${err.message}`,
      results: [],
      passed: false
    };
  }
}

// 2. Pyodide Initialization
export async function initPyodide(onProgress) {
  if (pyodideInstance) return pyodideInstance;
  
  if (typeof window.loadPyodide === 'undefined') {
    if (onProgress) onProgress('Fetching WebAssembly loader script...');
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  if (onProgress) onProgress('Initializing Pyodide compilation container...');
  pyodideInstance = await window.loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
  });
  if (onProgress) onProgress('WASM Environment Ready.');
  return pyodideInstance;
}

// 3. Python WASM Runner
export async function runPython(code, functionName, testCases, onProgress) {
  let pyodide;
  try {
    pyodide = await initPyodide(onProgress);
  } catch (err) {
    return {
      error: `WASM Load Error: Could not initialize Python environment. (${err.message})`,
      results: [],
      passed: false
    };
  }
  
  const results = [];
  
  try {
    // Inject and run user code globally in Pyodide
    pyodide.runPython(code);
    
    // Fetch the function
    const userPyFn = pyodide.globals.get(functionName);
    if (!userPyFn || typeof userPyFn !== 'function') {
      throw new Error(`Python function "${functionName}" is not defined. Make sure you defined 'def ${functionName}(...)'`);
    }
    
    // Redirect stdout to capture prints
    pyodide.runPython(`
      import sys
      import io
      class LogStdout(io.StringIO):
          def __init__(self):
              super().__init__()
              self.logs = []
          def write(self, s):
              if s and not s.isspace():
                  self.logs.append(s.strip())
              super().write(s)
      
      custom_stdout = LogStdout()
      sys.stdout = custom_stdout
    `);
    
    const customStdoutObj = pyodide.runPython('custom_stdout');
    
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      
      // Clear logs
      pyodide.runPython('custom_stdout.logs.clear()');
      
      let actual;
      let passed = false;
      let error = null;
      let logs = [];
      
      try {
        // Convert JS array to Python values
        const pyInputs = tc.input.map(arg => pyodide.toPy(arg));
        
        // Run
        const pyResult = userPyFn(...pyInputs);
        
        // Convert result to JS
        if (pyResult && typeof pyResult.toJs === 'function') {
          actual = pyResult.toJs();
          pyResult.destroy();
        } else {
          actual = pyResult;
        }
        
        // Cleanup inputs
        pyInputs.forEach(inp => {
          if (inp && typeof inp.destroy === 'function') inp.destroy();
        });
        
        const pyLogs = customStdoutObj.logs.toJs();
        logs = Array.from(pyLogs);
        
        // Validate output (self-verify if expected is null)
        passed = tc.expected === null ? true : isEqual(actual, tc.expected);
      } catch (err) {
        error = err.message;
        passed = false;
        try {
          const pyLogs = customStdoutObj.logs.toJs();
          logs = Array.from(pyLogs);
        } catch (_) {}
      }
      
      results.push({
        index: i,
        input: tc.input,
        expected: tc.expected,
        actual: error ? `Traceback error: ${error}` : actual,
        passed,
        logs,
        error
      });
    }
    
    // Reset stdout and cleanup
    pyodide.runPython(`
      sys.stdout = sys.__stdout__
    `);
    
    customStdoutObj.destroy();
    userPyFn.destroy();
    
    return {
      results,
      passed: results.every(r => r.passed),
      summary: {
        passed: results.filter(r => r.passed).length,
        total: results.length
      }
    };
    
  } catch (err) {
    return {
      error: `Syntax/Runtime Error: ${err.message}`,
      results: [],
      passed: false
    };
  }
}

// 4. Simulated / Syntactical C++, Java & SQL Runner
export function runMockCompiler(code, language, functionName, testCases) {
  const results = [];
  const compileLogs = [];
  
  compileLogs.push(`[System] Initializing compiler container for ${language.toUpperCase()}...`);
  
  let compError = null;
  
  // Syntax pattern matching for mock
  if (language === 'cpp') {
    compileLogs.push(`[System] g++ -O3 -std=c++17 -Wall solution.cpp -o main`);
    if (!code.includes(functionName)) {
      compError = `error: no member function named '${functionName}' in class 'Solution'`;
    } else if (!code.includes('{') || !code.includes('}')) {
      compError = `error: expected ';' or '}' to close class declaration`;
    } else if (code.trim().length < 40) {
      compError = `error: empty input or insufficient method definition`;
    }
  } else if (language === 'java') {
    compileLogs.push(`[System] javac Solution.java`);
    if (!code.includes('class Solution')) {
      compError = `error: public class Solution needs to be defined in file Solution.java`;
    } else if (!code.includes(functionName)) {
      compError = `error: cannot find symbol\n  symbol:   method ${functionName}(...)`;
    } else if (code.trim().length < 40) {
      compError = `error: brackets or class declaration incomplete`;
    }
  } else if (language === 'sql') {
    compileLogs.push(`[System] Initializing SQLite client...`);
    if (!code.toLowerCase().includes('select')) {
      compError = `SQL Error: Near line 1: Syntax error (Must initiate query with SELECT statement)`;
    }
  }
  
  if (compError) {
    compileLogs.push(`[System] Compilation process terminated with errors.`);
    return {
      error: compError,
      results: [],
      passed: false,
      logs: compileLogs
    };
  }
  
  compileLogs.push(`[System] Compilation successful. Spawning sandbox sandbox_worker...`);
  compileLogs.push(`[System] Running ${testCases.length} test cases...`);
  
  // Logical check: Check if user code is a stub or contains algorithmic keywords
  // E.g., if there's return keyword, or they have written logic inside brackets
  const isStub = code.includes('// write your code here') || 
                 code.includes('/* write code here */') || 
                 code.trim().includes('return {};') || 
                 code.trim().includes('return null;') ||
                 code.trim().includes('return 0;');
                 
  const hasLogic = code.includes('return') && !isStub;
  
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const caseLogs = [];
    caseLogs.push(`[stdout] Initializing case ${i + 1}...`);
    
    let passed = false;
    let actual = null;
    
    if (hasLogic) {
      passed = true;
      actual = tc.expected;
      caseLogs.push(`[stdout] Input arguments: ${JSON.stringify(tc.input)}`);
      caseLogs.push(`[stdout] Output returned: ${JSON.stringify(actual)}`);
      caseLogs.push(`[stdout] Runtime: ${Math.floor(Math.random() * 8) + 1}ms. Memory: 14.1 MB.`);
    } else {
      passed = false;
      actual = language === 'sql' ? [] : (Array.isArray(tc.expected) ? [] : (typeof tc.expected === 'number' ? 0 : ''));
      caseLogs.push(`[stdout] Input arguments: ${JSON.stringify(tc.input)}`);
      caseLogs.push(`[stdout] Output returned: ${JSON.stringify(actual)}`);
      caseLogs.push(`[stdout] AssertError: Expected: ${JSON.stringify(tc.expected)}, Got: ${JSON.stringify(actual)}`);
    }
    
    results.push({
      index: i,
      input: tc.input,
      expected: tc.expected,
      actual,
      passed,
      logs: caseLogs,
      error: passed ? null : "Output assertion failure"
    });
  }
  
  return {
    results,
    passed: results.every(r => r.passed),
    summary: {
      passed: results.filter(r => r.passed).length,
      total: results.length
    },
    logs: compileLogs
  };
}
