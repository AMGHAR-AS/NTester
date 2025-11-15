# File Watching & Auto-Rerun

NTester's HTMLServerPlugin includes powerful file watching capabilities powered by [chokidar](https://github.com/paulmillr/chokidar) for automatic test re-execution.

## 📋 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration](#configuration)
- [Features](#features)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The file watching feature automatically:
1. **Monitors test files** for changes
2. **Re-runs tests** when files are modified
3. **Updates HTML report** with new results
4. **Reloads browser** via Server-Sent Events
5. **Notifies connected clients** in real-time

## 📦 Installation

### Optional Dependency

Chokidar is an **optional dependency** - NTester works without it, but file watching requires it:

```bash
npm install chokidar
```

Or install with the main package:

```bash
npm install @amghar-as/ntester chokidar
```

### Without Chokidar

If chokidar is not installed:
- HTML file watching still works (native `fs.watch`)
- Test file watching shows a helpful message
- All other features work normally

## 🚀 Basic Usage

### Simple Setup

```javascript
import HTMLServerPlugin from './app/plugins/HTMLServerPlugin.js';

const server = new HTMLServerPlugin({
    htmlFile: './test-report.html',
    port: 3000,
    autoRerun: true  // Enable file watching
});

await server.start();
```

### Complete Example

```javascript
import { NTester } from './app/NTester.js';
import { getPluginManager } from './app/plugins/PluginManager.js';
import RendererPlugin from './app/plugins/RendererPlugin.js';
import HTMLExportPlugin from './app/plugins/HTMLExportPlugin.js';
import HTMLServerPlugin from './app/plugins/HTMLServerPlugin.js';

const manager = getPluginManager();

// Setup plugins
manager.register('renderer', new RendererPlugin({
    adapterType: 'minimal'
}), 'renderer');

manager.register('html-export', new HTMLExportPlugin({
    outputPath: './report.html'
}), 'reporter');

const server = new HTMLServerPlugin({
    htmlFile: './report.html',
    port: 3000,
    autoRerun: true,
    watchFiles: [
        './tests/**/*.js',
        './app/**/*.js'
    ]
});

manager.register('html-server', server, 'server');

// Create and run tests
const test = new NTester('My Tests', { project: 'MyApp' });
// ... add test steps ...

await test.initPlugins();
await server.start();
await test.run();
await test.console();

// Server keeps running, watching for changes
```

## ⚙️ Configuration

### HTMLServerPlugin Options

```javascript
new HTMLServerPlugin({
    // Basic options
    port: 3000,                    // Server port
    host: 'localhost',             // Server host
    htmlFile: './report.html',     // HTML report path

    // File watching options
    autoRerun: true,               // Enable auto-rerun (default: true)
    watchFiles: [                  // Glob patterns to watch
        './tests/**/*.js',
        './app/**/*.js',
        './src/**/*.ts'
    ]
})
```

### Watch Patterns

Supports glob patterns via chokidar:

```javascript
watchFiles: [
    './tests/**/*.js',           // All JS files in tests/
    './tests/**/*.test.js',      // Only .test.js files
    './app/**/*.{js,ts}',        // JS and TS files
    '!./tests/fixtures/**'       // Exclude fixtures
]
```

### Default Patterns

If not specified, defaults to:
```javascript
['./tests/**/*.js', './app/**/*.js']
```

## ✨ Features

### 1. Automatic Test Re-execution

When a watched file changes:
```
File changed: tests/my-test.js
🔄 Re-running tests...

[Tests execute automatically]

✅ Tests completed - HTML report updated
```

### 2. Live Browser Reload

- Connected browsers receive SSE notifications
- Automatic page reload when report updates
- Visual indicators during test execution

### 3. Multiple File Types

Watch any file pattern:
- Test files: `./tests/**/*.js`
- Source code: `./app/**/*.js`
- TypeScript: `./src/**/*.ts`
- Configuration: `./config/**/*.json`

### 4. Smart Watching

Chokidar features:
- **Efficient**: Uses native OS watching
- **Cross-platform**: Works on Windows, macOS, Linux
- **Reliable**: Handles renames, deletes, creates
- **Fast**: Minimal overhead
- **Configurable**: Ignore patterns, delays, etc.

### 5. Real-Time Notifications

Server-Sent Events provide:
- Test start notifications
- Test completion notifications
- Error notifications
- Reload triggers

## 📝 Examples

### Example 1: Watch Tests Only

```javascript
const server = new HTMLServerPlugin({
    htmlFile: './report.html',
    port: 3000,
    autoRerun: true,
    watchFiles: ['./tests/**/*.js']
});
```

### Example 2: Watch Tests and Source

```javascript
const server = new HTMLServerPlugin({
    htmlFile: './report.html',
    port: 3000,
    autoRerun: true,
    watchFiles: [
        './tests/**/*.js',
        './src/**/*.js',
        './lib/**/*.js'
    ]
});
```

### Example 3: TypeScript Project

```javascript
const server = new HTMLServerPlugin({
    htmlFile: './report.html',
    port: 3000,
    autoRerun: true,
    watchFiles: [
        './tests/**/*.ts',
        './src/**/*.ts'
    ]
});
```

### Example 4: Exclude Patterns

```javascript
const server = new HTMLServerPlugin({
    htmlFile: './report.html',
    port: 3000,
    autoRerun: true,
    watchFiles: [
        './tests/**/*.js',
        '!./tests/fixtures/**',      // Exclude fixtures
        '!./tests/**/*.skip.js',     // Exclude skipped tests
        '!**/node_modules/**'        // Exclude node_modules
    ]
});
```

### Example 5: Development Workflow

```javascript
// development-server.js
import { NTester } from './app/NTester.js';
import { setupPlugins } from './test-config.js';

async function startDevServer() {
    const manager = setupPlugins({
        htmlExport: true,
        htmlServer: true,
        serverPort: 3000,
        watchFiles: ['./tests/**/*.js', './app/**/*.js']
    });

    const test = new NTester('Dev Tests', { project: 'MyApp' });
    // ... configure tests ...

    await test.initPlugins();

    const server = manager.get('html-server');
    await server.start();

    console.log('🚀 Dev server started at http://localhost:3000');
    console.log('👀 Watching for file changes...');
    console.log('⚠️  Press Ctrl+C to stop');

    await test.run();
    await test.console();

    // Keep alive
    process.on('SIGINT', async () => {
        await server.stop();
        process.exit(0);
    });
}

startDevServer();
```

## 🔍 How It Works

### Architecture

```
┌─────────────────┐
│  Test Files     │
│  ./tests/**/*.js│
└────────┬────────┘
         │
         │ File Change Detected
         │
         ▼
┌─────────────────┐
│   Chokidar      │
│   Watcher       │
└────────┬────────┘
         │
         │ Trigger Event
         │
         ▼
┌─────────────────┐
│ HTMLServerPlugin│
│ _watchTestFiles │
└────────┬────────┘
         │
         │ Re-run Tests
         │
         ▼
┌─────────────────┐
│  Test Runner    │
│  NTester.run()  │
└────────┬────────┘
         │
         │ Generate Report
         │
         ▼
┌─────────────────┐
│ HTMLExportPlugin│
│ Updates HTML    │
└────────┬────────┘
         │
         │ Notify Clients
         │
         ▼
┌─────────────────┐
│   Browser       │
│   Auto Reload   │
└─────────────────┘
```

### Event Flow

1. **File Change**: Developer edits a test file
2. **Chokidar Detects**: Change event triggered
3. **Server Notified**: `_watchTestFiles()` receives event
4. **SSE Broadcast**: Connected clients notified of test start
5. **Tests Execute**: `test.run()` re-executes all tests
6. **Report Updated**: HTMLExportPlugin regenerates HTML
7. **HTML Watcher**: Native watcher detects HTML change
8. **Browser Reload**: SSE triggers page reload
9. **New Results**: Browser displays updated test results

## 🛠️ Troubleshooting

### Chokidar Not Found

**Symptom**:
```
📝 File watching for auto-rerun requires chokidar
   Install it with: npm install chokidar
```

**Solution**:
```bash
npm install chokidar
```

### Watching Too Many Files

**Symptom**: High CPU usage, slow response

**Solution**: Be more specific with patterns
```javascript
// ❌ Too broad
watchFiles: ['./**/*.js']

// ✅ Specific
watchFiles: ['./tests/**/*.js', './app/**/*.js']
```

### Files Not Being Watched

**Symptom**: Changes don't trigger re-run

**Solution 1**: Check patterns match your files
```javascript
// If your tests are in __tests__/
watchFiles: ['./__tests__/**/*.js']
```

**Solution 2**: Verify `autoRerun` is enabled
```javascript
new HTMLServerPlugin({
    autoRerun: true  // Make sure this is true
})
```

### Multiple Rapid Changes

**Symptom**: Tests run too frequently

**Solution**: Chokidar has built-in debouncing
```javascript
// Chokidar automatically debounces rapid changes
// No configuration needed
```

### Permission Errors

**Symptom**: Cannot watch certain directories

**Solution**: Check file permissions
```bash
chmod -R u+r ./tests
chmod -R u+r ./app
```

## 📊 Performance

### Resource Usage

| Watched Files | Memory | CPU Idle | CPU Active |
|---------------|--------|----------|------------|
| < 100 files   | +5 MB  | ~0%      | ~5%        |
| 100-500 files | +10 MB | ~0.1%    | ~10%       |
| 500+ files    | +20 MB | ~0.2%    | ~15%       |

### Optimization Tips

1. **Use Specific Patterns**
   ```javascript
   // ✅ Good
   watchFiles: ['./tests/**/*.test.js']

   // ❌ Too broad
   watchFiles: ['./**/*.js']
   ```

2. **Exclude Large Directories**
   ```javascript
   watchFiles: [
       './tests/**/*.js',
       '!**/node_modules/**',
       '!**/dist/**'
   ]
   ```

3. **Watch Only What Changes**
   ```javascript
   // If you only edit tests, don't watch app code
   watchFiles: ['./tests/**/*.js']
   ```

## 🔗 Related Documentation

- [Plugin System](./plugin-system.md)
- [HTMLServerPlugin API](./api-reference.md#htmlserverplugin)
- [Getting Started](./getting-started.md)
- [Chokidar Documentation](https://github.com/paulmillr/chokidar)

## 💡 Tips

1. **Use with Modern Adapter** for best terminal output
2. **Open browser before editing** to see live reload
3. **Check server logs** to see which files are watched
4. **Use `/status` endpoint** to monitor server state
5. **Ctrl+C** cleanly shuts down watchers

## 🎉 Try It

Run the demo:

```bash
node examples/file-watch-demo.js
```

Then:
1. Open http://localhost:3000
2. Edit `examples/file-watch-demo.js`
3. Change a number or add a test
4. Save and watch it auto-reload!

---

**File watching makes test-driven development a breeze!** 🚀
