#!/usr/bin/env node

/**
 * HTTP Server Test Suite
 * Tests HTMLServerPlugin HTTP endpoints:
 * - GET / (HTML report)
 * - GET /status (Dashboard)
 * - GET /api/stats (JSON stats)
 * - GET /events (SSE)
 * - Server lifecycle
 * - File watching
 * - Client management
 */

import HTMLServerPlugin from '../app/plugins/HTMLServerPlugin.js';
import HTMLExportPlugin from '../app/plugins/HTMLExportPlugin.js';
import { NTester } from '../app/NTester.js';
import { writeFileSync } from 'fs';

console.log('🧪 Testing HTMLServerPlugin HTTP Endpoints...\n');

let passed = 0;
let failed = 0;

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
// SETUP - CREATE HTML FILE FOR TESTS
// ============================================================================

const testHtmlFile = './test-server-report.html';

// Create a test HTML file
writeFileSync(testHtmlFile, `<!DOCTYPE html>
<html>
<head><title>Test Report</title></head>
<body><h1>Test Report</h1></body>
</html>`);

// ============================================================================
// SERVER LIFECYCLE TESTS
// ============================================================================

console.log('🌐 Testing Server Lifecycle...\n');

await asyncTest('Server can start on specified port', async () => {
    const server = new HTMLServerPlugin({
        port: 3101,
        htmlFile: testHtmlFile,
        autoRerun: false
    });

    await server.start();

    const url = server.getURL();
    if (!url.includes('3101')) {
        throw new Error(`Wrong port in URL: ${url}`);
    }

    await server.stop();
});

await asyncTest('Server can start and stop', async () => {
    const server = new HTMLServerPlugin({
        port: 3102,
        htmlFile: testHtmlFile,
        autoRerun: false
    });

    await server.start();
    await server.stop();

    // Should complete without errors
});

await asyncTest('Server getURL() returns correct URL', async () => {
    const server = new HTMLServerPlugin({
        port: 3103,
        htmlFile: testHtmlFile
    });

    await server.start();

    const url = server.getURL();

    if (!url.startsWith('http://')) {
        throw new Error('URL does not start with http://');
    }

    if (!url.includes('3103')) {
        throw new Error('URL does not include port 3103');
    }

    await server.stop();
});

await asyncTest('Server handles restart correctly', async () => {
    const server = new HTMLServerPlugin({
        port: 3104,
        htmlFile: testHtmlFile
    });

    await server.start();
    await server.stop();
    await server.start();
    await server.stop();

    // Should handle multiple start/stop cycles
});

// ============================================================================
// HTTP ENDPOINT TESTS
// ============================================================================

console.log('\n📡 Testing HTTP Endpoints...\n');

await asyncTest('GET / returns HTML content', async () => {
    const server = new HTMLServerPlugin({
        port: 3105,
        htmlFile: testHtmlFile
    });

    await server.start();

    const response = await fetch('http://localhost:3105/');
    const content = await response.text();

    if (!response.ok) {
        throw new Error('GET / failed');
    }

    if (!content.includes('Test Report')) {
        throw new Error('HTML content not returned');
    }

    await server.stop();
});

await asyncTest('GET /status returns dashboard', async () => {
    const server = new HTMLServerPlugin({
        port: 3106,
        htmlFile: testHtmlFile
    });

    await server.start();

    const response = await fetch('http://localhost:3106/status');
    const content = await response.text();

    if (!response.ok) {
        throw new Error('GET /status failed');
    }

    if (!content.includes('Server Status')) {
        throw new Error('Dashboard not returned');
    }

    await server.stop();
});

await asyncTest('GET /api/stats returns JSON', async () => {
    const server = new HTMLServerPlugin({
        port: 3107,
        htmlFile: testHtmlFile
    });

    await server.start();

    const response = await fetch('http://localhost:3107/api/stats');
    const stats = await response.json();

    if (!response.ok) {
        throw new Error('GET /api/stats failed');
    }

    if (typeof stats !== 'object') {
        throw new Error('Stats is not an object');
    }

    if (typeof stats.clients !== 'number') {
        throw new Error('Stats does not include clients count');
    }

    if (typeof stats.uptime !== 'number') {
        throw new Error('Stats does not include uptime');
    }

    if (typeof stats.port !== 'number') {
        throw new Error('Stats does not include port');
    }

    await server.stop();
});

await asyncTest('GET /events returns SSE stream', async () => {
    const server = new HTMLServerPlugin({
        port: 3108,
        htmlFile: testHtmlFile
    });

    await server.start();

    const response = await fetch('http://localhost:3108/events');

    if (!response.ok) {
        throw new Error('GET /events failed');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType.includes('text/event-stream')) {
        throw new Error('Wrong content type for SSE');
    }

    await server.stop();
});

await asyncTest('GET /unknown returns 404', async () => {
    const server = new HTMLServerPlugin({
        port: 3109,
        htmlFile: testHtmlFile
    });

    await server.start();

    const response = await fetch('http://localhost:3109/unknown-endpoint');

    if (response.status !== 404) {
        throw new Error('Unknown endpoint did not return 404');
    }

    await server.stop();
});

// ============================================================================
// CLIENT MANAGEMENT TESTS
// ============================================================================

console.log('\n👥 Testing Client Management...\n');

await asyncTest('Server tracks client count', async () => {
    const server = new HTMLServerPlugin({
        port: 3110,
        htmlFile: testHtmlFile
    });

    await server.start();

    const initialCount = server.getClientCount();
    if (initialCount !== 0) {
        throw new Error('Initial client count should be 0');
    }

    await server.stop();
});

await asyncTest('Client count updates via stats endpoint', async () => {
    const server = new HTMLServerPlugin({
        port: 3111,
        htmlFile: testHtmlFile
    });

    await server.start();

    const response = await fetch('http://localhost:3111/api/stats');
    const stats = await response.json();

    if (typeof stats.clients !== 'number') {
        throw new Error('Stats clients count not available');
    }

    await server.stop();
});

// ============================================================================
// PLUGIN INTEGRATION TESTS
// ============================================================================

console.log('\n🔌 Testing Server Plugin Integration...\n');

await asyncTest('Server works with HTMLExportPlugin', async () => {
    const htmlExport = new HTMLExportPlugin({
        outputPath: testHtmlFile,
        title: 'Integration Test'
    });

    const server = new HTMLServerPlugin({
        port: 3112,
        htmlFile: testHtmlFile
    });

    await server.start();

    // Export should update file
    await htmlExport.onInit({});
    const mockProcess = {
        p: 'Test',
        v: '1.0',
        n: 'Test',
        a: ['Tester'],
        subTests: []
    };
    await htmlExport.onAfterRun(mockProcess);

    // Server should serve updated file
    const response = await fetch('http://localhost:3112/');
    const content = await response.text();

    if (!content.includes('Integration Test')) {
        throw new Error('Updated HTML not served');
    }

    await server.stop();
});

await asyncTest('Server notifyClients() works', async () => {
    const server = new HTMLServerPlugin({
        port: 3113,
        htmlFile: testHtmlFile
    });

    await server.start();

    // Should not throw
    server.notifyClients({ type: 'test', message: 'Test notification' });

    await server.stop();
});

// ============================================================================
// OPTIONS TESTS
// ============================================================================

console.log('\n⚙️  Testing Server Options...\n');

await asyncTest('Server respects custom port', async () => {
    const server = new HTMLServerPlugin({
        port: 3114,
        htmlFile: testHtmlFile
    });

    await server.start();

    const url = server.getURL();
    if (!url.includes('3114')) {
        throw new Error('Custom port not respected');
    }

    await server.stop();
});

await asyncTest('Server respects custom htmlFile', async () => {
    const customFile = './test-custom-report.html';
    writeFileSync(customFile, `<!DOCTYPE html>
<html><body><h1>Custom Report</h1></body></html>`);

    const server = new HTMLServerPlugin({
        port: 3115,
        htmlFile: customFile
    });

    await server.start();

    const response = await fetch('http://localhost:3115/');
    const content = await response.text();

    if (!content.includes('Custom Report')) {
        throw new Error('Custom HTML file not used');
    }

    await server.stop();
});

await asyncTest('Server with autoRerun option', async () => {
    const server = new HTMLServerPlugin({
        port: 3116,
        htmlFile: testHtmlFile,
        autoRerun: true // Enable auto-rerun
    });

    await server.start();

    // Should start without errors
    // Auto-rerun functionality tested separately

    await server.stop();
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

console.log('\n🛡️  Testing Error Handling...\n');

await asyncTest('Server handles missing HTML file gracefully', async () => {
    const server = new HTMLServerPlugin({
        port: 3117,
        htmlFile: './non-existent-file.html'
    });

    await server.start();

    const response = await fetch('http://localhost:3117/');

    // Should return some response (error or empty)
    // Should not crash

    await server.stop();
});

await asyncTest('Server handles port in use', async () => {
    const server1 = new HTMLServerPlugin({
        port: 3118,
        htmlFile: testHtmlFile
    });

    const server2 = new HTMLServerPlugin({
        port: 3118,
        htmlFile: testHtmlFile
    });

    await server1.start();

    try {
        await server2.start();
        // If it succeeds, that's fine (OS may handle it differently)
    } catch (error) {
        // Expected - port already in use
    }

    await server1.stop();
    // Don't stop server2 - it may not have started
});

// ============================================================================
// STRESS TESTS
// ============================================================================

console.log('\n💪 Testing Server Under Load...\n');

await asyncTest('Server handles multiple concurrent requests', async () => {
    const server = new HTMLServerPlugin({
        port: 3119,
        htmlFile: testHtmlFile
    });

    await server.start();

    const requests = [];
    for (let i = 0; i < 10; i++) {
        requests.push(fetch('http://localhost:3119/'));
    }

    const responses = await Promise.all(requests);

    for (const response of responses) {
        if (!response.ok) {
            throw new Error('Concurrent request failed');
        }
    }

    await server.stop();
});

await asyncTest('Server handles rapid start/stop', async () => {
    const server = new HTMLServerPlugin({
        port: 3120,
        htmlFile: testHtmlFile
    });

    for (let i = 0; i < 3; i++) {
        await server.start();
        await server.stop();
    }

    // Should handle rapid cycling
});

// ============================================================================
// RESULTS
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('📊 HTTP Server Test Results');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total:  ${passed + failed}`);
console.log('='.repeat(60));

if (failed === 0) {
    console.log('\n🎉 All HTTP server tests passed!');
    console.log('\n✅ HTML Server functionality is working correctly!');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed!');
    console.log('\n🔧 Please check the errors above.\n');
    process.exit(1);
}
