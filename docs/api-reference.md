# API Reference

Complete API documentation for NTester.

## 📋 Table of Contents

- [NTester Class](#ntester-class)
- [it() Assertion API](#it-assertion-api)
- [Plugin System API](#plugin-system-api)
- [Adapter API](#adapter-api)
- [Process API](#process-api)
- [Logger API](#logger-api)
- [Engine API](#engine-api)

## 🧪 NTester Class

Main test suite class.

### Constructor

```javascript
new NTester(name, metadata = {})
```

**Parameters**:
- `name` (string) - Test suite name
- `metadata` (object) - Optional metadata
  - `project` (string) - Project name
  - `version` (string) - Project version
  - `author` (string) - Author name
  - `description` (string) - Suite description
  - `tags` (array) - Tags for categorization
  - `section` (string) - Section name for grouping

**Returns**: NTester instance

**Example**:
```javascript
const test = new NTester('My Test Suite', {
    project: 'MyApp',
    version: '1.0.0',
    author: 'John Doe',
    description: 'Test suite for core functionality',
    tags: ['unit', 'core'],
    section: 'Core Tests'
});
```

### Methods

#### addStep(id, callback, metadata)

Adds a test step.

```javascript
test.addStep(id, callback, metadata = {})
```

**Parameters**:
- `id` (string) - Unique step identifier
- `callback` (function) - Test function
- `metadata` (object) - Optional metadata
  - `name` (string) - Step name
  - `description` (string) - Step description
  - `timeout` (number) - Timeout in ms
  - `retry` (number) - Retry attempts
  - `skip` (boolean) - Skip this step
  - `only` (boolean) - Run only this step

**Returns**: NTester instance (chainable)

**Example**:
```javascript
test.addStep('validation-test', function () {
    it(42).number().and.equal(42);
}, {
    name: 'Validate number type',
    description: 'Ensures value is a number',
    timeout: 5000,
    retry: 3
});
```

#### addSubTest(subTest)

Adds a nested test suite.

```javascript
test.addSubTest(subTest)
```

**Parameters**:
- `subTest` (NTester) - Sub-test suite instance

**Returns**: NTester instance (chainable)

**Example**:
```javascript
const mainTest = new NTester('Main Suite');
const subTest = new NTester('Sub Suite');

subTest.addStep('test-1', function () {
    it(1).equal(1);
});

mainTest.addSubTest(subTest);
```

#### run()

Executes the test suite.

```javascript
async test.run()
```

**Returns**: Promise<NTester> - The test instance

**Example**:
```javascript
const result = await test.run();
console.log(`Passed: ${result.passed}`);
```

#### console()

Renders test results to console.

```javascript
async test.console()
```

**Returns**: Promise<NTester> - The test instance

**Example**:
```javascript
await test.run();
await test.console();
```

#### initPlugins()

Initializes registered plugins with context.

```javascript
async test.initPlugins()
```

**Returns**: Promise<NTester> - The test instance

**Example**:
```javascript
const test = new NTester('My Test');
await test.initPlugins();
await test.run();
```

#### getMetadata()

Gets test metadata.

```javascript
test.getMetadata()
```

**Returns**: object - Metadata object

**Example**:
```javascript
const meta = test.getMetadata();
console.log(meta.project, meta.version);
```

#### getName()

Gets test name.

```javascript
test.getName()
```

**Returns**: string - Test name

#### getSteps()

Gets all test steps.

```javascript
test.getSteps()
```

**Returns**: array - Array of step objects

#### getSubTests()

Gets all sub-tests.

```javascript
test.getSubTests()
```

**Returns**: array - Array of NTester instances

### Properties

- `name` (string) - Test suite name
- `passed` (boolean) - Whether all tests passed
- `failed` (boolean) - Whether any test failed
- `steps` (array) - Array of test steps
- `subTests` (array) - Array of sub-tests
- `metadata` (object) - Test metadata

## 🎯 it() Assertion API

Fluent assertion interface.

### Type Assertions

#### number()

Asserts value is a number.

```javascript
it(value).number()
```

**Example**:
```javascript
it(42).number();
it(3.14).number();
it(NaN).number();  // Passes (NaN is typeof number)
```

#### string()

Asserts value is a string.

```javascript
it(value).string()
```

**Example**:
```javascript
it('hello').string();
it('').string();
it(`template`).string();
```

#### boolean()

Asserts value is a boolean.

```javascript
it(value).boolean()
```

**Example**:
```javascript
it(true).boolean();
it(false).boolean();
```

#### array()

Asserts value is an array.

```javascript
it(value).array()
```

**Example**:
```javascript
it([1, 2, 3]).array();
it([]).array();
it(new Array(5)).array();
```

#### object()

Asserts value is an object.

```javascript
it(value).object()
```

**Example**:
```javascript
it({ key: 'value' }).object();
it({}).object();
it(new Object()).object();
```

#### function()

Asserts value is a function.

```javascript
it(value).function()
```

**Example**:
```javascript
it(() => {}).function();
it(function() {}).function();
it(async () => {}).function();
```

#### undefined()

Asserts value is undefined.

```javascript
it(value).undefined()
```

**Example**:
```javascript
it(undefined).undefined();
let x;
it(x).undefined();
```

#### null()

Asserts value is null.

```javascript
it(value).null()
```

**Example**:
```javascript
it(null).null();
```

### Value Assertions

#### equal(expected)

Asserts value equals expected (deep equality).

```javascript
it(value).equal(expected)
```

**Example**:
```javascript
it(5).equal(5);
it('hello').equal('hello');
it([1, 2]).equal([1, 2]);
it({ a: 1 }).equal({ a: 1 });
```

#### greaterThan(value)

Asserts value is greater than given value.

```javascript
it(value).greaterThan(threshold)
```

**Example**:
```javascript
it(10).greaterThan(5);
it(3.14).greaterThan(3);
```

#### lessThan(value)

Asserts value is less than given value.

```javascript
it(value).lessThan(threshold)
```

**Example**:
```javascript
it(5).lessThan(10);
it(2.5).lessThan(3);
```

#### contain(element)

Asserts value contains element (arrays/strings).

```javascript
it(value).contain(element)
```

**Example**:
```javascript
it([1, 2, 3]).contain(2);
it('hello world').contain('world');
it('test').contain('es');
```

#### length(expected)

Asserts value has expected length (arrays/strings).

```javascript
it(value).length(expected)
```

**Example**:
```javascript
it([1, 2, 3]).length(3);
it('hello').length(5);
it('').length(0);
```

### Logical Operators

#### and

Chains assertions with AND logic.

```javascript
it(value).assertion1().and.assertion2()
```

**Example**:
```javascript
it(5).number().and.equal(5);
it(10).greaterThan(5).and.lessThan(15);
it('test').string().and.contain('es').and.length(4);
```

#### or

Chains assertions with OR logic.

```javascript
it(value).assertion1().or.assertion2()
```

**Example**:
```javascript
it(7).greaterThan(10).or.lessThan(8);  // Passes (7 < 8)
it('test').equal('demo').or.contain('es');  // Passes (contains 'es')
```

#### not

Negates the next assertion.

```javascript
it(value).not.assertion()
```

**Example**:
```javascript
it(5).not.equal(10);
it('test').not.number();
it([1, 2]).not.contain(3);
it(null).not.undefined();
```

### Async Operations

#### awaitResult()

Waits for promise resolution before asserting.

```javascript
it(promise).awaitResult().assertion()
```

**Example**:
```javascript
const promise = Promise.resolve(42);
it(promise).awaitResult().number().and.equal(42);

async function fetchData() {
    return { status: 'ok' };
}
it(fetchData()).awaitResult().object();
```

### Utility Methods

#### it.message(text)

Adds a custom message to test output.

```javascript
it.message(text)
```

**Example**:
```javascript
it.message('✓ All validations passed');
it.message('Testing user authentication...');
```

#### it.log(data)

Logs data during test execution.

```javascript
it.log(...data)
```

**Example**:
```javascript
it.log('Current value:', 42);
it.log({ user: 'john', age: 30 });
```

#### it.skip(reason)

Skips the current test.

```javascript
it.skip(reason)
```

**Example**:
```javascript
it.skip('Feature not implemented yet');
```

#### it.todo(description)

Marks a test as TODO.

```javascript
it.todo(description)
```

**Example**:
```javascript
it.todo('Add validation for edge cases');
```

## 🔌 Plugin System API

### AbstractPlugin

Base class for all plugins.

```javascript
import AbstractPlugin from './app/plugins/AbstractPlugin.js';

class MyPlugin extends AbstractPlugin {
    async onInit(context) { }
    async onBeforeRun(process) { }
    async onAfterRun(process) { }
    async onReport(process) { }
    async onDestroy() { }
}
```

**Lifecycle Hooks**:
- `onInit(context)` - Plugin initialization
- `onBeforeRun(process)` - Before test suite runs
- `onBeforeTest(process)` - Before each test
- `onBeforeStep(step, process)` - Before each step
- `onAfterStep(step, process)` - After each step
- `onAfterTest(process)` - After each test
- `onAfterRun(process)` - After test suite completes
- `onReport(process)` - Report generation
- `onDestroy()` - Cleanup

**Methods**:
- `enable()` - Enable plugin
- `disable()` - Disable plugin
- `isEnabled()` - Check if enabled
- `getType()` - Get plugin type
- `getContext()` - Get plugin context

### PluginManager

Central plugin management.

```javascript
import { getPluginManager } from './app/plugins/PluginManager.js';

const manager = getPluginManager();
```

**Methods**:

#### register(name, plugin, type)

```javascript
manager.register(name, plugin, type = 'hook')
```

**Parameters**:
- `name` (string) - Plugin name
- `plugin` (AbstractPlugin) - Plugin instance
- `type` (string) - Plugin type ('renderer', 'reporter', 'server', 'hook')

**Example**:
```javascript
manager.register('my-plugin', new MyPlugin(), 'hook');
```

#### get(name)

```javascript
manager.get(name)
```

**Returns**: AbstractPlugin or undefined

#### has(name)

```javascript
manager.has(name)
```

**Returns**: boolean

#### unregister(name)

```javascript
manager.unregister(name)
```

#### enable(name) / disable(name)

```javascript
manager.enable(name)
manager.disable(name)
```

#### initAll(context)

```javascript
await manager.initAll(context)
```

#### executeHook(hookName, ...args)

```javascript
await manager.executeHook('onBeforeRun', process)
```

#### destroyAll()

```javascript
await manager.destroyAll()
```

#### list()

```javascript
manager.list()
```

**Returns**: array of plugin info objects

#### getStats()

```javascript
manager.getStats()
```

**Returns**: object with statistics

### RendererPlugin

Terminal rendering plugin.

```javascript
import RendererPlugin from './app/plugins/RendererPlugin.js';

const renderer = new RendererPlugin({
    adapterType: 'modern',  // 'modern', 'ink', 'minimal', 'auto'
    adapterOptions: {
        colors: true
    }
});
```

### HTMLExportPlugin

HTML report generator.

```javascript
import HTMLExportPlugin from './app/plugins/HTMLExportPlugin.js';

const htmlExport = new HTMLExportPlugin({
    outputPath: './report.html',
    title: 'Test Report',
    includeStats: true,
    includeTimestamps: true
});
```

### HTMLServerPlugin

Development server with live reload.

```javascript
import HTMLServerPlugin from './app/plugins/HTMLServerPlugin.js';

const server = new HTMLServerPlugin({
    htmlFile: './report.html',
    port: 3000,
    autoRerun: false,
    watchInterval: 500
});

await server.start();
console.log(server.getURL());
await server.stop();
```

**Methods**:
- `start()` - Start server
- `stop()` - Stop server
- `getURL()` - Get server URL
- `notifyClients(message)` - Send SSE message

## 🎨 Adapter API

### AdapterFactory

Creates adapter instances.

```javascript
import { createAdapter } from './app/adapters/AdapterFactory.js';

const adapter = createAdapter('modern', options);
```

**Parameters**:
- `type` (string) - Adapter type ('modern', 'ink', 'minimal', 'auto')
- `options` (object) - Adapter-specific options

### Adapter Interface

All adapters implement:

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

## 📊 Process API

Test process object structure:

```javascript
{
    name: string,              // Test name
    passed: boolean,           // Pass status
    failed: boolean,           // Fail status
    steps: array,              // Test steps
    subTests: array,           // Sub-tests
    metadata: object,          // Metadata
    startTime: number,         // Start timestamp
    endTime: number,           // End timestamp
    duration: number           // Duration in ms
}
```

### Step Object

```javascript
{
    id: string,                // Step ID
    name: string,              // Step name
    passed: boolean,           // Pass status
    failed: boolean,           // Fail status
    callback: function,        // Test function
    metadata: object,          // Step metadata
    error: Error,              // Error if failed
    startTime: number,         // Start timestamp
    endTime: number,           // End timestamp
    duration: number           // Duration in ms
}
```

## 📝 Logger API

### generateLog(process)

Generates log from test process.

```javascript
import logger from './app/logger.js';

const log = logger.generateLog(process);
```

**Returns**: Log object with methods:
- `consoleOutput()` - Output to console
- `getStats()` - Get statistics
- `toJSON()` - Convert to JSON
- `toString()` - Convert to string

## ⚙️ Engine API

Test execution engine.

### run(process)

Executes test process.

```javascript
import engine from './app/engine.js';

await engine.run(process);
```

## 🔧 Utility Functions

### Helper Functions

#### registerPlugin(name, plugin, type)

Quick plugin registration.

```javascript
import { registerPlugin } from './app/plugins/index.js';

registerPlugin('my-plugin', new MyPlugin(), 'hook');
```

#### initPlugins(context)

Initialize all plugins.

```javascript
import { initPlugins } from './app/plugins/index.js';

await initPlugins(context);
```

#### createDefaultPlugins(options)

Creates default plugin configuration.

```javascript
import { createDefaultPlugins } from './app/plugins/index.js';

const { manager, plugins } = await createDefaultPlugins({
    renderer: true,
    rendererType: 'modern',
    htmlExport: true,
    htmlPath: './report.html',
    htmlServer: false,
    serverPort: 3000
});
```

## 📚 Type Definitions

### PluginTypes

```javascript
const PluginTypes = {
    HOOK: 'hook',
    RENDERER: 'renderer',
    REPORTER: 'reporter',
    SERVER: 'server'
};
```

### Metadata Object

```javascript
{
    project: string,
    version: string,
    author: string,
    description: string,
    tags: string[],
    section: string,
    [key: string]: any
}
```

### Statistics Object

```javascript
{
    total: number,
    passed: number,
    failed: number,
    skipped: number,
    duration: number,
    successRate: number,
    timestamp: number
}
```

## 🔗 Related Documentation

- [Getting Started](./getting-started.md)
- [Plugin System](./plugin-system.md)
- [Adapter System](./adapter-system.md)
- [Architecture](./architecture.md)
- [UX Features](./ux-features.md)

---

**Note**: All async methods return Promises and should be awaited.
