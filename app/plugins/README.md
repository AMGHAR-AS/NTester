# 🔌 NTester Plugin System

Système de plugins extensible pour NTester permettant d'étendre les fonctionnalités du framework de test.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Plugins disponibles](#plugins-disponibles)
3. [Installation](#installation)
4. [Utilisation rapide](#utilisation-rapide)
5. [Architecture](#architecture)
6. [Créer un plugin](#créer-un-plugin)
7. [API](#api)
8. [Exemples](#exemples)

## 🎯 Vue d'ensemble

Le système de plugins NTester permet de :

- ✅ **Étendre** les fonctionnalités sans modifier le core
- ✅ **Choisir** les renderers terminaux (Modern, Ink, Minimal)
- ✅ **Exporter** les résultats en HTML
- ✅ **Servir** les rapports avec live reload
- ✅ **Créer** vos propres plugins facilement

### Cycle de Vie des Plugins

Les plugins peuvent s'intégrer à différents moments :

```
┌─────────────┐
│  onInit     │  Initialisation avec contexte NTester
├─────────────┤
│ onBeforeRun │  Avant l'exécution des tests
├─────────────┤
│onBeforeTest │  Avant chaque sous-test
├─────────────┤
│onBeforeStep │  Avant chaque étape
├─────────────┤
│ onAfterStep │  Après chaque étape
├─────────────┤
│ onAfterTest │  Après chaque sous-test
├─────────────┤
│ onAfterRun  │  Après l'exécution des tests
├─────────────┤
│  onReport   │  Génération du rapport
├─────────────┤
│  onDestroy  │  Nettoyage
└─────────────┘
```

## 📦 Plugins Disponibles

### 1. RendererPlugin (Terminal)

Utilise les adapters terminaux pour afficher les résultats.

**Caractéristiques** :
- Supporte Modern Stack, Ink, Minimal
- Affichage en temps réel
- Statistiques automatiques

**Usage** :
```javascript
import RendererPlugin from './plugins/RendererPlugin.js';

const plugin = new RendererPlugin({
    adapterType: 'modern',  // 'modern', 'ink', 'minimal', 'auto'
    adapterOptions: { colors: true }
});
```

### 2. HTMLExportPlugin

Exporte les résultats en HTML avec styles et interactivité.

**Caractéristiques** :
- Rapport HTML responsive
- Statistiques détaillées
- Collapse/expand des tests
- Mise en évidence des erreurs

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

Serveur HTTP avec live reload pour les rapports HTML.

**Caractéristiques** :
- Server-Sent Events pour live reload
- Surveillance des changements
- Rechargement automatique
- Interface de monitoring

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

Aucune installation supplémentaire requise si vous utilisez :
- **RendererPlugin** avec adapter Minimal
- **HTMLExportPlugin**
- **HTMLServerPlugin**

Pour les autres adapters, voir la [documentation des adapters](../adapters/README.md).

## ⚡ Utilisation Rapide

### Exemple Basique

```javascript
import { it, NTester } from './app/NTester.js';
import { getPluginManager } from './app/plugins/PluginManager.js';
import RendererPlugin from './app/plugins/RendererPlugin.js';

// 1. Créer et enregistrer le plugin
const manager = getPluginManager();
const renderer = new RendererPlugin({ adapterType: 'minimal' });
manager.register('renderer', renderer);

// 2. Créer et exécuter les tests
const test = new NTester('My Test', { project: 'MyProject' });

// ... ajouter des tests ...

// 3. Initialiser et exécuter
await test.initPlugins();
const runResult = await test.run();
await runResult.console();

// 4. Nettoyer
await manager.destroyAll();
```

### Exemple Complet (Multi-plugins)

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

Gère le cycle de vie et l'exécution des plugins.

```javascript
import { getPluginManager } from './plugins/PluginManager.js';

const manager = getPluginManager();

// Enregistrement
manager.register(name, plugin, type);

// Initialisation
await manager.initAll(context);

// Exécution de hooks
await manager.executeHook('onAfterRun', process);

// Gestion
manager.enable(name);
manager.disable(name);
manager.has(name);
manager.get(name);
manager.getByType(type);

// Statistiques
const stats = manager.getStats();
// { total, enabled, disabled, byType: {...} }

// Nettoyage
await manager.destroyAll();
```

## 🔧 Créer un Plugin

### Plugin Simple

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
        // Votre logique ici
        console.log(`Processed ${process.subTests.length} tests`);
    }
}
```

### Plugin Reporter

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

### Plugin Renderer

```javascript
import { RendererPlugin } from './plugins/AbstractPlugin.js';

export default class MyRenderer extends RendererPlugin {
    async render(data) {
        // Votre logique de rendu
        console.log('Rendering:', data);
    }

    async onAfterRun(process) {
        await this.render(this._formatResults(process));
    }
}
```

### Plugin Server

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

## 📚 API Complète

### AbstractPlugin

#### Lifecycle Hooks

```javascript
async onInit(context)           // Initialisation
async onBeforeRun(process)      // Avant exécution globale
async onBeforeTest(subTest)     // Avant chaque sous-test
async onBeforeStep(step)        // Avant chaque étape
async onAfterStep(step)         // Après chaque étape
async onAfterTest(subTest)      // Après chaque sous-test
async onAfterRun(process)       // Après exécution globale
async onReport(process)         // Génération de rapport
async onDestroy()               // Nettoyage
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

## 💡 Exemples

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

## 📖 Documentation Complémentaire

- [Documentation des Adapters](../adapters/README.md)
- [Guide d'intégration](../../docs/ADAPTER-INTEGRATION.md)
- [Proposition des Adapters](../../ADAPTERS-PROPOSAL.md)

## 🎯 Best Practices

### 1. Gestion des Erreurs

```javascript
async onAfterRun(process) {
    try {
        // Votre logique
    } catch (error) {
        console.error('Plugin error:', error);
        // Ne pas throw pour ne pas bloquer les autres plugins
    }
}
```

### 2. Nettoyage

```javascript
async onDestroy() {
    // Toujours nettoyer les ressources
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
// Lazy loading des dépendances
async onInit(context) {
    if (this.isEnabled()) {
        // Charger seulement si activé
        const { default: heavyLib } = await import('heavy-lib');
        this.lib = heavyLib;
    }
}
```

### 4. Configuration

```javascript
constructor(options = {}) {
    super(options);

    // Valeurs par défaut
    this.option1 = options.option1 ?? 'default';
    this.option2 = options.option2 ?? true;
}
```

## 🚦 Statut

**Version**: 0.2.0-alpha
**Statut**: ✅ Ready for Testing
**Tests**: 19/19 passed

## 🤝 Contribution

Pour créer un nouveau plugin :

1. Étendre `AbstractPlugin` ou une classe spécialisée
2. Implémenter les hooks nécessaires
3. Ajouter des tests dans `tests/plugins-test.js`
4. Documenter dans ce README
5. Soumettre une PR

## 📄 License

MIT - Same as NTester

---

**Date**: 13/11/2025
**Auteur**: NTester Team
**Status**: ✅ Production Ready
