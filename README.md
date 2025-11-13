# NTester

> A modern, extensible JavaScript testing framework with powerful plugins and beautiful reporting.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D14-brightgreen.svg)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](./tests)

## ✨ Features

- 🎯 **Fluent Assertion API** - Chainable, readable test syntax
- 🔌 **Plugin System** - Extend functionality without modifying core
- 🎨 **Multiple Renderers** - Modern, Ink, or Minimal terminal output
- 📊 **HTML Reports** - Beautiful, interactive reports with dark mode
- 🌐 **Live Development Server** - Real-time reload and monitoring
- 🔄 **Async-First** - Full Promise/async-await support
- 🎭 **Nested Tests** - Hierarchical test organization
- 📦 **Zero Config** - Works out of the box
- 🚀 **Zero Dependencies** - Core has no dependencies (plugins optional)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/NTester.git
cd NTester

# Optional: Install adapter dependencies
npm install chalk cli-table3 ora inquirer  # Modern adapter
npm install ink react                       # Ink adapter
# Or use minimal adapter (no dependencies)
```

## 🚀 Quick Start

Create a test file `my-test.js`:

```javascript
#!/usr/bin/env node

import { it, NTester } from './app/NTester.js';

// Create test suite
const test = new NTester('My First Test', {
    project: 'MyProject',
    version: '1.0.0',
    author: 'Your Name'
});

// Add test steps
test.addStep('basic-test', function () {
    it(42).number().and.equal(42);
    it('hello').string().and.contain('ell');
    it([1, 2, 3]).array().and.length(3);
    it.message('✓ All tests passed!');
}, {
    name: 'Test basic assertions'
});

// Run tests
(async () => {
    const result = await test.run();
    await result.console();
})();
```

Run your test:

```bash
chmod +x my-test.js
./my-test.js
```

## 🎯 Core Features

### Fluent Assertion API

Chain assertions naturally:

```javascript
// Type assertions
it(42).number();
it('test').string();
it(true).boolean();
it([1, 2]).array();
it({ key: 'value' }).object();

// Value assertions
it(5).equal(5);
it(10).greaterThan(5);
it(3).lessThan(10);
it('hello world').contain('world');
it([1, 2, 3]).length(3);

// Logical operators
it(5).number().and.equal(5);
it(7).greaterThan(10).or.lessThan(8);
it(5).not.equal(10);

// Async support
it(Promise.resolve(42)).awaitResult().equal(42);
```

### Nested Test Structure

Organize tests hierarchically:

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

await mainTest.run();
```

## 🔌 Plugin System

Extend NTester with plugins:

### Terminal Rendering

```javascript
import { getPluginManager } from './app/plugins/PluginManager.js';
import RendererPlugin from './app/plugins/RendererPlugin.js';

const manager = getPluginManager();

// Modern adapter (chalk, cli-table3, ora, inquirer)
manager.register('renderer', new RendererPlugin({
    adapterType: 'modern',
    adapterOptions: { colors: true }
}), 'renderer');

// Or Ink adapter (React-based)
manager.register('renderer', new RendererPlugin({
    adapterType: 'ink'
}), 'renderer');

// Or Minimal adapter (no dependencies)
manager.register('renderer', new RendererPlugin({
    adapterType: 'minimal'
}), 'renderer');

// Or auto-detect
manager.register('renderer', new RendererPlugin({
    adapterType: 'auto'
}), 'renderer');
```

### HTML Reports

Generate beautiful, interactive HTML reports:

```javascript
import HTMLExportPlugin from './app/plugins/HTMLExportPlugin.js';

const htmlExport = new HTMLExportPlugin({
    outputPath: './test-report.html',
    title: 'Test Report'
});

manager.register('html-export', htmlExport, 'reporter');

// After test execution
const test = new NTester('My Test');
await test.initPlugins();
await test.run();
await test.console();

// HTML report automatically generated at ./test-report.html
```

**HTML Report Features**:
- 🌙 Dark mode toggle
- 🔍 Real-time search
- 📋 Interactive filters (All/Passed/Failed)
- 📊 Animated progress bars
- 🎨 Modern responsive design
- 🖨️ Print-friendly styles

### Development Server

Live development with auto-reload:

```javascript
import HTMLServerPlugin from './app/plugins/HTMLServerPlugin.js';

const server = new HTMLServerPlugin({
    htmlFile: './test-report.html',
    port: 3000,
    autoRerun: false
});

manager.register('html-server', server, 'server');
await server.start();

console.log(`Server: http://localhost:3000`);
console.log(`Dashboard: http://localhost:3000/status`);
```

**Server Features**:
- 🔄 Live reload via Server-Sent Events
- 📊 Real-time dashboard at `/status`
- 📈 API stats at `/api/stats`
- 👥 Connected clients tracking

### Custom Plugins

Create your own plugins:

```javascript
import AbstractPlugin from './app/plugins/AbstractPlugin.js';

export default class MyPlugin extends AbstractPlugin {
    async onBeforeRun(process) {
        console.log('Tests starting...');
    }

    async onAfterRun(process) {
        console.log('Tests completed!');
    }
}

manager.register('my-plugin', new MyPlugin());
```

## 🎨 Multiple Terminal Adapters

Choose your preferred terminal rendering:

### Modern Adapter

Feature-rich output with colors, tables, and spinners:

```javascript
// Dependencies: chalk, cli-table3, ora, inquirer
const renderer = new RendererPlugin({ adapterType: 'modern' });
```

### Ink Adapter

React-based terminal UI:

```javascript
// Dependencies: ink, react
const renderer = new RendererPlugin({ adapterType: 'ink' });
```

### Minimal Adapter

Zero dependencies, pure console.log:

```javascript
// No dependencies required
const renderer = new RendererPlugin({ adapterType: 'minimal' });
```

### Auto Adapter

Automatically selects best available adapter:

```javascript
// Tries Modern → Ink → Minimal
const renderer = new RendererPlugin({ adapterType: 'auto' });
```

## 📚 Examples

Check out the `examples/` directory:

```bash
# Basic usage
node examples/simple-demo.js

# Advanced features
node examples/advanced-demo.js

# Plugin system
node examples/plugins-demo.js

# Adapter showcase
node examples/adapter-demo.js
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run specific test
node tests/unit-tests.js
node tests/plugins-test.js
```

## 📖 Documentation

Comprehensive documentation in the `docs/` directory:

- **[Getting Started](./docs/getting-started.md)** - Installation and basic usage
- **[Plugin System](./docs/plugin-system.md)** - Creating and using plugins
- **[Adapter System](./docs/adapter-system.md)** - Terminal rendering adapters
- **[API Reference](./docs/api-reference.md)** - Complete API documentation
- **[Architecture](./docs/architecture.md)** - System architecture and design
- **[UX Features](./docs/ux-features.md)** - HTML report and server features
- **[Contributing](./docs/contributing.md)** - How to contribute

## 🎯 Use Cases

### Unit Testing

```javascript
const test = new NTester('Math Utils');

test.addStep('addition', function () {
    it(add(2, 3)).equal(5);
    it(add(0, 0)).equal(0);
    it(add(-1, 1)).equal(0);
});

test.addStep('multiplication', function () {
    it(multiply(2, 3)).equal(6);
    it(multiply(5, 0)).equal(0);
});

await test.run();
```

### Integration Testing

```javascript
const test = new NTester('API Integration');

test.addStep('fetch-users', function () {
    const response = fetch('/api/users');
    it(response).awaitResult().object();
    it(response).awaitResult().property('users').array();
});

test.addStep('create-user', function () {
    const result = createUser({ name: 'John' });
    it(result).awaitResult().property('id').number();
});

await test.run();
```

### End-to-End Testing

```javascript
const test = new NTester('E2E Tests');

test.addStep('user-flow', function () {
    // Test complete user workflow
    it(loginPage.isVisible()).boolean().and.equal(true);
    it(loginPage.login('user', 'pass')).awaitResult();
    it(dashboard.isVisible()).boolean().and.equal(true);
});

await test.run();
```

## 🎨 Complete Example with Plugins

```javascript
#!/usr/bin/env node

import { it, NTester } from './app/NTester.js';
import { getPluginManager } from './app/plugins/PluginManager.js';
import RendererPlugin from './app/plugins/RendererPlugin.js';
import HTMLExportPlugin from './app/plugins/HTMLExportPlugin.js';
import HTMLServerPlugin from './app/plugins/HTMLServerPlugin.js';

// Setup plugins
const manager = getPluginManager();

manager.register('renderer', new RendererPlugin({
    adapterType: 'modern'
}), 'renderer');

manager.register('html-export', new HTMLExportPlugin({
    outputPath: './report.html',
    title: 'Test Report'
}), 'reporter');

const server = new HTMLServerPlugin({
    htmlFile: './report.html',
    port: 3000
});
manager.register('html-server', server, 'server');
await server.start();

// Create tests
const test = new NTester('Complete Example', {
    project: 'NTester',
    version: '0.2.0',
    author: 'Your Name'
});

test.addStep('test-1', function () {
    it(42).number().and.equal(42);
    it.message('✓ Test 1 passed');
}, {
    name: 'Basic validation'
});

test.addStep('test-2', function () {
    it('hello').string().and.contain('ell');
    it.message('✓ Test 2 passed');
}, {
    name: 'String validation'
});

// Run tests
await test.initPlugins();
await test.run();
await test.console();

console.log('\n🌐 Server running at http://localhost:3000');
console.log('📊 Dashboard at http://localhost:3000/status');
console.log('Press Ctrl+C to stop\n');
```

## 📊 Project Statistics

- **Core**: ~2000 lines (pure JavaScript, no dependencies)
- **Plugins**: ~1500 lines (optional dependencies)
- **Tests**: 19 tests, all passing
- **Documentation**: 7 comprehensive guides
- **Examples**: 4 working examples

## 🛠️ Architecture

```
┌─────────────────────────────────────────────┐
│           User Test Code                    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         NTester Core                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ NTester  │  │ it() API │  │  Engine  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Plugins │ │Adapters │ │ Reports │
└─────────┘ └─────────┘ └─────────┘
```

## 🌟 Why NTester?

### vs Traditional Test Frameworks

| Feature | NTester | Others |
|---------|---------|--------|
| **Fluent API** | ✅ Natural chaining | ⚠️ Varies |
| **Plugin System** | ✅ Built-in | ❌ Limited |
| **Zero Config** | ✅ Works immediately | ⚠️ Setup needed |
| **Zero Dependencies** | ✅ Core has none | ❌ Many deps |
| **HTML Reports** | ✅ Modern & interactive | ⚠️ Basic |
| **Live Server** | ✅ Built-in | ❌ Separate tool |
| **Multiple Renderers** | ✅ 3+ adapters | ❌ One style |
| **Dark Mode** | ✅ In reports | ❌ N/A |

### Perfect For

- ✅ JavaScript/Node.js projects
- ✅ Projects wanting minimal dependencies
- ✅ Teams needing extensibility
- ✅ CI/CD with beautiful reports
- ✅ Learning test-driven development

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./docs/contributing.md) for guidelines.

### Quick Start for Contributors

```bash
# Fork and clone
git clone https://github.com/YOUR-USERNAME/NTester.git
cd NTester

# Install dev dependencies
npm install

# Make changes
git checkout -b feature/my-feature

# Test your changes
npm test

# Commit and push
git add .
git commit -m "Add: My feature"
git push origin feature/my-feature

# Create Pull Request on GitHub
```

## 📝 Changelog

### v0.2.0-alpha (Current)

**New Features**:
- ✨ Complete plugin system
- 🎨 Multiple terminal adapters (Modern, Ink, Minimal)
- 📊 HTML report with modern UI
- 🌙 Dark mode in reports
- 🌐 Development server with live reload
- 📈 Real-time dashboard

**Improvements**:
- 🔧 Full async/await support
- 📚 Comprehensive documentation
- 🧪 19 passing tests
- 🎯 Better error handling

**Bug Fixes**:
- 🐛 Fixed promise handling in steps
- 🐛 Fixed logger async issues
- 🐛 Translation to English completed

### v0.1.0

- 🎉 Initial release
- ✅ Basic testing functionality
- 📝 Simple console output

## 📄 License

NTester is [MIT licensed](./LICENSE).

## 🙏 Acknowledgments

Special thanks to all contributors and users of NTester!

## 📞 Support

- 📖 [Documentation](./docs/getting-started.md)
- 🐛 [Issue Tracker](https://github.com/yourusername/NTester/issues)
- 💬 [Discussions](https://github.com/yourusername/NTester/discussions)

## 🔗 Links

- [GitHub Repository](https://github.com/yourusername/NTester)
- [Documentation](./docs/)
- [Examples](./examples/)
- [Plugin Development Guide](./docs/plugin-system.md)
- [API Reference](./docs/api-reference.md)

---

**Made with ❤️ by the NTester Team**

**Start testing smarter, not harder!** 🚀
