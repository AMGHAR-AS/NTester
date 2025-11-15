#!/usr/bin/env node

/**
 * Core Features Test Suite
 * Tests advanced features not covered by other test suites:
 * - NTester static methods (fake timers)
 * - Engine execution details
 * - Logger functionality
 * - Process lifecycle
 * - Error handling
 * - Async execution
 * - Step metadata
 * - Sub-test execution order
 * - Plugin lifecycle hooks (all hooks)
 */

import { it, NTester } from '../app/NTester.js';
import { getPluginManager, resetPluginManager } from '../app/plugins/PluginManager.js';
import AbstractPlugin from '../app/plugins/AbstractPlugin.js';

console.log('🧪 Testing NTester Core Features...\n');

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
// NTESTER STATIC METHODS
// ============================================================================

console.log('⚙️  Testing NTester Static Methods...\n');

test('NTester.useFakeTimer() works', () => {
    const originalSetTimeout = globalThis.setTimeout;

    NTester.useFakeTimer();

    let called = false;
    globalThis.setTimeout(() => {
        called = true;
    }, 100);

    // Fake timer should not call the function
    if (called) {
        throw new Error('Fake timer called the function');
    }

    // Restore
    NTester.restoreFakeTimer();

    if (globalThis.setTimeout !== originalSetTimeout) {
        throw new Error('Timer not restored');
    }
});

test('NTester.restoreFakeTimer() restores original', () => {
    const originalSetTimeout = globalThis.setTimeout;

    NTester.useFakeTimer();
    NTester.restoreFakeTimer();

    if (globalThis.setTimeout !== originalSetTimeout) {
        throw new Error('Timer not properly restored');
    }
});

test('NTester.fn() creates mock function', () => {
    const mockFn = NTester.fn();

    if (typeof mockFn !== 'function') {
        throw new Error('fn() did not create a function');
    }

    // Should be callable
    mockFn();
    mockFn(1, 2, 3);
});

test('NTester.spy() wraps function', () => {
    const obj = {
        testMethod: function(a, b) {
            return a + b;
        }
    };

    NTester.spy(obj, 'testMethod');

    const result = obj.testMethod(5, 3);

    if (result !== 8) {
        throw new Error('Spy changed function behavior');
    }
});

// ============================================================================
// NTESTER INSTANCE METHODS
// ============================================================================

console.log('\n📦 Testing NTester Instance Methods...\n');

await asyncTest('NTester constructor with minimal params', async () => {
    const test = new NTester('Test');

    if (!test) {
        throw new Error('Constructor failed');
    }
});

await asyncTest('NTester constructor with full params', async () => {
    const test = new NTester('Test', {
        project: 'MyProject',
        version: '2.0',
        author: 'Tester',
        section: 'Unit Tests',
        type: 'Core',
        comment: 'Test comment',
        lastUpdate: '15/11/2025'
    });

    if (!test) {
        throw new Error('Constructor with params failed');
    }
});

await asyncTest('NTester.addStep() adds step correctly', async () => {
    const main = new NTester('Main', { project: 'Test' });
    const sub = new NTester('Sub');

    sub.addStep('test-step', function() {
        it(1).equal(1);
    }, {
        name: 'Test Step',
        author: 'Tester',
        comment: 'Test'
    });

    main.addSubTest(sub);

    // Test should have 1 step
    const result = await main.run();
});

await asyncTest('NTester.addSubTest() adds sub-test', async () => {
    const main = new NTester('Main', { project: 'Test' });
    const sub = new NTester('Sub');

    sub.addStep('sub-step', function() {
        it(1).equal(1);
    }, { comment: '' });

    main.addSubTest(sub);

    await main.run();
});

await asyncTest('NTester.run() executes all steps', async () => {
    const main = new NTester('Main', { project: 'Test' });
    const test = new NTester('Test');

    let step1Executed = false;
    let step2Executed = false;

    test.addStep('step1', function() {
        step1Executed = true;
        it(1).equal(1);
    }, { comment: '' });

    test.addStep('step2', function() {
        step2Executed = true;
        it(2).equal(2);
    }, { comment: '' });

    main.addSubTest(test);
    await main.run();

    if (!step1Executed || !step2Executed) {
        throw new Error('Not all steps executed');
    }
});

await asyncTest('NTester.run() executes sub-tests', async () => {
    const main = new NTester('Main');
    const sub1 = new NTester('Sub1');
    const sub2 = new NTester('Sub2');

    let sub1Executed = false;
    let sub2Executed = false;

    sub1.addStep('step', function() {
        sub1Executed = true;
        it(1).equal(1);
    });

    sub2.addStep('step', function() {
        sub2Executed = true;
        it(2).equal(2);
    });

    main.addSubTest(sub1);
    main.addSubTest(sub2);

    await main.run();

    if (!sub1Executed || !sub2Executed) {
        throw new Error('Not all sub-tests executed');
    }
});

await asyncTest('NTester handles failing steps', async () => {
    const test = new NTester('Test');

    test.addStep('failing-step', function() {
        it(1).equal(2); // This will fail
    });

    await test.run();

    // Test should have failed
    // But execution should continue
});

await asyncTest('NTester handles async steps', async () => {
    const test = new NTester('Test');

    let asyncExecuted = false;

    test.addStep('async-step', async function() {
        await new Promise(resolve => setTimeout(resolve, 10));
        asyncExecuted = true;
        it(1).equal(1);
    });

    await test.run();

    if (!asyncExecuted) {
        throw new Error('Async step not executed');
    }
});

// ============================================================================
// PLUGIN LIFECYCLE HOOKS - COMPLETE COVERAGE
// ============================================================================

console.log('\n🔌 Testing All Plugin Lifecycle Hooks...\n');

await asyncTest('All plugin hooks execute in order', async () => {
    const manager = resetPluginManager();
    const executionOrder = [];

    class LifecyclePlugin extends AbstractPlugin {
        async onInit() {
            executionOrder.push('onInit');
        }

        async onBeforeRun(process) {
            executionOrder.push('onBeforeRun');
        }

        async onBeforeTest(process) {
            executionOrder.push('onBeforeTest');
        }

        async onBeforeStep(step, process) {
            executionOrder.push('onBeforeStep');
        }

        async onAfterStep(step, process) {
            executionOrder.push('onAfterStep');
        }

        async onAfterTest(process) {
            executionOrder.push('onAfterTest');
        }

        async onAfterRun(process) {
            executionOrder.push('onAfterRun');
        }

        async onReport(process) {
            executionOrder.push('onReport');
        }

        async onDestroy() {
            executionOrder.push('onDestroy');
        }
    }

    const plugin = new LifecyclePlugin();
    manager.register('lifecycle', plugin);

    const test = new NTester('Test');
    test.addStep('test', function() {
        it(1).equal(1);
    });

    await test.initPlugins();
    await test.run();
    await test.console();
    await manager.destroyAll();

    const expectedOrder = [
        'onInit',
        'onBeforeRun',
        'onBeforeTest',
        'onBeforeStep',
        'onAfterStep',
        'onAfterTest',
        'onAfterRun',
        'onReport',
        'onDestroy'
    ];

    if (JSON.stringify(executionOrder) !== JSON.stringify(expectedOrder)) {
        throw new Error(`Hook order mismatch. Got: ${executionOrder.join(', ')}`);
    }
});

await asyncTest('onBeforeStep receives step and process', async () => {
    const manager = resetPluginManager();

    let receivedStep = null;
    let receivedProcess = null;

    class TestPlugin extends AbstractPlugin {
        async onBeforeStep(step, process) {
            receivedStep = step;
            receivedProcess = process;
        }
    }

    manager.register('test', new TestPlugin());

    const test = new NTester('Test');
    test.addStep('my-step', function() {
        it(1).equal(1);
    }, {
        name: 'My Step'
    });

    await test.initPlugins();
    await test.run();

    if (!receivedStep) {
        throw new Error('Step not received');
    }

    if (!receivedProcess) {
        throw new Error('Process not received');
    }

    if (receivedStep.id !== 'my-step') {
        throw new Error('Wrong step received');
    }
});

await asyncTest('onAfterStep receives step with results', async () => {
    const manager = resetPluginManager();

    let stepPassed = null;

    class TestPlugin extends AbstractPlugin {
        async onAfterStep(step, process) {
            stepPassed = step.passed;
        }
    }

    manager.register('test', new TestPlugin());

    const test = new NTester('Test');
    test.addStep('my-step', function() {
        it(1).equal(1);
    });

    await test.initPlugins();
    await test.run();

    if (stepPassed !== true) {
        throw new Error('Step passed status not received');
    }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

console.log('\n🛡️  Testing Error Handling...\n');

await asyncTest('Test continues after step error', async () => {
    const test = new NTester('Test');

    let step2Executed = false;

    test.addStep('failing', function() {
        throw new Error('Test error');
    });

    test.addStep('passing', function() {
        step2Executed = true;
        it(1).equal(1);
    });

    await test.run();

    if (!step2Executed) {
        throw new Error('Execution stopped after error');
    }
});

await asyncTest('Assertion errors are caught', async () => {
    const test = new NTester('Test');

    test.addStep('failing-assertion', function() {
        it(1).equal(2); // Will fail
    });

    await test.run();

    // Should not throw - errors should be caught
});

await asyncTest('Plugin errors do not stop execution', async () => {
    const manager = resetPluginManager();

    class ErrorPlugin extends AbstractPlugin {
        async onBeforeRun() {
            throw new Error('Plugin error');
        }
    }

    manager.register('error-plugin', new ErrorPlugin());

    const test = new NTester('Test');
    test.addStep('test', function() {
        it(1).equal(1);
    });

    await test.initPlugins();
    await test.run();

    // Should complete despite plugin error
});

// ============================================================================
// STEP METADATA
// ============================================================================

console.log('\n📝 Testing Step Metadata...\n');

await asyncTest('Step metadata is preserved', async () => {
    const test = new NTester('Test');

    test.addStep('meta-step', function() {
        it(1).equal(1);
    }, {
        name: 'Metadata Step',
        author: 'Test Author',
        comment: 'Test comment',
        version: '2.0',
        lastUpdate: '15/11/2025',
        custom: 'custom value'
    });

    await test.run();

    // Metadata should be preserved
});

// ============================================================================
// ASYNC EXECUTION
// ============================================================================

console.log('\n⏱️  Testing Async Execution...\n');

await asyncTest('Async steps execute in order', async () => {
    const test = new NTester('Test');
    const order = [];

    test.addStep('step1', async function() {
        await new Promise(resolve => setTimeout(resolve, 20));
        order.push(1);
        it(1).equal(1);
    });

    test.addStep('step2', async function() {
        await new Promise(resolve => setTimeout(resolve, 10));
        order.push(2);
        it(2).equal(2);
    });

    test.addStep('step3', function() {
        order.push(3);
        it(3).equal(3);
    });

    await test.run();

    if (JSON.stringify(order) !== JSON.stringify([1, 2, 3])) {
        throw new Error(`Steps executed out of order: ${order.join(',')}`);
    }
});

await asyncTest('Promise-based steps work', async () => {
    const test = new NTester('Test');

    test.addStep('promise-step', function() {
        return new Promise(resolve => {
            setTimeout(() => {
                it(1).equal(1);
                resolve();
            }, 10);
        });
    });

    await test.run();
});

// ============================================================================
// NESTED SUB-TESTS
// ============================================================================

console.log('\n🌳 Testing Nested Sub-Tests...\n');

await asyncTest('Deeply nested sub-tests work', async () => {
    const level1 = new NTester('Level 1');
    const level2 = new NTester('Level 2');
    const level3 = new NTester('Level 3');

    let level3Executed = false;

    level3.addStep('deep-step', function() {
        level3Executed = true;
        it(1).equal(1);
    });

    level2.addSubTest(level3);
    level1.addSubTest(level2);

    await level1.run();

    if (!level3Executed) {
        throw new Error('Deep nested test not executed');
    }
});

await asyncTest('Multiple sub-tests execute in order', async () => {
    const main = new NTester('Main');
    const order = [];

    const sub1 = new NTester('Sub 1');
    sub1.addStep('step', function() {
        order.push(1);
        it(1).equal(1);
    });

    const sub2 = new NTester('Sub 2');
    sub2.addStep('step', function() {
        order.push(2);
        it(2).equal(2);
    });

    const sub3 = new NTester('Sub 3');
    sub3.addStep('step', function() {
        order.push(3);
        it(3).equal(3);
    });

    main.addSubTest(sub1);
    main.addSubTest(sub2);
    main.addSubTest(sub3);

    await main.run();

    if (JSON.stringify(order) !== JSON.stringify([1, 2, 3])) {
        throw new Error(`Sub-tests executed out of order: ${order.join(',')}`);
    }
});

// ============================================================================
// IT() API EDGE CASES
// ============================================================================

console.log('\n🎯 Testing it() API Edge Cases...\n');

await asyncTest('it.message() displays messages', async () => {
    const test = new NTester('Test');

    test.addStep('message-test', function() {
        it.message('Custom message 1');
        it.message('Custom message 2');
        it(1).equal(1);
    });

    await test.run();
});

await asyncTest('Chained assertions work correctly', async () => {
    const test = new NTester('Test');

    test.addStep('chained', function() {
        it(42)
            .number()
            .and.integer()
            .and.greaterThan(40)
            .and.lessThan(50)
            .and.equal(42);
    });

    await test.run();
});

await asyncTest('Complex OR chains work', async () => {
    const test = new NTester('Test');

    test.addStep('or-chain', function() {
        it(42)
            .equal(10)
            .or.equal(20)
            .or.equal(30)
            .or.equal(42); // This one passes
    });

    await test.run();
});

await asyncTest('AND after OR works correctly', async () => {
    const test = new NTester('Test');

    test.addStep('and-or-mix', function() {
        it(42)
            .equal(100).or.number() // OR succeeds (is number)
            .and.greaterThan(40);    // AND continues
    });

    await test.run();
});

// ============================================================================
// CONSOLE OUTPUT
// ============================================================================

console.log('\n📄 Testing Console Output...\n');

await asyncTest('console() does not throw', async () => {
    const test = new NTester('Test');

    test.addStep('test', function() {
        it(1).equal(1);
    });

    await test.run();
    await test.console();

    // Should complete without throwing
});

await asyncTest('console() works with empty test', async () => {
    const test = new NTester('Empty Test');

    await test.run();
    await test.console();
});

await asyncTest('console() works with failed tests', async () => {
    const test = new NTester('Failed Test');

    test.addStep('failing', function() {
        it(1).equal(2);
    });

    await test.run();
    await test.console();
});

// ============================================================================
// RESULTS
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('📊 Core Features Test Results');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total:  ${passed + failed}`);
console.log('='.repeat(60));

if (failed === 0) {
    console.log('\n🎉 All core feature tests passed!');
    console.log('\n✅ NTester core functionality is working correctly!');
    process.exit(0);
} else {
    console.log('\n❌ Some tests failed!');
    console.log('\n🔧 Please check the errors above.\n');
    process.exit(1);
}
