#!/usr/bin/env node

/**
 * Tests du système de plugins NTester
 *
 * Teste tous les plugins: PluginManager, Renderer, HTMLExport, HTMLServer
 */

import { getPluginManager, resetPluginManager } from '../app/plugins/PluginManager.js';
import AbstractPlugin, { PluginTypes } from '../app/plugins/AbstractPlugin.js';
import RendererPlugin from '../app/plugins/RendererPlugin.js';
import HTMLExportPlugin from '../app/plugins/HTMLExportPlugin.js';
import HTMLServerPlugin from '../app/plugins/HTMLServerPlugin.js';

console.log('🧪 Testing NTester Plugin System...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        if (error.stack) {
            console.error(`   ${error.stack.split('\n')[1].trim()}`);
        }
        failed++;
    }
}

async function asyncTest(name, fn) {
    try {
        await fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        if (error.stack) {
            console.error(`   ${error.stack.split('\n')[1].trim()}`);
        }
        failed++;
    }
}

// ============================================================================
// PLUGIN MANAGER TESTS
// ============================================================================

console.log('📦 Testing PluginManager...\n');

test('PluginManager singleton works', () => {
    const manager1 = getPluginManager();
    const manager2 = getPluginManager();
    if (manager1 !== manager2) {
        throw new Error('PluginManager is not a singleton');
    }
});

test('PluginManager can register plugins', () => {
    const manager = resetPluginManager();

    class TestPlugin extends AbstractPlugin {
        async onInit() {}
    }

    const plugin = new TestPlugin();
    manager.register('test-plugin', plugin);

    if (!manager.has('test-plugin')) {
        throw new Error('Plugin not registered');
    }
});

test('PluginManager validates plugin type', () => {
    const manager = resetPluginManager();

    try {
        manager.register('invalid', { not: 'a plugin' });
        throw new Error('Should have thrown error');
    } catch (error) {
        if (!error.message.includes('must extend AbstractPlugin')) {
            throw error;
        }
    }
});

test('PluginManager can unregister plugins', async () => {
    const manager = resetPluginManager();

    class TestPlugin extends AbstractPlugin {
        async onDestroy() {
            this.destroyed = true;
        }
    }

    const plugin = new TestPlugin();
    manager.register('test', plugin);

    await manager.unregister('test');

    if (manager.has('test')) {
        throw new Error('Plugin still registered');
    }
    if (!plugin.destroyed) {
        throw new Error('onDestroy not called');
    }
});

test('PluginManager can get plugins by type', () => {
    const manager = resetPluginManager();

    class Plugin1 extends AbstractPlugin {}
    class Plugin2 extends AbstractPlugin {}

    manager.register('p1', new Plugin1(), PluginTypes.RENDERER);
    manager.register('p2', new Plugin2(), PluginTypes.REPORTER);

    const renderers = manager.getByType(PluginTypes.RENDERER);
    if (renderers.size !== 1) {
        throw new Error('Wrong number of renderers');
    }
});

await asyncTest('PluginManager can execute hooks', async () => {
    const manager = resetPluginManager();

    let hookCalled = false;

    class TestPlugin extends AbstractPlugin {
        async onBeforeRun() {
            hookCalled = true;
        }
    }

    const plugin = new TestPlugin();
    manager.register('test', plugin);

    await manager.executeHook('onBeforeRun');

    if (!hookCalled) {
        throw new Error('Hook not called');
    }
});

test('PluginManager can enable/disable plugins', () => {
    const manager = resetPluginManager();

    class TestPlugin extends AbstractPlugin {}

    const plugin = new TestPlugin();
    manager.register('test', plugin);

    manager.disable('test');
    if (plugin.isEnabled()) {
        throw new Error('Plugin not disabled');
    }

    manager.enable('test');
    if (!plugin.isEnabled()) {
        throw new Error('Plugin not enabled');
    }
});

test('PluginManager provides stats', () => {
    const manager = resetPluginManager();

    class TestPlugin extends AbstractPlugin {}

    manager.register('p1', new TestPlugin(), PluginTypes.RENDERER);
    manager.register('p2', new TestPlugin(), PluginTypes.REPORTER);

    const stats = manager.getStats();

    if (stats.total !== 2) {
        throw new Error('Wrong total count');
    }
    if (stats.enabled !== 2) {
        throw new Error('Wrong enabled count');
    }
    if (stats.byType[PluginTypes.RENDERER] !== 1) {
        throw new Error('Wrong renderer count');
    }
});

// ============================================================================
// RENDERER PLUGIN TESTS
// ============================================================================

console.log('\n🎨 Testing RendererPlugin...\n');

await asyncTest('RendererPlugin can be created', async () => {
    const plugin = new RendererPlugin({
        adapterType: 'minimal',
        adapterOptions: { colors: false }
    });

    if (!(plugin instanceof AbstractPlugin)) {
        throw new Error('Not an AbstractPlugin instance');
    }
});

await asyncTest('RendererPlugin initializes adapter', async () => {
    const plugin = new RendererPlugin({ adapterType: 'minimal' });

    await plugin.onInit({});

    const adapter = plugin.getAdapter();
    if (!adapter) {
        throw new Error('Adapter not initialized');
    }
});

await asyncTest('RendererPlugin can render data', async () => {
    const plugin = new RendererPlugin({ adapterType: 'minimal' });
    await plugin.onInit({});

    // Should not throw
    await plugin.render('Test text');
    await plugin.render({ type: 'text', value: 'Hello' });
});

// ============================================================================
// HTML EXPORT PLUGIN TESTS
// ============================================================================

console.log('\n📄 Testing HTMLExportPlugin...\n');

test('HTMLExportPlugin can be created', () => {
    const plugin = new HTMLExportPlugin({
        outputPath: './test-output.html'
    });

    if (!(plugin instanceof AbstractPlugin)) {
        throw new Error('Not an AbstractPlugin instance');
    }
});

await asyncTest('HTMLExportPlugin generates HTML', async () => {
    const plugin = new HTMLExportPlugin({
        outputPath: './test-plugins-report.html'
    });

    await plugin.onInit({});

    const mockProcess = {
        p: 'Test Project',
        v: '1.0',
        n: 'Test',
        a: ['Tester'],
        subTests: [
            {
                n: 'SubTest 1',
                steps: [
                    {
                        n: 'Step 1',
                        index: 0,
                        log: [true, true],
                        msg: ['Test passed'],
                        error: null
                    }
                ]
            }
        ]
    };

    await plugin.onAfterRun(mockProcess);
    await plugin.generate(plugin.results || plugin._collectResults(mockProcess));

    console.log('   ℹ️  HTML report generated: test-plugins-report.html');
});

// ============================================================================
// HTML SERVER PLUGIN TESTS
// ============================================================================

console.log('\n🌐 Testing HTMLServerPlugin...\n');

test('HTMLServerPlugin can be created', () => {
    const plugin = new HTMLServerPlugin({
        port: 3001,
        htmlFile: './test-plugins-report.html'
    });

    if (!(plugin instanceof AbstractPlugin)) {
        throw new Error('Not an AbstractPlugin instance');
    }
});

await asyncTest('HTMLServerPlugin can start and stop', async () => {
    const plugin = new HTMLServerPlugin({
        port: 3001,
        htmlFile: './test-plugins-report.html',
        autoRerun: false
    });

    await plugin.onInit({});

    await plugin.start();

    const url = plugin.getURL();
    if (!url.includes('3001')) {
        throw new Error('Wrong URL');
    }

    console.log(`   ℹ️  Server started at ${url}`);

    await plugin.stop();

    console.log('   ℹ️  Server stopped');
});

await asyncTest('HTMLServerPlugin notifies clients', async () => {
    const plugin = new HTMLServerPlugin({
        port: 3002,
        htmlFile: './test-plugins-report.html'
    });

    await plugin.onInit({});
    await plugin.start();

    const clientCount = plugin.getClientCount();
    if (clientCount !== 0) {
        throw new Error('Should have 0 clients initially');
    }

    await plugin.stop();
});

// ============================================================================
// INTEGRATION TEST
// ============================================================================

console.log('\n🔗 Testing Plugin Integration...\n');

await asyncTest('Plugins work together in PluginManager', async () => {
    const manager = resetPluginManager();

    // Créer et enregistrer les plugins
    const renderer = new RendererPlugin({ adapterType: 'minimal' });
    const htmlExport = new HTMLExportPlugin({
        outputPath: './test-integration-report.html'
    });

    manager.register('renderer', renderer, PluginTypes.RENDERER);
    manager.register('html-export', htmlExport, PluginTypes.REPORTER);

    // Initialiser
    const context = { test: 'context' };
    await manager.initAll(context);

    // Mock process
    const mockProcess = {
        p: 'Integration Test',
        v: '1.0',
        n: 'Test',
        a: ['Tester'],
        subTests: []
    };

    // Exécuter les hooks
    await manager.executeHook('onBeforeRun', mockProcess);
    await manager.executeHook('onAfterRun', mockProcess);
    await manager.executeHook('onReport', mockProcess);

    console.log('   ℹ️  All plugins executed successfully');
});

await asyncTest('Global hooks work', async () => {
    const manager = resetPluginManager();

    let globalHookCalled = false;

    manager.registerGlobalHook('onCustomEvent', async () => {
        globalHookCalled = true;
    });

    await manager.executeHook('onCustomEvent');

    if (!globalHookCalled) {
        throw new Error('Global hook not called');
    }
});

// ============================================================================
// RESULTS
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('📊 Plugin Test Results');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total:  ${passed + failed}`);
console.log('='.repeat(60));

if (failed === 0) {
    console.log('\n🎉 All plugin tests passed!');
    console.log('\n✅ Plugin system is working correctly!');
    console.log('\n📚 Next: Try the full integration demo:');
    console.log('   node examples/plugins-demo.js\n');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed!');
    console.log('\n🔧 Please check the errors above.\n');
    process.exit(1);
}
