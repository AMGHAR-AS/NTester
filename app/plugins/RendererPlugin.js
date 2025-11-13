import { RendererPlugin as BaseRendererPlugin } from './AbstractPlugin.js';
import { createAdapter } from '../adapters/index.js';

/**
 * RendererPlugin - Plugin pour utiliser les adapters terminaux
 *
 * Allows using adapters (Modern, Ink, Minimal) via the plugin system
 */
export default class RendererPlugin extends BaseRendererPlugin {
    constructor(options = {}) {
        super(options);

        this.adapterType = options.adapterType || 'auto';
        this.adapterOptions = options.adapterOptions || {};
        this.adapter = null;
    }

    /**
     * Plugin metadata
     */
    getMetadata() {
        return {
            ...super.getMetadata(),
            name: 'Renderer Plugin',
            description: 'Terminal rendering using adapters',
            version: '1.0.0',
            adapterType: this.adapterType
        };
    }

    /**
     * Initialization - Creates the adapter
     */
    async onInit(context) {
        await super.onInit(context);

        try {
            this.adapter = createAdapter(this.adapterType, this.adapterOptions);
            console.log(`✓ Renderer Plugin initialized with ${this.adapterType} adapter`);
        } catch (error) {
            console.error('✗ Failed to create adapter:', error.message);
            throw error;
        }
    }

    /**
     * Before test execution
     */
    async onBeforeRun(process) {
        if (this.adapter && this.adapter.clear) {
            this.adapter.clear();
        }
    }

    /**
     * After execution - Generates report
     */
    async onAfterRun(process) {
        // Results are now available in process
        // Can use adapter to display summary
        if (this.adapter) {
            await this._displaySummary(process);
        }
    }

    /**
     * Report generation
     */
    async onReport(process) {
        if (this.adapter) {
            await this._generateReport(process);
        }
    }

    /**
     * Displays test summary
     */
    async _displaySummary(process) {
        const stats = this._calculateStats(process);

        const summaryText = `\n${'='.repeat(60)}\n` +
            `📊 Test Summary\n` +
            `${'='.repeat(60)}\n` +
            `Project: ${process.p}\n` +
            `Total Tests: ${stats.totalTests}\n` +
            `Total Steps: ${stats.totalSteps}\n` +
            `Passed: ${stats.passed}\n` +
            `Failed: ${stats.failed}\n` +
            `Success Rate: ${stats.successRate}%\n` +
            `${'='.repeat(60)}\n`;

        await this.adapter.displayText(summaryText, {
            color: stats.failed === 0 ? 'green' : 'yellow'
        });
    }

    /**
     * Generates complete report
     */
    async _generateReport(process) {
        // This method can be extended to generate more detailed reports
        // For now, just displays a message
        await this.adapter.displayText('Report generated', { color: 'cyan' });
    }

    /**
     * Calculates statistics des tests
     */
    _calculateStats(process) {
        let totalTests = 0;
        let totalSteps = 0;
        let passed = 0;
        let failed = 0;

        if (process.subTests) {
            totalTests = process.subTests.length;

            for (const subTest of process.subTests) {
                if (subTest.steps) {
                    totalSteps += subTest.steps.length;

                    for (const step of subTest.steps) {
                        if (step.log && step.log.length > 0) {
                            const allPassed = step.log.every(result => result === true);
                            if (allPassed && !step.error) {
                                passed++;
                            } else {
                                failed++;
                            }
                        }
                    }
                }
            }
        }

        const successRate = totalSteps > 0
            ? Math.round((passed / totalSteps) * 100)
            : 0;

        return {
            totalTests,
            totalSteps,
            passed,
            failed,
            successRate
        };
    }

    /**
     * Custom rendering (implémentation de l'interface)
     */
    async render(data) {
        if (!this.adapter) {
            throw new Error('Adapter not initialized');
        }

        // Detects data type and uses appropriate adapter method
        if (typeof data === 'string') {
            await this.adapter.displayText(data);
        } else if (Array.isArray(data)) {
            await this.adapter.displayTable(data);
        } else if (data.type === 'text') {
            await this.adapter.displayText(data.value, data.options);
        } else if (data.type === 'table') {
            await this.adapter.displayTable(data.items, data.options);
        } else if (data.type === 'list') {
            await this.adapter.displayList(data.items, data.options, data.callback);
        } else if (data.type === 'spinner') {
            return await this.adapter.displaySpinner(data.text);
        } else if (data.type === 'progress') {
            return await this.adapter.displayProgress(data.options);
        } else {
            // By default, display as JSON
            await this.adapter.displayText(JSON.stringify(data, null, 2));
        }
    }

    /**
     * Direct access to underlying adapter
     */
    getAdapter() {
        return this.adapter;
    }

    /**
     * Cleanup
     */
    async onDestroy() {
        if (this.adapter && this.adapter.exit) {
            this.adapter.exit();
        }
        this.adapter = null;
        await super.onDestroy();
    }
}
