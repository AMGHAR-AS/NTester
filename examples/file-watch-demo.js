#!/usr/bin/env node

/**
 * HTMLServerPlugin with File Watching Demo
 *
 * This demo shows the file watching feature with chokidar
 * - Watches test files for changes
 * - Auto-reruns tests when files change
 * - Live reload in browser
 *
 * Usage:
 * 1. Run this demo: node examples/file-watch-demo.js
 * 2. Open http://localhost:3000 in your browser
 * 3. Edit a test file in tests/ directory
 * 4. Watch tests auto-rerun and browser auto-reload
 */

import { it, NTester } from '../app/NTester.js';
import { getPluginManager } from '../app/plugins/PluginManager.js';
import RendererPlugin from '../app/plugins/RendererPlugin.js';
import HTMLExportPlugin from '../app/plugins/HTMLExportPlugin.js';
import HTMLServerPlugin from '../app/plugins/HTMLServerPlugin.js';

const manager = getPluginManager();

// Terminal renderer (minimal for demo)
manager.register('renderer', new RendererPlugin({
    adapterType: 'minimal'
}), 'renderer');

// HTML export
manager.register('html-export', new HTMLExportPlugin({
    outputPath: './file-watch-demo-report.html',
    title: 'File Watching Demo'
}), 'reporter');

// HTML server with file watching
const server = new HTMLServerPlugin({
    htmlFile: './file-watch-demo-report.html',
    port: 3000,
    autoRerun: true,  // Enable auto-rerun on file changes
    watchFiles: [
        './tests/**/*.js',
        './app/**/*.js',
        './examples/file-watch-demo.js'  // Watch this file too
    ]
});

manager.register('html-server', server, 'server');

// Create a simple test suite
const test = new NTester('File Watch Demo', {
    project: 'NTester',
    version: '1.0.0',
    author: 'Demo'
});

test.addStep('demo-test-1', function() {
    const value = Math.floor(Math.random() * 100);
    it(value).number();
    it(value).greaterThanOrEqual(0);
    it(value).lessThan(100);
    it.message(`✓ Random value: ${value}`);
}, {
    name: 'Random Number Test',
    comment: 'Generates a random number and validates it'
});

test.addStep('demo-test-2', function() {
    const timestamp = new Date().toISOString();
    it(timestamp).string();
    it(timestamp).match(/^\d{4}-\d{2}-\d{2}/);
    it.message(`✓ Timestamp: ${timestamp}`);
}, {
    name: 'Timestamp Test',
    comment: 'Validates current timestamp format'
});

test.addStep('demo-test-3', function() {
    const items = ['apple', 'banana', 'cherry'];
    it(items).array();
    it(items).length(3);
    it(items).contain('banana');
    it.message(`✓ Items: ${items.join(', ')}`);
}, {
    name: 'Array Test',
    comment: 'Validates array operations'
});

// Run tests
(async () => {
    console.log('🚀 File Watch Demo Starting...\n');
    console.log('📝 Features:');
    console.log('   - Auto-rerun tests when files change');
    console.log('   - Live reload in browser');
    console.log('   - Powered by chokidar\n');

    // Start server
    await server.start();

    console.log('\n🌐 Server Information:');
    console.log(`   URL: ${server.getURL()}`);
    console.log(`   Dashboard: ${server.getURL()}/status`);
    console.log(`   API: ${server.getURL()}/api/stats\n`);

    console.log('👀 Watching files:');
    console.log('   - ./tests/**/*.js');
    console.log('   - ./app/**/*.js');
    console.log('   - ./examples/file-watch-demo.js\n');

    console.log('💡 Try this:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Edit this file or any test file');
    console.log('   3. Save the changes');
    console.log('   4. Watch tests auto-rerun and browser reload!\n');

    console.log('⚠️  Press Ctrl+C to stop the server\n');

    // Initialize plugins
    await test.initPlugins();

    // Run initial test
    const result = await test.run();
    await result.console();

    console.log('\n✅ Initial test run complete');
    console.log('🔄 Waiting for file changes...\n');

    // Keep process alive
    process.on('SIGINT', async () => {
        console.log('\n\n👋 Shutting down...');
        await server.stop();
        process.exit(0);
    });
})();
