# 🔌 NTester Plugin System

Extensible plugin system for NTester allowing to extend the test framework functionality.

## 📋 Table of Contents

1. [Overview](#vue-densemble)
2. [Available Plugins](#plugins-disponibles)
3. [Installation](#installation)
4. [Quick Start](#utilisation-rapide)
5. [Architecture](#architecture)
6. [Creating a Plugin](#créer-un-plugin)
7. [API](#api)
8. [Examples](#exemples)

## 🎯 Overview

The NTester plugin system allows you to :

- ✅ **Extend** les fonctionnalités without modifying the core
- ✅ **Choose** terminal renderers (Modern, Ink, Minimal)
- ✅ **Export** results to HTML
- ✅ **Serve** reports with live reload
- ✅ **Create** your own plugins easily

### Plugin Lifecycle

Plugins can integrate at different moments :

```
┌─────────────┐
│  onInit     │  Initialization with NTester context
├─────────────┤
│ onBeforeRun │  Before test execution
├─────────────┤
│onBeforeTest │  Before each sub-test
├─────────────┤
│onBeforeStep │  Before each step
├─────────────┤
│ onAfterStep │  After each step
├─────────────┤
│ onAfterTest │  After each sub-test
├─────────────┤
│ onAfterRun  │  After test execution
├─────────────┤
│  onReport   │  Report generation
├─────────────┤
│  onDestroy  │  Cleanup
└─────────────┘
```

## 📦 Plugins Disponibles

### 1. RendererPlugin (Terminal)

Utilise les adapters terminaux pour afficher les résultats.

**Features** :
- Supports Modern Stack, Ink, Minimal
- Real-time display
- Automatic statistics

**Usage** :
```javascript
import RendererPlugin from './plugins/RendererPlugin.js';

const plugin = new RendererPlugin({
    adapterType: 'modern',  // 'modern', 'ink', 'minimal', 'auto'
    adapterOptions: { colors: true }
});
```

### 2. HTMLExportPlugin

Exporte results to HTML avec styles et interactivité.

**Features** :
- Responsive HTML report
- Detailed statistics
- Collapse/expand tests
- Error highlighting

**Usage** :
```javascript
import HTMLExportPlugin from './plugins/HTMLExportPlugin.js';

const plugin = new HTMLExportPlugin({
    outputPath: './test-report.html',
    title: 'My Test Report',
    includeDetails: true,
    autoOpen: false
});
```

### 3. HTMLServerPlugin

HTTP server with live reload for HTML reports.

**Features** :
- Server-Sent Events for live reload
- File watching
- Automatic reload
- Monitoring interface

**Usage** :
```javascript
import HTMLServerPlugin from './plugins/HTMLServerPlugin.js';

const plugin = new HTMLServerPlugin({
    port: 3000,
    htmlFile: './test-report.html',
    autoRerun: true
});

await plugin.start();
```

## 🚀 Installation

No additional installation required si vous utilisez :
- **RendererPlugin** avec adapter Minimal
- **HTMLExportPlugin**
- **HTMLServerPlugin**

For other adapters, see la [documentation des adapters](../adapters/README.md).

## ⚡ Utilisation Rapide

### Basic Example

```javascript
import { it, NTester } from './app/NTester.js';
import { getPluginManager } from './app/plugins/PluginManager.js';
import RendererPlugin from './app/plugins/RendererPlugin.js';

// 1. Create et enregistrer le plugin
const manager = getPluginManager();
const renderer = new RendererPlugin({ adapterType: 'minimal' });
manager.register('renderer', renderer);

// 2. Create et exécuter les tests
const test = new NTester('My Test', { project: 'MyProject' });

// ... ajouter des tests ...

// 3. Initialiser et exécuter
await test.initPlugins();
const runResult = await test.run();
await runResult.console();

// 4. Nettoyer
await manager.destroyAll();
```

### Complete Example (Multi-plugins)

```javascript
import { getPluginManager } from './app/plugins/PluginManager.js';
import RendererPlugin from './app/plugins/RendererPlugin.js';
import HTMLExportPlugin from './app/plugins/HTMLExportPlugin.js';
import HTMLServerPlugin from './app/plugins/HTMLServerPlugin.js';

const manager = getPluginManager();

// Terminal rendering
manager.register('renderer', new RendererPlugin({
    adapterType: 'modern'
}));

// HTML export
manager.register('html-export', new HTMLExportPlugin({
    outputPath: './report.html'
}));

// HTML server
const server = new HTMLServerPlugin({ port: 3000 });
manager.register('html-server', server);
await server.start();

// ... run tests ...

// Cleanup
await manager.destroyAll();
```

## 🏗️ Architecture

### AbstractPlugin

Classe de base pour tous les plugins.

```javascript
import AbstractPlugin from './plugins/AbstractPlugin.js';

class MyPlugin extends AbstractPlugin {
    async onInit(context) {
        // Accès au contexte NTester
        this._context = context;
    }

    async onAfterRun(process) {
        // Traiter les résultats
        console.log('Tests completed!');
    }
}
```

### Types de Plugins

```javascript
import { PluginTypes } from './plugins/AbstractPlugin.js';

// Types disponibles :
PluginTypes.RENDERER    // Rendu des résultats
PluginTypes.REPORTER    // Génération de rapports
PluginTypes.TRANSFORMER // Transformation des données
PluginTypes.SERVER      // Serveurs et services
PluginTypes.HOOK        // Hooks génériques
```

### PluginManager

Manages plugin lifecycle and execution.

```javascript
import { getPluginManager } from './plugins/PluginManager.js';

const manager = getPluginManager();

// Registration
manager.register(name, plugin, type);

// Initialisation
await manager.initAll(context);

// Exécution de hooks
await manager.executeHook('onAfterRun', process);

// Management
manager.enable(name);
manager.disable(name);
manager.has(name);
manager.get(name);
manager.getByType(type);

// Statistics
const stats = manager.getStats();
// { total, enabled, disabled, byType: {...} }

// Cleanup
await manager.destroyAll();
```

## 🔧 Create un Plugin

### Simple Plugin

```javascript
import AbstractPlugin from './plugins/AbstractPlugin.js';

export default class MyPlugin extends AbstractPlugin {
    constructor(options = {}) {
        super(options);
        this.myOption = options.myOption || 'default';
    }

    getMetadata() {
        return {
            ...super.getMetadata(),
            name: 'My Plugin',
            description: 'Does something cool',
            version: '1.0.0'
        };
    }

    async onInit(context) {
        await super.onInit(context);
        console.log('Plugin initialized!');
    }

    async onAfterRun(process) {
        // Your logic ici
        console.log(`Processed ${process.subTests.length} tests`);
    }
}
```

### Reporter Plugin

```javascript
import { ReporterPlugin } from './plugins/AbstractPlugin.js';

export default class MyReporter extends ReporterPlugin {
    async generate(results) {
        // Générer un rapport
        const output = JSON.stringify(results, null, 2);
        await writeFile('./report.json', output);
    }

    async onReport(process) {
        const results = this._collectResults(process);
        await this.generate(results);
    }
}
```

### Renderer Plugin

```javascript
import { RendererPlugin } from './plugins/AbstractPlugin.js';

export default class MyRenderer extends RendererPlugin {
    async render(data) {
        // Your logic de rendu
        console.log('Rendering:', data);
    }

    async onAfterRun(process) {
        await this.render(this._formatResults(process));
    }
}
```

### Server Plugin

```javascript
import { ServerPlugin } from './plugins/AbstractPlugin.js';
import { createServer } from 'http';

export default class MyServer extends ServerPlugin {
    async start() {
        this.server = createServer((req, res) => {
            res.end('Hello from NTester!');
        });

        this.server.listen(this.port);
        console.log(`Server running on port ${this.port}`);
    }

    async stop() {
        if (this.server) {
            this.server.close();
        }
    }

    async onDestroy() {
        await this.stop();
    }
}
```

## 📚 Complete API

### AbstractPlugin

#### Lifecycle Hooks

```javascript
async onInit(context)           // Initialisation
async onBeforeRun(process)      // Avant exécution globale
async onBeforeTest(subTest)     // Before each sub-test
async onBeforeStep(step)        // Before each step
async onAfterStep(step)         // After each step
async onAfterTest(subTest)      // After each sub-test
async onAfterRun(process)       // Après exécution globale
async onReport(process)         // Génération de rapport
async onDestroy()               // Cleanup
```

#### Methods

```javascript
enable()                        // Active le plugin
disable()                       // Désactive le plugin
isEnabled()                     // Vérifie si actif
getMetadata()                   // Retourne les métadonnées
```

### PluginManager

```javascript
// Registration
register(name, plugin, type)
unregister(name)

// Lifecycle
async initAll(context)
async executeHook(hookName, ...args)
async destroyAll()

// Management
enable(name)
disable(name)
has(name)
get(name)
getByType(type)
list()

// Configuration
async loadFromConfig(config)

// Stats
getStats()

// Global hooks
registerGlobalHook(hookName, callback)
```

### Specialized Plugins

#### ReporterPlugin

```javascript
async generate(results)         // Génère le rapport
```

#### RendererPlugin

```javascript
async render(data)              // Rend les données
```

#### ServerPlugin

```javascript
async start()                   // Démarre le serveur
async stop()                    // Arrête le serveur
getURL()                        // URL du serveur
```

## 💡 Examples

### Utilisation dans les Tests

```javascript
import { it, NTester } from './app/NTester.js';

const test = new NTester('Example', {
    project: 'MyProject'
});

// Les plugins sont automatiquement appelés
await test.initPlugins();      // onInit sur tous les plugins
const result = await test.run(); // onBeforeRun, onAfterRun, etc.
await result.console();         // onReport
```

### Configuration via Fichier

```javascript
// .ntester.json
{
  "plugins": {
    "renderer": {
      "path": "./app/plugins/RendererPlugin.js",
      "type": "renderer",
      "enabled": true,
      "options": {
        "adapterType": "modern"
      }
    },
    "html-export": {
      "path": "./app/plugins/HTMLExportPlugin.js",
      "type": "reporter",
      "enabled": true,
      "options": {
        "outputPath": "./reports/test.html"
      }
    }
  }
}
```

```javascript
// Chargement
import { getPluginManager } from './plugins/PluginManager.js';

const manager = getPluginManager();
await manager.loadFromConfig(config);
```

### Hooks Globaux

```javascript
import { getPluginManager } from './plugins/PluginManager.js';

const manager = getPluginManager();

// Enregistrer un hook global
manager.registerGlobalHook('onAfterRun', async (process) => {
    console.log('Global hook: tests completed!');
});

// Le hook sera exécuté avec tous les autres plugins
```

### Plugin avec État

```javascript
class StatsPlugin extends AbstractPlugin {
    constructor() {
        super();
        this.stats = {
            testsRun: 0,
            testsPassed: 0,
            testsFailed: 0
        };
    }

    async onAfterTest(subTest) {
        this.stats.testsRun++;

        const passed = subTest.steps.every(s =>
            s.log.every(r => r === true) && !s.error
        );

        if (passed) {
            this.stats.testsPassed++;
        } else {
            this.stats.testsFailed++;
        }
    }

    async onReport() {
        console.log('Statistics:', this.stats);
    }
}
```

## 🧪 Tests

Exécuter les tests du système de plugins :

```bash
# Tests unitaires
node tests/plugins-test.js

# Démonstration complète
node examples/plugins-demo.js
```

## 📖 Additional Documentation

- [Documentation des Adapters](../adapters/README.md)
- [Integration Guide](../../docs/ADAPTER-INTEGRATION.md)
- [Adapters Proposal](../../ADAPTERS-PROPOSAL.md)

## 🎯 Best Practices

### 1. Management des Erreurs

```javascript
async onAfterRun(process) {
    try {
        // Your logic
    } catch (error) {
        console.error('Plugin error:', error);
        // Don't throw to avoid blocking other plugins
    }
}
```

### 2. Cleanup

```javascript
async onDestroy() {
    // Always clean up resources
    if (this.server) {
        await this.server.close();
    }
    if (this.watchers) {
        this.watchers.forEach(w => w.close());
    }
    await super.onDestroy();
}
```

### 3. Performance

```javascript
// Lazy loading of dependencies
async onInit(context) {
    if (this.isEnabled()) {
        // Load only if enabled
        const { default: heavyLib } = await import('heavy-lib');
        this.lib = heavyLib;
    }
}
```

### 4. Configuration

```javascript
constructor(options = {}) {
    super(options);

    // Default values
    this.option1 = options.option1 ?? 'default';
    this.option2 = options.option2 ?? true;
}
```

## 🚦 Status

**Version**: 0.2.0-alpha
**Status**: ✅ Ready for Testing
**Tests**: 19/19 passed

## 🤝 Contributing

To create a new plugin :

1. Extend `AbstractPlugin` ou une classe spécialisée
2. Implement necessary hooks
3. Add tests in `tests/plugins-test.js`
4. Document in this README
5. Submit a PR

## 📄 License

MIT - Same as NTester

---

**Date**: 13/11/2025
**Author**: NTester Team
**Status**: ✅ Production Ready
