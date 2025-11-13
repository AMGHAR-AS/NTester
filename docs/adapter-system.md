# Adapter System

NTester's adapter system provides flexible terminal rendering options. Choose from modern, feature-rich adapters or lightweight alternatives based on your needs and environment.

## 📋 Table of Contents

- [Overview](#overview)
- [Available Adapters](#available-adapters)
- [Adapter Selection](#adapter-selection)
- [Adapter API](#adapter-api)
- [Creating Custom Adapters](#creating-custom-adapters)
- [Best Practices](#best-practices)
- [Examples](#examples)

## 🎯 Overview

Adapters handle terminal output rendering in NTester. Each adapter provides the same interface but uses different underlying libraries and rendering strategies.

**Key Features**:
- 🎨 Multiple rendering styles
- 🔄 Automatic adapter detection
- 📦 Minimal dependencies (optional)
- 🎭 Consistent API across adapters
- 🛠️ Easy to extend

## 🎨 Available Adapters

### 1. Modern Adapter

**Status**: ✅ Production Ready
**Dependencies**: chalk, cli-table3, ora, inquirer

The most feature-rich adapter using modern terminal libraries.

**Features**:
- Rich colors and styling (chalk)
- Beautiful tables (cli-table3)
- Animated spinners (ora)
- Interactive prompts (inquirer)
- Unicode symbols
- Progress indicators

**When to use**:
- Development environments
- CI/CD with color support
- Interactive testing sessions
- Full-featured terminal output

**Example output**:
```
🧪 Running Tests...

┌─────────────────────────────────────┐
│ Test Suite: My Test Suite          │
├─────────────────────────────────────┤
│ Status: ✅ PASSED                   │
│ Duration: 1.234s                    │
└─────────────────────────────────────┘

✅ Test 1
  ✓ Step 1: Validation passed
  ✓ Step 2: Assertion succeeded

📊 Statistics:
  Total Tests: 5
  Passed: 5
  Failed: 0
  Success Rate: 100%
```

**Installation**:
```bash
npm install chalk cli-table3 ora inquirer
```

**Usage**:
```javascript
import RendererPlugin from './app/plugins/RendererPlugin.js';

const renderer = new RendererPlugin({
    adapterType: 'modern',
    adapterOptions: {
        colors: true,
        unicode: true
    }
});
```

### 2. Ink Adapter

**Status**: ✅ Production Ready
**Dependencies**: ink, react

React-based terminal interface with component architecture.

**Features**:
- React components for terminal
- Stateful UI management
- Real-time updates
- Component composition
- Modern React patterns

**When to use**:
- Complex interactive UIs
- Real-time monitoring
- Dashboard-style outputs
- React-based workflows

**Example output**:
```
┌────────────────────────────────────┐
│ NTester - Test Execution          │
├────────────────────────────────────┤
│                                    │
│ Running: My Test Suite             │
│ Progress: ████████████░░░ 75%      │
│                                    │
│ ✓ Test 1 - Passed                 │
│ ✓ Test 2 - Passed                 │
│ ✓ Test 3 - Passed                 │
│ ⟳ Test 4 - Running...             │
│                                    │
└────────────────────────────────────┘
```

**Installation**:
```bash
npm install ink react
```

**Usage**:
```javascript
import RendererPlugin from './app/plugins/RendererPlugin.js';

const renderer = new RendererPlugin({
    adapterType: 'ink',
    adapterOptions: {
        exitOnFinish: true
    }
});
```

### 3. Minimal Adapter

**Status**: ✅ Production Ready
**Dependencies**: None (zero dependencies)

Lightweight adapter using only console.log.

**Features**:
- Zero dependencies
- Simple text output
- Fast execution
- Universal compatibility
- Low resource usage

**When to use**:
- Restricted environments
- Minimal installations
- Docker containers
- CI/CD without extras
- Quick debugging

**Example output**:
```
=== Test Suite: My Test Suite ===

[PASS] Test 1
  - Step 1: Validation passed
  - Step 2: Assertion succeeded

[PASS] Test 2
  - Step 1: Check completed

=== Statistics ===
Total Tests: 2
Passed: 2
Failed: 0
Success Rate: 100%
```

**Usage**:
```javascript
import RendererPlugin from './app/plugins/RendererPlugin.js';

const renderer = new RendererPlugin({
    adapterType: 'minimal'
});
```

### 4. Auto Adapter

**Status**: ✅ Production Ready
**Dependencies**: Dynamic (based on availability)

Automatically detects and uses the best available adapter.

**Detection Logic**:
1. Try Modern Stack (if chalk available)
2. Try Ink (if ink available)
3. Fall back to Minimal

**When to use**:
- Unknown environments
- Multiple deployment targets
- Library mode
- Maximum compatibility

**Usage**:
```javascript
import RendererPlugin from './app/plugins/RendererPlugin.js';

const renderer = new RendererPlugin({
    adapterType: 'auto'
});
```

## 🔧 Adapter Selection

### Via RendererPlugin

```javascript
import RendererPlugin from './app/plugins/RendererPlugin.js';

// Specific adapter
const renderer = new RendererPlugin({ adapterType: 'modern' });

// Auto-detect
const renderer = new RendererPlugin({ adapterType: 'auto' });
```

### Via AdapterFactory

```javascript
import { createAdapter } from './app/adapters/AdapterFactory.js';

// Create specific adapter
const adapter = createAdapter('modern', { colors: true });

// Auto-detect
const adapter = createAdapter('auto');
```

### Via Environment Variable

```bash
export NTESTER_ADAPTER=minimal
node my-test.js
```

```javascript
const adapterType = process.env.NTESTER_ADAPTER || 'auto';
const renderer = new RendererPlugin({ adapterType });
```

## 🎛️ Adapter API

All adapters implement the same interface:

### renderStart(process)

Called when test execution starts.

```javascript
renderStart(process) {
    console.log(`Starting: ${process.name}`);
}
```

### renderTestStart(process)

Called when a test begins.

```javascript
renderTestStart(process) {
    console.log(`Test: ${process.name}`);
}
```

### renderTestEnd(process)

Called when a test completes.

```javascript
renderTestEnd(process) {
    const status = process.passed ? '✓' : '✗';
    console.log(`${status} ${process.name}`);
}
```

### renderStepStart(step, process)

Called when a step begins.

```javascript
renderStepStart(step, process) {
    console.log(`  Step: ${step.name}`);
}
```

### renderStepEnd(step, process)

Called when a step completes.

```javascript
renderStepEnd(step, process) {
    const status = step.passed ? '✓' : '✗';
    console.log(`  ${status} ${step.name}`);
}
```

### renderEnd(process)

Called when test execution completes.

```javascript
renderEnd(process) {
    console.log('Execution completed');
}
```

### renderSummary(stats)

Renders final summary with statistics.

```javascript
renderSummary(stats) {
    console.log(`Total: ${stats.total}`);
    console.log(`Passed: ${stats.passed}`);
    console.log(`Failed: ${stats.failed}`);
}
```

### renderError(error, context)

Renders error information.

```javascript
renderError(error, context) {
    console.error(`Error: ${error.message}`);
    if (context) {
        console.error(`Context: ${JSON.stringify(context)}`);
    }
}
```

## 🛠️ Creating Custom Adapters

### Basic Structure

```javascript
export default class CustomAdapter {
    constructor(options = {}) {
        this.options = options;
    }

    renderStart(process) {
        // Implementation
    }

    renderTestStart(process) {
        // Implementation
    }

    renderTestEnd(process) {
        // Implementation
    }

    renderStepStart(step, process) {
        // Implementation
    }

    renderStepEnd(step, process) {
        // Implementation
    }

    renderEnd(process) {
        // Implementation
    }

    renderSummary(stats) {
        // Implementation
    }

    renderError(error, context) {
        // Implementation
    }
}
```

### Example: JSON Adapter

```javascript
export default class JSONAdapter {
    constructor(options = {}) {
        this.options = options;
        this.events = [];
    }

    renderStart(process) {
        this.events.push({
            type: 'start',
            timestamp: Date.now(),
            name: process.name
        });
    }

    renderTestStart(process) {
        this.events.push({
            type: 'test_start',
            timestamp: Date.now(),
            test: process.name
        });
    }

    renderTestEnd(process) {
        this.events.push({
            type: 'test_end',
            timestamp: Date.now(),
            test: process.name,
            passed: process.passed
        });
    }

    renderStepStart(step, process) {
        this.events.push({
            type: 'step_start',
            timestamp: Date.now(),
            step: step.name,
            test: process.name
        });
    }

    renderStepEnd(step, process) {
        this.events.push({
            type: 'step_end',
            timestamp: Date.now(),
            step: step.name,
            test: process.name,
            passed: step.passed
        });
    }

    renderEnd(process) {
        this.events.push({
            type: 'end',
            timestamp: Date.now(),
            name: process.name
        });
    }

    renderSummary(stats) {
        this.events.push({
            type: 'summary',
            timestamp: Date.now(),
            stats
        });

        // Output JSON
        console.log(JSON.stringify(this.events, null, 2));
    }

    renderError(error, context) {
        this.events.push({
            type: 'error',
            timestamp: Date.now(),
            error: error.message,
            context
        });
    }
}
```

### Registering Custom Adapter

```javascript
import { AdapterFactory } from './app/adapters/AdapterFactory.js';
import CustomAdapter from './adapters/CustomAdapter.js';

// Register with factory
AdapterFactory.register('custom', CustomAdapter);

// Use it
import RendererPlugin from './app/plugins/RendererPlugin.js';

const renderer = new RendererPlugin({
    adapterType: 'custom',
    adapterOptions: { /* custom options */ }
});
```

## ✅ Best Practices

### 1. Choose the Right Adapter

```javascript
// Development - rich output
const renderer = new RendererPlugin({ adapterType: 'modern' });

// CI/CD - minimal dependencies
const renderer = new RendererPlugin({ adapterType: 'minimal' });

// Unknown environment - auto-detect
const renderer = new RendererPlugin({ adapterType: 'auto' });
```

### 2. Handle Missing Dependencies

```javascript
try {
    const adapter = createAdapter('modern');
} catch (error) {
    console.warn('Modern adapter unavailable, falling back to minimal');
    const adapter = createAdapter('minimal');
}
```

### 3. Pass Adapter Options

```javascript
const renderer = new RendererPlugin({
    adapterType: 'modern',
    adapterOptions: {
        colors: process.stdout.isTTY,
        unicode: true,
        verbose: false
    }
});
```

### 4. Respect Terminal Capabilities

```javascript
const adapterOptions = {
    colors: process.stdout.isTTY && process.env.TERM !== 'dumb',
    unicode: process.env.LANG?.includes('UTF-8')
};
```

### 5. Implement All Methods

Ensure your custom adapter implements all required methods:

```javascript
const requiredMethods = [
    'renderStart',
    'renderTestStart',
    'renderTestEnd',
    'renderStepStart',
    'renderStepEnd',
    'renderEnd',
    'renderSummary',
    'renderError'
];

// Verify implementation
requiredMethods.forEach(method => {
    if (typeof adapter[method] !== 'function') {
        throw new Error(`Missing method: ${method}`);
    }
});
```

### 6. Test in Multiple Environments

```bash
# Test with modern adapter
npm install chalk cli-table3 ora inquirer
node test.js

# Test with minimal adapter (no deps)
npm prune --production
node test.js

# Test with Ink
npm install ink react
node test.js
```

## 📝 Examples

### Example 1: Dynamic Adapter Selection

```javascript
import RendererPlugin from './app/plugins/RendererPlugin.js';

function getAdapterType() {
    if (process.env.CI) {
        return 'minimal';  // CI environments
    } else if (process.stdout.isTTY) {
        return 'modern';   // Interactive terminal
    } else {
        return 'minimal';  // Non-TTY (pipes, redirects)
    }
}

const renderer = new RendererPlugin({
    adapterType: getAdapterType()
});
```

### Example 2: Adapter with Conditional Colors

```javascript
const supportsColor = process.stdout.isTTY &&
                      process.env.TERM !== 'dumb' &&
                      !process.env.NO_COLOR;

const renderer = new RendererPlugin({
    adapterType: 'modern',
    adapterOptions: {
        colors: supportsColor
    }
});
```

### Example 3: Multiple Adapters

```javascript
import { createAdapter } from './app/adapters/AdapterFactory.js';

const adapters = [
    createAdapter('modern'),
    createAdapter('minimal')
];

// Render to multiple outputs
function renderToAll(method, ...args) {
    adapters.forEach(adapter => {
        if (typeof adapter[method] === 'function') {
            adapter[method](...args);
        }
    });
}

renderToAll('renderStart', process);
```

### Example 4: Adapter Testing

```javascript
import MinimalAdapter from './app/adapters/MinimalAdapter.js';

// Create test process
const testProcess = {
    name: 'Test Process',
    passed: true,
    failed: false,
    steps: [
        { name: 'Step 1', passed: true },
        { name: 'Step 2', passed: true }
    ]
};

// Test adapter
const adapter = new MinimalAdapter();
adapter.renderStart(testProcess);

testProcess.steps.forEach(step => {
    adapter.renderStepStart(step, testProcess);
    adapter.renderStepEnd(step, testProcess);
});

adapter.renderEnd(testProcess);
adapter.renderSummary({
    total: 2,
    passed: 2,
    failed: 0,
    successRate: 100
});
```

### Example 5: Adapter Configuration File

Create `ntester.config.js`:

```javascript
export default {
    adapter: {
        type: 'auto',
        options: {
            colors: true,
            unicode: true,
            verbose: false
        },
        fallback: 'minimal'
    }
};
```

Use in tests:

```javascript
import config from './ntester.config.js';
import RendererPlugin from './app/plugins/RendererPlugin.js';

const renderer = new RendererPlugin({
    adapterType: config.adapter.type,
    adapterOptions: config.adapter.options
});
```

## 🔄 Adapter Lifecycle

```
1. Adapter Creation
   └─> new RendererPlugin({ adapterType: 'modern' })

2. Plugin Registration
   └─> manager.register('renderer', renderer)

3. Plugin Initialization
   └─> await test.initPlugins()

4. Test Execution
   ├─> renderStart(process)
   ├─> For each test:
   │   ├─> renderTestStart(test)
   │   ├─> For each step:
   │   │   ├─> renderStepStart(step, test)
   │   │   └─> renderStepEnd(step, test)
   │   └─> renderTestEnd(test)
   └─> renderEnd(process)

5. Report Generation
   └─> renderSummary(stats)

6. Cleanup
   └─> (No explicit cleanup needed for adapters)
```

## 🎨 Adapter Comparison

| Feature | Modern | Ink | Minimal |
|---------|--------|-----|---------|
| **Dependencies** | 4 | 2 | 0 |
| **Colors** | ✅ Full | ✅ Full | ❌ None |
| **Unicode** | ✅ Yes | ✅ Yes | ⚠️ Limited |
| **Tables** | ✅ Yes | ✅ Yes | ❌ No |
| **Spinners** | ✅ Yes | ✅ Yes | ❌ No |
| **Interactive** | ✅ Yes | ✅ Yes | ❌ No |
| **File Size** | ~2MB | ~5MB | ~0KB |
| **Speed** | Fast | Medium | Fastest |
| **CI/CD** | ✅ Good | ⚠️ OK | ✅ Perfect |
| **Development** | ✅ Perfect | ✅ Great | ⚠️ Basic |

## 🔗 Related Documentation

- [Getting Started](./getting-started.md)
- [Plugin System](./plugin-system.md)
- [API Reference](./api-reference.md)
- [Architecture](./architecture.md)

## 📚 Advanced Topics

### Environment Detection

```javascript
function detectEnvironment() {
    return {
        ci: !!process.env.CI,
        tty: process.stdout.isTTY,
        colorSupport: process.stdout.isTTY && process.env.TERM !== 'dumb',
        unicode: process.env.LANG?.includes('UTF-8')
    };
}

const env = detectEnvironment();
const adapterType = env.ci ? 'minimal' : 'modern';
```

### Performance Considerations

```javascript
// For large test suites, minimize output
const renderer = new RendererPlugin({
    adapterType: 'minimal',  // Faster than modern
    adapterOptions: {
        verbose: false,       // Only show summary
        quiet: true           // Suppress step output
    }
});
```

### Custom Output Streams

```javascript
import fs from 'fs';

class FileAdapter extends MinimalAdapter {
    constructor(options = {}) {
        super(options);
        this.stream = fs.createWriteStream(options.outputFile);
    }

    renderSummary(stats) {
        this.stream.write(JSON.stringify(stats, null, 2));
        this.stream.end();
    }
}
```

---

For more examples, see `examples/adapter-demo.js`.
