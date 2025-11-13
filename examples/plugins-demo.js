#!/usr/bin/env node

/**
 * Démonstration complète du système de plugins NTester
 *
 * Montre comment utiliser:
 * - PluginManager
 * - RendererPlugin (adapters terminaux)
 * - HTMLExportPlugin (export HTML)
 * - HTMLServerPlugin (serveur avec live reload)
 */

import { it, NTester } from '../app/NTester.js';
import { getPluginManager } from '../app/plugins/PluginManager.js';
import RendererPlugin from '../app/plugins/RendererPlugin.js';
import HTMLExportPlugin from '../app/plugins/HTMLExportPlugin.js';
import HTMLServerPlugin from '../app/plugins/HTMLServerPlugin.js';
import { PluginTypes } from '../app/plugins/AbstractPlugin.js';

console.log('🎨 NTester Plugins Demo\n');
console.log('='.repeat(60));
console.log('This demo shows the plugin system in action:');
console.log('  1. Terminal rendering with RendererPlugin');
console.log('  2. HTML export with HTMLExportPlugin');
console.log('  3. Live server with HTMLServerPlugin');
console.log('='.repeat(60));
console.log('');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // Choisir l'adapter: 'modern', 'ink', 'minimal', 'auto'
    adapterType: 'minimal',

    // Activer l'export HTML
    enableHTMLExport: true,
    htmlPath: './demo-plugins-report.html',

    // Activer le serveur HTML (décommenter pour tester)
    enableHTMLServer: false,  // Mettre true pour activer
    serverPort: 3000
};

// ============================================================================
// SETUP PLUGINS
// ============================================================================

async function setupPlugins() {
    const manager = getPluginManager();

    console.log('🔌 Setting up plugins...\n');

    // 1. Renderer Plugin (Terminal)
    const renderer = new RendererPlugin({
        adapterType: CONFIG.adapterType,
        adapterOptions: { colors: true }
    });
    manager.register('renderer', renderer, PluginTypes.RENDERER);
    console.log(`✓ Renderer plugin registered (${CONFIG.adapterType})`);

    // 2. HTML Export Plugin
    if (CONFIG.enableHTMLExport) {
        const htmlExport = new HTMLExportPlugin({
            outputPath: CONFIG.htmlPath,
            title: 'NTester Plugins Demo Report'
        });
        manager.register('html-export', htmlExport, PluginTypes.REPORTER);
        console.log(`✓ HTML Export plugin registered (${CONFIG.htmlPath})`);
    }

    // 3. HTML Server Plugin
    if (CONFIG.enableHTMLServer) {
        const htmlServer = new HTMLServerPlugin({
            htmlFile: CONFIG.htmlPath,
            port: CONFIG.serverPort,
            autoRerun: false  // Pas de re-run automatique dans cette démo
        });
        manager.register('html-server', htmlServer, PluginTypes.SERVER);
        console.log(`✓ HTML Server plugin registered (port ${CONFIG.serverPort})`);

        // Démarrer le serveur
        await htmlServer.start();
        console.log(`🌐 Server running at ${htmlServer.getURL()}`);
    }

    console.log('');
    return manager;
}

// ============================================================================
// DEMO TESTS
// ============================================================================

async function runDemoTests() {
    console.log('🧪 Creating demo tests...\n');

    // Créer le test principal
    const test = new NTester('Plugin System Demo', {
        project: 'NTester',
        version: '0.2.0-alpha',
        author: 'NTester Team'
    });

    // Sous-test 1: Types primitifs
    const primitiveTests = new NTester('Primitive Type Tests', {
        section: 'Basic Tests'
    });

    primitiveTests.addStep('number-test', function () {
        it(42).number().and.equal(42);
        it.message('✓ Number validation works');
    }, {
        name: 'Test number validation'
    });

    primitiveTests.addStep('string-test', function () {
        it('hello').string().and.equal('hello');
        it('world').string().and.contain('or');
        it.message('✓ String validation works');
    }, {
        name: 'Test string validation'
    });

    primitiveTests.addStep('boolean-test', function () {
        it(true).boolean().and.equal(true);
        it(false).boolean().and.not.equal(true);
        it.message('✓ Boolean validation works');
    }, {
        name: 'Test boolean validation'
    });

    test.addSubTest(primitiveTests);

    // Sous-test 2: Collections
    const collectionTests = new NTester('Collection Tests', {
        section: 'Advanced Tests'
    });

    collectionTests.addStep('array-test', function () {
        it([1, 2, 3]).array().and.length(3);
        it([1, 2, 3]).array().and.contain(2);
        it.message('✓ Array validation works');
    }, {
        name: 'Test array validation'
    });

    collectionTests.addStep('object-test', function () {
        const obj = { name: 'Test', value: 42 };
        it(obj).object();
        it(obj.name).equal('Test');
        it.message('✓ Object validation works');
    }, {
        name: 'Test object validation'
    });

    test.addSubTest(collectionTests);

    // Sous-test 3: Logic
    const logicTests = new NTester('Logic Tests', {
        section: 'Logic Operations'
    });

    logicTests.addStep('and-test', function () {
        it(5).number().and.greaterThan(3).and.lessThan(10);
        it.message('✓ AND logic works');
    }, {
        name: 'Test AND operator'
    });

    logicTests.addStep('or-test', function () {
        it(7).greaterThan(10).or.lessThan(8);
        it.message('✓ OR logic works');
    }, {
        name: 'Test OR operator'
    });

    logicTests.addStep('not-test', function () {
        it(5).not.equal(10);
        it('test').not.number();
        it.message('✓ NOT logic works');
    }, {
        name: 'Test NOT operator'
    });

    test.addSubTest(logicTests);

    // Sous-test 4: Async
    const asyncTests = new NTester('Async Tests', {
        section: 'Asynchronous'
    });

    asyncTests.addStep('promise-test', function () {
        const promise = Promise.resolve(42);
        it(promise).awaitResult().number().and.equal(42);
        it.message('✓ Promise handling works');
    }, {
        name: 'Test promise resolution'
    });

    asyncTests.addStep('async-chain-test', function () {
        const p1 = Promise.resolve(10);
        const p2 = Promise.resolve(20);
        it(p1).awaitResult().lessThan(15);
        it(p2).awaitResult().greaterThan(15);
        it.message('✓ Async chaining works');
    }, {
        name: 'Test async chaining'
    });

    test.addSubTest(asyncTests);

    console.log('✓ Test suite created\n');

    return test;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    try {
        // Setup plugins
        const manager = await setupPlugins();

        // Create tests
        const test = await runDemoTests();

        // Initialize plugins with context
        console.log('🔧 Initializing plugins...\n');
        await test.initPlugins();

        // Run tests
        console.log('▶️  Running tests...\n');
        console.log('='.repeat(60));
        const runResult = await test.run();
        await runResult.console();
        console.log('='.repeat(60));

        // Show results
        console.log('\n📊 Plugin Execution Summary:\n');

        const stats = manager.getStats();
        console.log(`Total plugins: ${stats.total}`);
        console.log(`Enabled: ${stats.enabled}`);
        console.log(`Disabled: ${stats.disabled}`);
        console.log('');

        if (CONFIG.enableHTMLExport) {
            console.log(`📄 HTML report generated: ${CONFIG.htmlPath}`);
            console.log(`   Open in browser to view detailed results`);
        }

        if (CONFIG.enableHTMLServer) {
            const htmlServer = manager.get('html-server');
            console.log(`🌐 Server running: ${htmlServer.getURL()}`);
            console.log(`   Press Ctrl+C to stop`);
            console.log('');

            // Keep process alive for server
            process.on('SIGINT', async () => {
                console.log('\n\n🛑 Stopping server...');
                await manager.destroyAll();
                process.exit(0);
            });
        } else {
            // Cleanup
            await manager.destroyAll();
        }

        console.log('\n✅ Demo completed successfully!\n');

        if (!CONFIG.enableHTMLServer) {
            console.log('💡 Tip: Set enableHTMLServer=true to see live reload in action\n');
        }

    } catch (error) {
        console.error('\n❌ Error running demo:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run
main();
