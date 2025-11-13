#!/usr/bin/env node

/**
 * Demonstration des différents adapters de NTester
 *
 * Ce fichier montre comment utiliser les différents adapters disponibles
 * et leurs fonctionnalités respectives.
 */

import { createAdapter, AdapterFactory } from '../app/adapters/index.js';

// ============================================================================
// DEMO 1: Modern Stack Adapter (RECOMMANDÉ)
// ============================================================================

async function demoModernStack() {
    console.log('\n' + '='.repeat(70));
    console.log('📦 DEMO 1: Modern Stack Adapter (chalk + ora + inquirer + cli-table3)');
    console.log('='.repeat(70) + '\n');

    const adapter = createAdapter('modern');

    // Text styling
    await adapter.displayText('✨ Modern Stack Adapter Demo', {
        color: 'cyan',
        bold: true
    });
    console.log('');

    // Spinner
    const spinner = await adapter.displaySpinner('Loading data...');
    await sleep(2000);
    spinner.succeed('Data loaded successfully!');

    // Table
    await adapter.displayTable(
        [
            ['Alice', '30', 'Engineer'],
            ['Bob', '25', 'Designer'],
            ['Charlie', '35', 'Manager']
        ],
        {
            headers: ['Name', 'Age', 'Role'],
            border: true
        }
    );

    // Progress bar
    const progress = await adapter.displayProgress({
        title: 'Processing',
        total: 100,
        width: 40
    });

    for (let i = 0; i <= 100; i += 10) {
        await sleep(200);
        progress.update(i);
    }
    progress.done();

    console.log('\n✅ Modern Stack Demo Complete!\n');
}

// ============================================================================
// DEMO 2: Minimal Adapter
// ============================================================================

async function demoMinimal() {
    console.log('\n' + '='.repeat(70));
    console.log('🪶 DEMO 2: Minimal Adapter (console simple)');
    console.log('='.repeat(70) + '\n');

    const adapter = createAdapter('minimal', { colors: true });

    // Text
    await adapter.displayText('🪶 Minimal Adapter Demo', {
        color: 'green',
        bold: true
    });
    console.log('');

    // Spinner (non-animated)
    const spinner = await adapter.displaySpinner('Processing...');
    await sleep(1500);
    spinner.succeed('Done!');

    // Table (ASCII art)
    await adapter.displayTable(
        [
            ['Feature', 'Status'],
            ['Lightweight', '✓'],
            ['Fast', '✓'],
            ['No deps', '✓']
        ],
        {
            headers: ['Feature', 'Status'],
            border: true
        }
    );

    console.log('\n✅ Minimal Demo Complete!\n');
}

// ============================================================================
// DEMO 3: Auto-Detection
// ============================================================================

async function demoAutoDetect() {
    console.log('\n' + '='.repeat(70));
    console.log('🤖 DEMO 3: Auto-Detection');
    console.log('='.repeat(70) + '\n');

    const adapter = createAdapter('auto');

    await adapter.displayText('🤖 Auto-detected adapter!', {
        color: 'magenta',
        bold: true
    });

    const detected = process.env.CI ? 'minimal' : 'modern';
    await adapter.displayText(`Detected environment: ${detected}`, {
        color: 'gray'
    });

    console.log('\n✅ Auto-Detect Demo Complete!\n');
}

// ============================================================================
// DEMO 4: Custom Configuration
// ============================================================================

async function demoConfiguration() {
    console.log('\n' + '='.repeat(70));
    console.log('⚙️  DEMO 4: Configuration');
    console.log('='.repeat(70) + '\n');

    // Set default adapter
    AdapterFactory.setDefault('modern');

    // Create with default
    const adapter = AdapterFactory.createDefault();

    await adapter.displayText('⚙️  Using configured default adapter', {
        color: 'yellow',
        bold: true
    });

    // List available adapters
    const available = AdapterFactory.listAvailable();
    await adapter.displayText(`\nAvailable adapters: ${available.join(', ')}`, {
        color: 'gray'
    });

    console.log('\n✅ Configuration Demo Complete!\n');
}

// ============================================================================
// DEMO 5: Feature Comparison
// ============================================================================

async function demoComparison() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 DEMO 5: Feature Comparison');
    console.log('='.repeat(70) + '\n');

    const adapter = createAdapter('modern');

    await adapter.displayTable(
        [
            ['Modern Stack', '✓', '✓', '✓', 'Medium', '⭐⭐⭐⭐⭐'],
            ['Ink (React)', '✓', '✓', '✓', 'Large', '⭐⭐⭐⭐'],
            ['Minimal', '✓', '✗', '✗', 'Tiny', '⭐⭐⭐'],
            ['terminal-kit', '✓', '✓', '✓', 'Large', '⭐⭐']
        ],
        {
            headers: [
                'Adapter',
                'Tables',
                'Interactive',
                'Spinners',
                'Bundle',
                'Rating'
            ],
            border: true
        }
    );

    console.log('\n💡 Recommendation: Use Modern Stack for best balance!');
    console.log('✅ Comparison Demo Complete!\n');
}

// ============================================================================
// DEMO 6: Interactive Features (commented - requires user input)
// ============================================================================

async function demoInteractive() {
    console.log('\n' + '='.repeat(70));
    console.log('🎮 DEMO 6: Interactive Features (SKIPPED in auto mode)');
    console.log('='.repeat(70) + '\n');

    console.log('ℹ️  Interactive demos require manual testing');
    console.log('   Uncomment and run manually to test:');
    console.log('   - prompt() - text input');
    console.log('   - confirm() - yes/no questions');
    console.log('   - select() - menu selection\n');

    // Uncomment to test interactively:
    /*
    const adapter = createAdapter('modern');

    const name = await adapter.prompt('What is your name?', {
        default: 'User'
    });
    await adapter.displayText(`Hello, ${name}!`, { color: 'green' });

    const confirmed = await adapter.confirm('Do you like NTester?');
    await adapter.displayText(
        confirmed ? '❤️  Thank you!' : '😢 We\'ll improve!',
        { color: confirmed ? 'green' : 'yellow' }
    );

    const choice = await adapter.select(['Modern Stack', 'Ink', 'Minimal'], {
        message: 'Choose your favorite adapter:'
    });
    await adapter.displayText(`You chose: ${choice}`, { color: 'cyan' });
    */
}

// ============================================================================
// UTILITIES
// ============================================================================

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.clear();

    console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                   NTester Terminal Adapters Demo                       ║
║                  Showcase of Available Adapters                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

    const demos = [
        { name: 'Modern Stack', fn: demoModernStack },
        { name: 'Minimal', fn: demoMinimal },
        { name: 'Auto-Detect', fn: demoAutoDetect },
        { name: 'Configuration', fn: demoConfiguration },
        { name: 'Comparison', fn: demoComparison },
        { name: 'Interactive', fn: demoInteractive }
    ];

    for (const demo of demos) {
        try {
            await demo.fn();
            await sleep(1000); // Pause between demos
        } catch (error) {
            console.error(`❌ Error in ${demo.name} demo:`, error.message);
            // Continue with other demos
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 All Demos Complete!');
    console.log('='.repeat(70));

    console.log(`
📚 Next Steps:
   1. Install dependencies: npm install
   2. Choose your adapter in your project
   3. Read the docs: docs/TERMINAL-ADAPTERS.md

⭐ Recommended: Use 'modern' adapter for best experience!
`);
}

// Run demos
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { demoModernStack, demoMinimal, demoAutoDetect };
