# Getting Started with NTester

Welcome to NTester! This guide will help you get up and running with NTester's powerful testing framework.

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/NTester.git
cd NTester

# Install dependencies
npm install
```

## 🚀 Quick Start

### Your First Test

Create a simple test file `my-first-test.js`:

```javascript
#!/usr/bin/env node

import { it, NTester } from './app/NTester.js';

// Create a test suite
const test = new NTester('My First Test Suite', {
    project: 'MyProject',
    version: '1.0.0',
    author: 'Your Name'
});

// Add a test step
test.addStep('basic-validation', function () {
    it(42).number().and.equal(42);
    it('hello').string().and.contain('ell');
    it(true).boolean().and.equal(true);
    it.message('✓ All basic validations passed');
}, {
    name: 'Test basic type validations'
});

// Run the test
(async () => {
    const result = await test.run();
    await result.console();
})();
```

Run your test:

```bash
chmod +x my-first-test.js
./my-first-test.js
```

## 📝 Core Concepts

### Test Suites

A test suite is created using the `NTester` class:

```javascript
const test = new NTester('Suite Name', {
    project: 'Project Name',
    version: '1.0.0',
    author: 'Author Name',
    description: 'Optional description'
});
```

### Test Steps

Add individual test steps using `addStep()`:

```javascript
test.addStep('step-id', function () {
    // Your test logic here
}, {
    name: 'Descriptive step name',
    description: 'Optional step description'
});
```

### Assertions with `it()`

NTester provides a fluent assertion API:

```javascript
// Type validations
it(42).number();
it('hello').string();
it(true).boolean();
it([1, 2, 3]).array();
it({ name: 'test' }).object();

// Value comparisons
it(5).equal(5);
it(10).greaterThan(5);
it(3).lessThan(10);
it('hello world').contain('world');
it([1, 2, 3]).length(3);

// Logical operators
it(5).greaterThan(3).and.lessThan(10);  // AND
it(7).greaterThan(10).or.lessThan(8);   // OR
it(5).not.equal(10);                     // NOT

// Async operations
it(Promise.resolve(42)).awaitResult().equal(42);
```

### Nested Test Suites

Create hierarchical test structures:

```javascript
const mainTest = new NTester('Main Suite');

const subTest1 = new NTester('Sub Suite 1');
subTest1.addStep('test-1', function () {
    it(1).equal(1);
});

const subTest2 = new NTester('Sub Suite 2');
subTest2.addStep('test-2', function () {
    it(2).equal(2);
});

mainTest.addSubTest(subTest1);
mainTest.addSubTest(subTest2);
```

## 🎨 Terminal Rendering

NTester supports multiple terminal adapters for different rendering styles:

### Modern Adapter (Default)

Uses modern terminal libraries (chalk, cli-table3, ora, inquirer):

```javascript
import { NTester } from './app/NTester.js';
import { getPluginManager } from './app/plugins/PluginManager.js';
import RendererPlugin from './app/plugins/RendererPlugin.js';

const manager = getPluginManager();
manager.register('renderer', new RendererPlugin({
    adapterType: 'modern',
    adapterOptions: { colors: true }
}));

const test = new NTester('My Test');
await test.initPlugins();
await test.run();
```

### Ink Adapter

React-based terminal interface:

```javascript
manager.register('renderer', new RendererPlugin({
    adapterType: 'ink'
}));
```

### Minimal Adapter

Basic console.log output (no dependencies):

```javascript
manager.register('renderer', new RendererPlugin({
    adapterType: 'minimal'
}));
```

### Auto Detection

Let NTester choose the best available adapter:

```javascript
manager.register('renderer', new RendererPlugin({
    adapterType: 'auto'
}));
```

## 📊 HTML Reports

Generate beautiful HTML reports:

```javascript
import HTMLExportPlugin from './app/plugins/HTMLExportPlugin.js';

const htmlExport = new HTMLExportPlugin({
    outputPath: './test-report.html',
    title: 'My Test Report'
});

manager.register('html-export', htmlExport, 'reporter');

// After test execution, report is automatically generated
```

Features:
- 🌙 Dark mode toggle
- 🔍 Real-time search
- 📋 Interactive filters (All/Passed/Failed)
- 📊 Animated progress bars
- 🖨️ Print-friendly styles

## 🌐 Live Development Server

Run tests with live reload:

```javascript
import HTMLServerPlugin from './app/plugins/HTMLServerPlugin.js';

const htmlServer = new HTMLServerPlugin({
    htmlFile: './test-report.html',
    port: 3000,
    autoRerun: false
});

manager.register('html-server', htmlServer, 'server');
await htmlServer.start();

console.log(`Server running at http://localhost:3000`);
console.log(`Dashboard at http://localhost:3000/status`);
```

Features:
- 🔄 Live reload when report changes
- 📊 Real-time dashboard at `/status`
- 📈 API stats at `/api/stats`
- 👥 Connected clients tracking

## 🔌 Plugin System

NTester's plugin system allows you to extend functionality:

```javascript
import { AbstractPlugin, getPluginManager } from './app/plugins/index.js';

class MyCustomPlugin extends AbstractPlugin {
    async onBeforeRun(process) {
        console.log('Tests starting...');
    }

    async onAfterRun(process) {
        console.log('Tests completed!');
    }
}

const manager = getPluginManager();
manager.register('my-plugin', new MyCustomPlugin());
```

See [Plugin System](./plugin-system.md) for detailed documentation.

## 📚 Examples

Check out the `examples/` directory for complete working examples:

- `examples/simple-demo.js` - Basic usage
- `examples/advanced-demo.js` - Advanced features
- `examples/plugins-demo.js` - Plugin system demonstration
- `examples/adapter-demo.js` - Terminal adapters showcase

## 🔗 Next Steps

- [Plugin System Documentation](./plugin-system.md)
- [Adapter System Documentation](./adapter-system.md)
- [API Reference](./api-reference.md)
- [Architecture Overview](./architecture.md)
- [UX Features](./ux-features.md)
- [Contributing Guidelines](./contributing.md)

## 💡 Tips

1. **Use descriptive names**: Clear test and step names make debugging easier
2. **Chain assertions**: Use `.and` and `.or` for complex validations
3. **Leverage plugins**: Enable HTML export for better reporting
4. **Organize hierarchically**: Use sub-tests for logical grouping
5. **Add messages**: Use `it.message()` to provide context in test output

## ❓ Need Help?

- Check the [API Reference](./api-reference.md)
- Read the [Architecture Documentation](./architecture.md)
- See [Examples](../examples/)
- Open an issue on GitHub

Happy testing! 🎉
