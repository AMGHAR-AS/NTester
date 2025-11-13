# Plugin System

NTester's plugin system allows you to extend functionality without modifying core code. Plugins can intercept test execution at multiple points, render output, generate reports, and provide additional features.

## 📋 Table of Contents

- [Overview](#overview)
- [Plugin Types](#plugin-types)
- [Creating Plugins](#creating-plugins)
- [Lifecycle Hooks](#lifecycle-hooks)
- [Built-in Plugins](#built-in-plugins)
- [Plugin Manager](#plugin-manager)
- [Best Practices](#best-practices)
- [Examples](#examples)

## 🎯 Overview

The plugin system is built around:

1. **AbstractPlugin**: Base class for all plugins
2. **PluginManager**: Central registry for plugin management
3. **Lifecycle Hooks**: Entry points for plugin execution
4. **Plugin Types**: Categorization (Renderer, Reporter, Server, Hook)

## 🔌 Plugin Types

NTester supports four plugin types:

### 1. RendererPlugin

Renders test output to terminal or console.

```javascript
import { RendererPlugin } from './app/plugins/AbstractPlugin.js';

class MyRenderer extends RendererPlugin {
    async onAfterRun(process) {
        console.log('Test execution completed!');
    }
}
```

**Use cases**:
- Terminal output formatting
- Custom visualization
- Progress indicators
- Interactive prompts

### 2. ReporterPlugin

Generates reports in various formats.

```javascript
import { ReporterPlugin } from './app/plugins/AbstractPlugin.js';

class MyReporter extends ReporterPlugin {
    async onReport(process) {
        // Generate custom report
        const stats = this._calculateStats(process);
        await this._writeReport(stats);
    }
}
```

**Use cases**:
- HTML reports
- JSON exports
- PDF generation
- Database logging

### 3. ServerPlugin

Provides server functionality (HTTP, WebSocket, etc.).

```javascript
import { ServerPlugin } from './app/plugins/AbstractPlugin.js';

class MyServer extends ServerPlugin {
    async start() {
        this.server = createServer(...);
        await this._listen();
    }

    async stop() {
        await this._close();
    }
}
```

**Use cases**:
- Live reload servers
- Remote test execution
- Real-time monitoring
- API endpoints

### 4. Hook Plugin

General-purpose plugin for custom logic.

```javascript
import AbstractPlugin from './app/plugins/AbstractPlugin.js';

class MyHook extends AbstractPlugin {
    async onBeforeTest(process) {
        console.log(`Starting test: ${process.name}`);
    }
}
```

**Use cases**:
- Logging
- Metrics collection
- Custom integrations
- Side effects

## 🛠️ Creating Plugins

### Basic Plugin Structure

```javascript
import AbstractPlugin from './app/plugins/AbstractPlugin.js';

export default class MyPlugin extends AbstractPlugin {
    constructor(options = {}) {
        super();
        this.options = options;
        this._enabled = true;
    }

    async onInit(context) {
        // Called once when plugin initializes
        this._context = context;
        await this._setup();
    }

    async onBeforeRun(process) {
        // Called before test suite runs
    }

    async onAfterRun(process) {
        // Called after test suite completes
    }

    async onDestroy() {
        // Cleanup when plugin is destroyed
    }
}
```

### Plugin Registration

```javascript
import { getPluginManager } from './app/plugins/PluginManager.js';
import MyPlugin from './plugins/MyPlugin.js';

const manager = getPluginManager();
const plugin = new MyPlugin({ option1: 'value1' });

manager.register('my-plugin', plugin, 'hook');
```

### Plugin Initialization

Plugins must be initialized with NTester context:

```javascript
const test = new NTester('My Test');
await test.initPlugins();
```

Or manually:

```javascript
const context = { NTester, engine, logger, process };
await manager.initAll(context);
```

## 🔄 Lifecycle Hooks

Plugins can implement any of these hooks:

### onInit(context)

Called once when plugin initializes.

```javascript
async onInit(context) {
    this._context = context;
    // Setup plugin resources
}
```

**Parameters**:
- `context.NTester` - NTester class reference
- `context.engine` - Test engine
- `context.logger` - Logger instance
- `context.process` - Current process

**Use for**: Initialization, resource allocation, configuration

### onBeforeRun(process)

Called before test suite execution starts.

```javascript
async onBeforeRun(process) {
    console.log(`Starting test suite: ${process.name}`);
}
```

**Parameters**:
- `process` - The test process object

**Use for**: Setup, logging, preparing resources

### onBeforeTest(process)

Called before each test/subtest executes.

```javascript
async onBeforeTest(process) {
    console.log(`Test starting: ${process.name}`);
}
```

**Use for**: Per-test setup, state preparation

### onBeforeStep(step, process)

Called before each test step executes.

```javascript
async onBeforeStep(step, process) {
    console.log(`Step: ${step.name}`);
}
```

**Parameters**:
- `step` - The step object
- `process` - The parent test process

**Use for**: Step-level tracking, fine-grained logging

### onAfterStep(step, process)

Called after each test step completes.

```javascript
async onAfterStep(step, process) {
    if (step.passed === false) {
        console.error(`Step failed: ${step.name}`);
    }
}
```

**Use for**: Result processing, failure handling

### onAfterTest(process)

Called after each test/subtest completes.

```javascript
async onAfterTest(process) {
    const stats = this._calculateTestStats(process);
    console.log(`Test completed: ${stats.passed}/${stats.total}`);
}
```

**Use for**: Test result aggregation, reporting

### onAfterRun(process)

Called after test suite execution completes.

```javascript
async onAfterRun(process) {
    const stats = this._calculateStats(process);
    await this._generateReport(stats);
}
```

**Use for**: Final reporting, cleanup, statistics

### onReport(process)

Called when report generation is requested.

```javascript
async onReport(process) {
    await this._writeHTMLReport(process);
    await this._writeJSONReport(process);
}
```

**Use for**: Report generation, export operations

### onDestroy()

Called when plugin is being destroyed.

```javascript
async onDestroy() {
    await this._closeConnections();
    await this._cleanup();
}
```

**Use for**: Resource cleanup, connection closing

## 🎁 Built-in Plugins

### RendererPlugin

Terminal rendering with multiple adapter support.

```javascript
import RendererPlugin from './app/plugins/RendererPlugin.js';

const renderer = new RendererPlugin({
    adapterType: 'modern',  // 'modern', 'ink', 'minimal', 'auto'
    adapterOptions: {
        colors: true
    }
});

manager.register('renderer', renderer, 'renderer');
```

**Options**:
- `adapterType` - Adapter to use ('modern', 'ink', 'minimal', 'auto')
- `adapterOptions` - Options passed to adapter

**Features**:
- Multiple terminal adapters
- Colored output
- Progress indicators
- Statistics calculation

See [Adapter System](./adapter-system.md) for adapter details.

### HTMLExportPlugin

Generates modern HTML reports.

```javascript
import HTMLExportPlugin from './app/plugins/HTMLExportPlugin.js';

const htmlExport = new HTMLExportPlugin({
    outputPath: './test-report.html',
    title: 'Test Report',
    includeStats: true,
    includeTimestamps: true
});

manager.register('html-export', htmlExport, 'reporter');
```

**Options**:
- `outputPath` - Where to save HTML file
- `title` - Report title
- `includeStats` - Include statistics (default: true)
- `includeTimestamps` - Include timestamps (default: true)

**Features**:
- Modern responsive design
- Dark mode toggle
- Real-time search
- Interactive filters
- Animated progress bars
- Print-friendly styles
- Export to JSON

See [UX Features](./ux-features.md) for UI details.

### HTMLServerPlugin

Development server with live reload.

```javascript
import HTMLServerPlugin from './app/plugins/HTMLServerPlugin.js';

const htmlServer = new HTMLServerPlugin({
    htmlFile: './test-report.html',
    port: 3000,
    autoRerun: false,
    watchInterval: 500
});

manager.register('html-server', htmlServer, 'server');
await htmlServer.start();
```

**Options**:
- `htmlFile` - HTML report to serve
- `port` - Server port (default: 3000)
- `autoRerun` - Auto re-run tests on change (default: false)
- `watchInterval` - File watch interval in ms (default: 500)

**Features**:
- Live reload via Server-Sent Events
- Status dashboard at `/status`
- API endpoint at `/api/stats`
- Connected clients tracking
- Uptime monitoring

**Endpoints**:
- `GET /` - HTML report
- `GET /events` - SSE endpoint for live reload
- `GET /status` - Server dashboard
- `GET /api/stats` - JSON statistics

## 🎛️ Plugin Manager

### Getting the Manager

```javascript
import { getPluginManager } from './app/plugins/PluginManager.js';

const manager = getPluginManager(); // Singleton instance
```

### Registering Plugins

```javascript
manager.register(name, plugin, type);
```

**Parameters**:
- `name` - Unique plugin identifier
- `plugin` - Plugin instance (must extend AbstractPlugin)
- `type` - Plugin type ('renderer', 'reporter', 'server', 'hook')

### Managing Plugins

```javascript
// Get plugin
const plugin = manager.get('my-plugin');

// Check if registered
if (manager.has('my-plugin')) { ... }

// Unregister plugin
manager.unregister('my-plugin');

// Enable/disable
manager.enable('my-plugin');
manager.disable('my-plugin');

// Initialize all plugins
await manager.initAll(context);

// Execute hook on all plugins
await manager.executeHook('onBeforeRun', process);

// Destroy all plugins
await manager.destroyAll();
```

### Getting Statistics

```javascript
const stats = manager.getStats();
// {
//   total: 3,
//   enabled: 2,
//   disabled: 1,
//   byType: {
//     renderer: 1,
//     reporter: 1,
//     server: 1
//   }
// }
```

### Listing Plugins

```javascript
const plugins = manager.list();
// [
//   { name: 'renderer', type: 'renderer', enabled: true },
//   { name: 'html-export', type: 'reporter', enabled: true },
//   ...
// ]
```

## ✅ Best Practices

### 1. Proper Initialization

Always initialize plugins before running tests:

```javascript
const test = new NTester('My Test');
await test.initPlugins();  // Initialize plugins
const result = await test.run();
```

### 2. Handle Async Properly

All lifecycle hooks should be async:

```javascript
async onAfterRun(process) {
    await this._writeFile();  // Wait for async operations
    await this._cleanup();
}
```

### 3. Error Handling

Wrap plugin logic in try-catch:

```javascript
async onReport(process) {
    try {
        await this._generateReport(process);
    } catch (error) {
        console.error('Report generation failed:', error);
    }
}
```

### 4. Cleanup Resources

Always implement onDestroy:

```javascript
async onDestroy() {
    if (this.server) {
        await this.server.close();
    }
    if (this.fileHandle) {
        await this.fileHandle.close();
    }
}
```

### 5. Check Context

Verify context is available:

```javascript
async onBeforeRun(process) {
    if (!this._context) {
        throw new Error('Plugin not initialized');
    }
    // Use context safely
}
```

### 6. Use Plugin Types

Register with appropriate type:

```javascript
// Good
manager.register('renderer', plugin, 'renderer');

// Avoid
manager.register('renderer', plugin); // Defaults to 'hook'
```

### 7. Descriptive Names

Use clear, descriptive plugin names:

```javascript
// Good
manager.register('html-export', new HTMLExportPlugin());
manager.register('slack-notifier', new SlackPlugin());

// Avoid
manager.register('plugin1', new HTMLExportPlugin());
```

## 📝 Examples

### Example 1: Simple Logger Plugin

```javascript
import AbstractPlugin from './app/plugins/AbstractPlugin.js';

export default class LoggerPlugin extends AbstractPlugin {
    constructor(options = {}) {
        super();
        this.logFile = options.logFile || './test.log';
    }

    async onBeforeRun(process) {
        await fs.writeFile(this.logFile, `Test started: ${process.name}\n`);
    }

    async onAfterTest(process) {
        const status = process.passed ? 'PASS' : 'FAIL';
        await fs.appendFile(this.logFile, `${status}: ${process.name}\n`);
    }

    async onAfterRun(process) {
        await fs.appendFile(this.logFile, 'Test suite completed\n');
    }
}
```

### Example 2: Metrics Collector

```javascript
import AbstractPlugin from './app/plugins/AbstractPlugin.js';

export default class MetricsPlugin extends AbstractPlugin {
    constructor() {
        super();
        this.metrics = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            totalDuration: 0
        };
    }

    async onAfterTest(process) {
        this.metrics.totalTests++;
        if (process.passed) {
            this.metrics.passedTests++;
        } else {
            this.metrics.failedTests++;
        }
    }

    async onAfterRun(process) {
        console.log('Metrics:', this.metrics);
        await this._sendToAnalytics(this.metrics);
    }

    async _sendToAnalytics(metrics) {
        // Send to analytics service
    }
}
```

### Example 3: Notification Plugin

```javascript
import AbstractPlugin from './app/plugins/AbstractPlugin.js';

export default class NotificationPlugin extends AbstractPlugin {
    constructor(options = {}) {
        super();
        this.webhookUrl = options.webhookUrl;
    }

    async onAfterRun(process) {
        const stats = this._calculateStats(process);

        if (stats.failed > 0) {
            await this._sendNotification({
                title: 'Tests Failed',
                message: `${stats.failed} test(s) failed`,
                color: 'red'
            });
        } else {
            await this._sendNotification({
                title: 'Tests Passed',
                message: 'All tests passed!',
                color: 'green'
            });
        }
    }

    async _sendNotification(data) {
        await fetch(this.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }
}
```

### Example 4: Using Multiple Plugins

```javascript
import { getPluginManager } from './app/plugins/PluginManager.js';
import RendererPlugin from './app/plugins/RendererPlugin.js';
import HTMLExportPlugin from './app/plugins/HTMLExportPlugin.js';
import HTMLServerPlugin from './app/plugins/HTMLServerPlugin.js';
import LoggerPlugin from './plugins/LoggerPlugin.js';
import MetricsPlugin from './plugins/MetricsPlugin.js';

const manager = getPluginManager();

// Terminal rendering
manager.register('renderer', new RendererPlugin({ adapterType: 'modern' }), 'renderer');

// HTML export
manager.register('html-export', new HTMLExportPlugin({ outputPath: './report.html' }), 'reporter');

// Development server
const server = new HTMLServerPlugin({ port: 3000 });
manager.register('html-server', server, 'server');
await server.start();

// Custom plugins
manager.register('logger', new LoggerPlugin({ logFile: './test.log' }));
manager.register('metrics', new MetricsPlugin());

// Run tests
const test = new NTester('My Test Suite');
await test.initPlugins();
const result = await test.run();
await result.console();
```

## 🔗 Related Documentation

- [Getting Started](./getting-started.md)
- [Adapter System](./adapter-system.md)
- [API Reference](./api-reference.md)
- [Architecture](./architecture.md)
- [UX Features](./ux-features.md)

## 📚 Advanced Topics

### Custom Plugin Types

You can create custom plugin types by extending AbstractPlugin:

```javascript
export class CustomPluginType extends AbstractPlugin {
    constructor() {
        super();
        this._type = 'custom';
    }

    // Add custom methods specific to your plugin type
    customMethod() {
        // ...
    }
}
```

### Plugin Dependencies

Plugins can depend on other plugins:

```javascript
async onInit(context) {
    const manager = getPluginManager();
    this.rendererPlugin = manager.get('renderer');

    if (!this.rendererPlugin) {
        throw new Error('Renderer plugin required');
    }
}
```

### Dynamic Plugin Loading

Load plugins dynamically based on configuration:

```javascript
const config = {
    plugins: [
        { name: 'renderer', type: 'RendererPlugin', options: {} },
        { name: 'html-export', type: 'HTMLExportPlugin', options: {} }
    ]
};

for (const pluginConfig of config.plugins) {
    const PluginClass = await import(`./plugins/${pluginConfig.type}.js`);
    const plugin = new PluginClass.default(pluginConfig.options);
    manager.register(pluginConfig.name, plugin);
}
```

---

For more examples, see the `examples/plugins-demo.js` file.
