# Architecture

Comprehensive overview of NTester's architecture, design patterns, and internal workings.

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Core Components](#core-components)
- [Plugin System](#plugin-system)
- [Adapter System](#adapter-system)
- [Data Flow](#data-flow)
- [Design Patterns](#design-patterns)
- [Extension Points](#extension-points)

## 🎯 Overview

NTester is built with a modular, extensible architecture that separates concerns and allows for easy customization without modifying core code.

### Key Principles

1. **Modularity**: Loosely coupled components
2. **Extensibility**: Plugin-based architecture
3. **Flexibility**: Multiple rendering strategies
4. **Async-First**: All operations are async
5. **Zero Config**: Works out of the box
6. **Type Safety**: Clear contracts and interfaces

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Code                           │
│                    (Test Definitions)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      NTester API                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │  NTester   │  │ it() API   │  │  Plugin Manager    │   │
│  │   Class    │  │ (fluent)   │  │   (singleton)      │   │
│  └────────────┘  └────────────┘  └────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                       Core Layer                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │  Process   │  │   Engine   │  │      Logger        │   │
│  │            │  │            │  │                    │   │
│  └────────────┘  └────────────┘  └────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Plugins   │ │  Adapters   │ │   Reports   │
│             │ │             │ │             │
│ Renderer    │ │ Modern      │ │ HTML        │
│ Reporter    │ │ Ink         │ │ JSON        │
│ Server      │ │ Minimal     │ │ Terminal    │
│ Hook        │ │ Custom      │ │ Custom      │
└─────────────┘ └─────────────┘ └─────────────┘
```

## 🔧 Core Components

### 1. NTester Class

**Location**: `app/NTester.js`

Main entry point for creating test suites.

**Responsibilities**:
- Test suite creation and management
- Step registration
- Sub-test nesting
- Plugin initialization
- Test execution orchestration

**Key Methods**:
- `constructor(name, metadata)` - Create test suite
- `addStep(id, callback, metadata)` - Add test step
- `addSubTest(subTest)` - Add nested test
- `run()` - Execute tests
- `console()` - Render output
- `initPlugins()` - Initialize plugins

**Relationships**:
- Uses `Process` to create execution context
- Uses `Engine` to run tests
- Uses `Logger` to generate output
- Uses `PluginManager` for extensions

### 2. Process

**Location**: `app/process.js`

Represents test execution state and hierarchy.

**Responsibilities**:
- State management
- Execution tracking
- Result aggregation
- Plugin hook invocation
- Async orchestration

**Key Properties**:
- `name` - Test name
- `steps` - Test steps array
- `subTests` - Nested tests array
- `passed` / `failed` - Status flags
- `metadata` - Test metadata
- `startTime` / `endTime` - Timing

**Key Methods**:
- `run()` - Execute test process
- `console()` - Render output
- `initPlugins()` - Plugin initialization
- Internal state management

### 3. Engine

**Location**: `app/engine.js`

Test execution engine.

**Responsibilities**:
- Step execution
- Error handling
- Async coordination
- State updates
- Result tracking

**Key Functions**:
- `run(process)` - Execute test process
- Step iteration and execution
- Promise handling
- Exception catching

### 4. Logger

**Location**: `app/logger.js`

Log generation and formatting.

**Responsibilities**:
- Result formatting
- Statistics calculation
- Output generation
- Console rendering

**Key Functions**:
- `generateLog(process)` - Create log object
- `consoleOutput()` - Output to console
- `getStats()` - Calculate statistics
- `toJSON()` - JSON serialization

### 5. it() API

**Location**: `app/it.js`

Fluent assertion interface.

**Responsibilities**:
- Value assertions
- Type checking
- Logical operations
- Promise handling
- Error reporting

**Features**:
- Chainable API
- AND/OR/NOT logic
- Async support
- Custom messages
- Deep equality

## 🔌 Plugin System

### Architecture

```
┌────────────────────────────────────────────┐
│          PluginManager (Singleton)         │
│  ┌──────────────────────────────────────┐ │
│  │      Registered Plugins Map          │ │
│  │  'renderer' → RendererPlugin         │ │
│  │  'html-export' → HTMLExportPlugin    │ │
│  │  'html-server' → HTMLServerPlugin    │ │
│  │  'custom' → CustomPlugin             │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ AbstractPlugin Implementations              │
│                                              │
│  Lifecycle Hooks:                           │
│  • onInit(context)                          │
│  • onBeforeRun(process)                     │
│  • onBeforeTest(process)                    │
│  • onBeforeStep(step, process)              │
│  • onAfterStep(step, process)               │
│  • onAfterTest(process)                     │
│  • onAfterRun(process)                      │
│  • onReport(process)                        │
│  • onDestroy()                              │
└─────────────────────────────────────────────┘
```

### Plugin Types

1. **RendererPlugin**: Terminal output
2. **ReporterPlugin**: Report generation
3. **ServerPlugin**: Server functionality
4. **Hook**: Custom extensions

### Lifecycle

```
1. Plugin Registration
   └─> manager.register(name, plugin, type)

2. Plugin Initialization
   └─> await manager.initAll(context)
       └─> plugin.onInit(context)

3. Test Execution
   ├─> onBeforeRun(process)
   │
   ├─> For each test:
   │   ├─> onBeforeTest(test)
   │   ├─> For each step:
   │   │   ├─> onBeforeStep(step, test)
   │   │   └─> onAfterStep(step, test)
   │   └─> onAfterTest(test)
   │
   └─> onAfterRun(process)

4. Report Generation
   └─> onReport(process)

5. Cleanup
   └─> onDestroy()
```

## 🎨 Adapter System

### Architecture

```
┌────────────────────────────────────────────┐
│           AdapterFactory                   │
│                                            │
│  createAdapter(type, options)              │
│                                            │
│  Adapters:                                 │
│  • 'modern' → ModernAdapter                │
│  • 'ink' → InkAdapter                      │
│  • 'minimal' → MinimalAdapter              │
│  • 'auto' → Auto-detect                    │
└────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Modern    │ │     Ink     │ │   Minimal   │
│             │ │             │ │             │
│ chalk       │ │ ink         │ │ console.log │
│ cli-table3  │ │ react       │ │             │
│ ora         │ │             │ │ (no deps)   │
│ inquirer    │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Adapter Interface

All adapters implement the same interface:

```javascript
interface Adapter {
    renderStart(process): void
    renderTestStart(process): void
    renderTestEnd(process): void
    renderStepStart(step, process): void
    renderStepEnd(step, process): void
    renderEnd(process): void
    renderSummary(stats): void
    renderError(error, context): void
}
```

### Auto-Detection Strategy

```javascript
1. Check for Modern Stack
   └─> Try require('chalk')
       └─> Success: ModernAdapter
       └─> Fail: Next

2. Check for Ink
   └─> Try require('ink')
       └─> Success: InkAdapter
       └─> Fail: Next

3. Fallback to Minimal
   └─> MinimalAdapter (always available)
```

## 📊 Data Flow

### Test Execution Flow

```
User Code
    │
    ├─> new NTester('Test')
    │      └─> Creates Process
    │
    ├─> test.addStep(...)
    │      └─> Adds to Process.steps
    │
    ├─> await test.initPlugins()
    │      └─> PluginManager.initAll(context)
    │             └─> plugin.onInit(context)
    │
    ├─> await test.run()
    │      │
    │      ├─> PluginManager.executeHook('onBeforeRun', process)
    │      │
    │      ├─> Engine.run(process)
    │      │      │
    │      │      ├─> For each step:
    │      │      │   ├─> executeHook('onBeforeStep', step, process)
    │      │      │   ├─> Execute step.callback()
    │      │      │   │      └─> it() assertions
    │      │      │   └─> executeHook('onAfterStep', step, process)
    │      │      │
    │      │      └─> For each subTest:
    │      │             └─> Recursive run(subTest)
    │      │
    │      └─> PluginManager.executeHook('onAfterRun', process)
    │
    └─> await test.console()
           │
           ├─> PluginManager.executeHook('onReport', process)
           │      └─> RendererPlugin renders output
           │      └─> HTMLExportPlugin generates report
           │
           └─> Logger.generateLog(process).consoleOutput()
```

### Plugin Hook Flow

```
Test Lifecycle Event
    │
    └─> PluginManager.executeHook(hookName, ...args)
           │
           ├─> For each registered plugin:
           │      │
           │      ├─> Check if plugin.isEnabled()
           │      │
           │      ├─> Check if plugin[hookName] exists
           │      │
           │      └─> await plugin[hookName](...args)
           │             │
           │             └─> Plugin processes event
           │                    └─> May modify state
           │                    └─> May generate output
           │                    └─> May call other plugins
           │
           └─> Continue to next plugin
```

## 🎭 Design Patterns

### 1. Singleton Pattern

**Used in**: PluginManager

```javascript
let instance = null;

export function getPluginManager() {
    if (!instance) {
        instance = new PluginManager();
    }
    return instance;
}
```

**Purpose**: Single plugin registry across application

### 2. Factory Pattern

**Used in**: AdapterFactory

```javascript
export function createAdapter(type, options) {
    switch (type) {
        case 'modern': return new ModernAdapter(options);
        case 'ink': return new InkAdapter(options);
        case 'minimal': return new MinimalAdapter(options);
        case 'auto': return detectBestAdapter(options);
        default: throw new Error(`Unknown adapter: ${type}`);
    }
}
```

**Purpose**: Adapter creation and auto-detection

### 3. Strategy Pattern

**Used in**: Adapter System

Different rendering strategies (Modern, Ink, Minimal) implementing the same interface.

**Purpose**: Interchangeable rendering algorithms

### 4. Observer Pattern

**Used in**: Plugin System

Plugins observe test lifecycle events via hooks.

**Purpose**: Decoupled event handling

### 5. Builder Pattern

**Used in**: it() API

```javascript
it(value)
    .number()
    .and.greaterThan(0)
    .and.lessThan(100)
```

**Purpose**: Fluent assertion building

### 6. Composite Pattern

**Used in**: Test Hierarchy

```javascript
NTester
    └─> NTester (sub-test)
        └─> NTester (sub-sub-test)
```

**Purpose**: Tree structure for nested tests

### 7. Template Method Pattern

**Used in**: AbstractPlugin

Base class defines structure, subclasses implement details.

**Purpose**: Plugin lifecycle consistency

## 🔗 Extension Points

### 1. Custom Plugins

Extend `AbstractPlugin`:

```javascript
import AbstractPlugin from './app/plugins/AbstractPlugin.js';

export default class MyPlugin extends AbstractPlugin {
    async onAfterRun(process) {
        // Custom logic
    }
}
```

### 2. Custom Adapters

Implement adapter interface:

```javascript
export default class MyAdapter {
    renderStart(process) { }
    renderTestStart(process) { }
    renderTestEnd(process) { }
    renderStepStart(step, process) { }
    renderStepEnd(step, process) { }
    renderEnd(process) { }
    renderSummary(stats) { }
    renderError(error, context) { }
}
```

### 3. Custom Assertions

Extend `it()` API:

```javascript
import it from './app/it.js';

it.customAssertion = function(expected) {
    // Custom assertion logic
    return this;
};
```

### 4. Custom Reporters

Extend `ReporterPlugin`:

```javascript
import { ReporterPlugin } from './app/plugins/AbstractPlugin.js';

export default class MyReporter extends ReporterPlugin {
    async onReport(process) {
        // Generate custom report
    }
}
```

## 🔄 Async Architecture

### Promise-Based Execution

All test operations are async:

```javascript
// Plugin hooks
async onBeforeRun(process) { ... }

// Test execution
async run() { ... }

// Step execution
async function executeStep(step) { ... }
```

### Await Chain

```javascript
await test.initPlugins();
await test.run();
await test.console();
```

### Parallel Execution

Sub-tests can potentially run in parallel (future feature):

```javascript
await Promise.all(
    subTests.map(subTest => subTest.run())
);
```

## 📦 Module Structure

```
NTester/
├── app/
│   ├── NTester.js          # Main class
│   ├── process.js          # Execution state
│   ├── engine.js           # Test runner
│   ├── logger.js           # Output formatter
│   ├── it.js               # Assertion API
│   │
│   ├── plugins/
│   │   ├── AbstractPlugin.js      # Base class
│   │   ├── PluginManager.js       # Plugin registry
│   │   ├── RendererPlugin.js      # Terminal renderer
│   │   ├── HTMLExportPlugin.js    # HTML generator
│   │   ├── HTMLServerPlugin.js    # Dev server
│   │   ├── index.js               # Public exports
│   │   └── README.md              # Plugin docs
│   │
│   └── adapters/
│       ├── AdapterFactory.js      # Factory
│       ├── ModernAdapter.js       # Modern stack
│       ├── InkAdapter.js          # Ink renderer
│       ├── MinimalAdapter.js      # Minimal output
│       └── README.md              # Adapter docs
│
├── examples/
│   ├── simple-demo.js             # Basic usage
│   ├── advanced-demo.js           # Advanced features
│   ├── plugins-demo.js            # Plugin system
│   └── adapter-demo.js            # Adapters
│
├── tests/
│   ├── unit-tests.js              # Core tests
│   ├── plugins-test.js            # Plugin tests
│   └── adapter-test.js            # Adapter tests
│
└── docs/
    ├── getting-started.md
    ├── plugin-system.md
    ├── adapter-system.md
    ├── api-reference.md
    ├── architecture.md
    ├── ux-features.md
    └── contributing.md
```

## 🔐 Error Handling

### Error Propagation

```
Step Error
    │
    ├─> Caught by Engine
    │      └─> Stored in step.error
    │      └─> step.passed = false
    │
    ├─> Plugin: onAfterStep(step, process)
    │      └─> Can inspect step.error
    │
    ├─> Test marked as failed
    │      └─> process.failed = true
    │
    └─> Rendered by Logger/Plugins
           └─> Error details displayed
```

### Plugin Error Isolation

```javascript
async executeHook(hookName, ...args) {
    for (const [name, plugin] of this.plugins.entries()) {
        try {
            await plugin[hookName](...args);
        } catch (error) {
            console.error(`Plugin ${name} error:`, error);
            // Continue with other plugins
        }
    }
}
```

## 🚀 Performance Considerations

### Lazy Loading

Adapters load dependencies only when needed:

```javascript
async function loadModernStack() {
    const chalk = await import('chalk');
    const Table = await import('cli-table3');
    // ...
}
```

### Minimal Mode

Zero-dependency mode for maximum performance:

```javascript
const renderer = new RendererPlugin({ adapterType: 'minimal' });
```

### Plugin Selective Execution

Only enabled plugins execute:

```javascript
if (plugin.isEnabled()) {
    await plugin[hookName](...args);
}
```

## 🔗 Related Documentation

- [Getting Started](./getting-started.md)
- [Plugin System](./plugin-system.md)
- [Adapter System](./adapter-system.md)
- [API Reference](./api-reference.md)
- [UX Features](./ux-features.md)
- [Contributing](./contributing.md)

---

This architecture enables NTester to be flexible, extensible, and maintainable while keeping the core simple and focused.
