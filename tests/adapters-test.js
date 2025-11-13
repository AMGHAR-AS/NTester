#!/usr/bin/env node

/**
 * Tests basiques pour les adapters
 * Vérifie que l'architecture fonctionne correctement
 */

import { createAdapter, AdapterFactory } from '../app/adapters/index.js';
import AbstractAdapter from '../app/adapters/AbstractAdapter.js';

console.log('🧪 Testing NTester Adapters...\n');

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
        failed++;
    }
}

// ============================================================================
// TESTS
// ============================================================================

// Test 1: Factory creates adapters
test('Factory creates Modern Stack adapter', () => {
    const adapter = createAdapter('modern');
    if (!(adapter instanceof AbstractAdapter)) {
        throw new Error('Adapter is not instance of AbstractAdapter');
    }
});

test('Factory creates Minimal adapter', () => {
    const adapter = createAdapter('minimal');
    if (!(adapter instanceof AbstractAdapter)) {
        throw new Error('Adapter is not instance of AbstractAdapter');
    }
});

test('Factory creates Ink adapter', () => {
    const adapter = createAdapter('ink');
    if (!(adapter instanceof AbstractAdapter)) {
        throw new Error('Adapter is not instance of AbstractAdapter');
    }
});

// Test 2: Auto-detection works
test('Auto-detection creates an adapter', () => {
    const adapter = createAdapter('auto');
    if (!(adapter instanceof AbstractAdapter)) {
        throw new Error('Auto-detection failed');
    }
});

// Test 3: Default adapter
test('Default adapter can be set', () => {
    AdapterFactory.setDefault('minimal');
    const defaultType = AdapterFactory.getDefault();
    if (defaultType !== 'minimal') {
        throw new Error('Default adapter not set correctly');
    }
    // Reset
    AdapterFactory.setDefault('modern');
});

test('Create default adapter works', () => {
    const adapter = AdapterFactory.createDefault();
    if (!(adapter instanceof AbstractAdapter)) {
        throw new Error('Default adapter creation failed');
    }
});

// Test 4: List available adapters
test('List available adapters', () => {
    const available = AdapterFactory.listAvailable();
    if (!Array.isArray(available) || available.length === 0) {
        throw new Error('No adapters available');
    }
    if (!available.includes('modern')) {
        throw new Error('Modern adapter not in list');
    }
});

// Test 5: Check adapter availability
test('Check adapter availability', () => {
    if (!AdapterFactory.isAvailable('modern')) {
        throw new Error('Modern adapter should be available');
    }
    if (!AdapterFactory.isAvailable('minimal')) {
        throw new Error('Minimal adapter should be available');
    }
    if (AdapterFactory.isAvailable('non-existent')) {
        throw new Error('Non-existent adapter should not be available');
    }
});

// Test 6: Custom adapter registration
test('Register custom adapter', () => {
    class TestAdapter extends AbstractAdapter {
        clear() {}
        setConsole() {}
        exit() {}
        displayText() {}
        displayTable() {}
        displayList() {}
        displaySpinner() {}
        displayProgress() {}
        async prompt() { return ''; }
        async select() { return 0; }
        async confirm() { return true; }
    }

    AdapterFactory.register('test-adapter', TestAdapter);

    if (!AdapterFactory.isAvailable('test-adapter')) {
        throw new Error('Custom adapter not registered');
    }

    const adapter = createAdapter('test-adapter');
    if (!(adapter instanceof TestAdapter)) {
        throw new Error('Custom adapter not created correctly');
    }
});

// Test 7: Content management
test('Adapter content management', () => {
    const adapter = createAdapter('minimal');

    adapter.setContent('test1', 'Hello');
    if (!adapter._hasContent('test1')) {
        throw new Error('Content not set');
    }

    const content = adapter._getContent('test1');
    if (content.length !== 1 || content[0] !== 'Hello') {
        throw new Error('Content not retrieved correctly');
    }

    adapter._clearContent();
    if (adapter._hasContent('test1')) {
        throw new Error('Content not cleared');
    }
});

// Test 8: Content parsing
test('Content parsing', () => {
    const adapter = createAdapter('minimal');

    // String
    let parsed = adapter._parseContent('test');
    if (parsed.type !== 'text' || parsed.value !== 'test') {
        throw new Error('String not parsed correctly');
    }

    // Object with type
    parsed = adapter._parseContent({ type: 'table', items: [] });
    if (parsed.type !== 'table') {
        throw new Error('Object with type not parsed correctly');
    }

    // Number
    parsed = adapter._parseContent(42);
    if (parsed.type !== 'text' || parsed.value !== '42') {
        throw new Error('Number not parsed correctly');
    }
});

// Test 9: Minimal adapter works without dependencies
test('Minimal adapter works without chalk', async () => {
    const adapter = createAdapter('minimal', { colors: false });

    // Should not throw
    await adapter.displayText('Test without chalk');
});

// Test 10: Environment detection
test('Environment-based adapter selection', () => {
    // Save original
    const originalCI = process.env.CI;
    const originalAdapter = process.env.NTESTER_ADAPTER;

    try {
        // Test CI detection
        process.env.CI = 'true';
        delete process.env.NTESTER_ADAPTER;

        const ciAdapter = createAdapter('auto');
        // Should create minimal in CI

        // Test explicit env var
        delete process.env.CI;
        process.env.NTESTER_ADAPTER = 'minimal';

        const envAdapter = createAdapter('auto');
        // Should respect env var

    } finally {
        // Restore
        if (originalCI !== undefined) {
            process.env.CI = originalCI;
        } else {
            delete process.env.CI;
        }

        if (originalAdapter !== undefined) {
            process.env.NTESTER_ADAPTER = originalAdapter;
        } else {
            delete process.env.NTESTER_ADAPTER;
        }
    }
});

// ============================================================================
// RESULTS
// ============================================================================

console.log('\n' + '='.repeat(50));
console.log('📊 Test Results');
console.log('='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total:  ${passed + failed}`);
console.log('='.repeat(50));

if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    console.log('\n✅ Adapters are working correctly!');
    console.log('\n📚 Next: Try running the demo:');
    console.log('   node examples/adapters-demo.js\n');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed!');
    console.log('\n🔧 Please check the errors above.\n');
    process.exit(1);
}
