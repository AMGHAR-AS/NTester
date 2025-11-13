import { RendererPlugin as BaseRendererPlugin } from './AbstractPlugin.js';
import { createAdapter } from '../adapters/index.js';

/**
 * RendererPlugin - Plugin pour utiliser les adapters terminaux
 *
 * Permet d'utiliser les adapters (Modern, Ink, Minimal) via le système de plugins
 */
export default class RendererPlugin extends BaseRendererPlugin {
    constructor(options = {}) {
        super(options);

        this.adapterType = options.adapterType || 'auto';
        this.adapterOptions = options.adapterOptions || {};
        this.adapter = null;
    }

    /**
     * Métadonnées du plugin
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
     * Initialisation - Crée l'adapter
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
     * Avant l'exécution des tests
     */
    async onBeforeRun(process) {
        if (this.adapter && this.adapter.clear) {
            this.adapter.clear();
        }
    }

    /**
     * Après l'exécution - Génère le rapport
     */
    async onAfterRun(process) {
        // Les résultats sont maintenant disponibles dans process
        // On peut utiliser l'adapter pour afficher un résumé
        if (this.adapter) {
            await this._displaySummary(process);
        }
    }

    /**
     * Génération du rapport
     */
    async onReport(process) {
        if (this.adapter) {
            await this._generateReport(process);
        }
    }

    /**
     * Affiche un résumé des tests
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
     * Génère un rapport complet
     */
    async _generateReport(process) {
        // Cette méthode peut être étendue pour générer des rapports plus détaillés
        // Pour l'instant, elle affiche juste un message
        await this.adapter.displayText('Report generated', { color: 'cyan' });
    }

    /**
     * Calcule les statistiques des tests
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
     * Rendu personnalisé (implémentation de l'interface)
     */
    async render(data) {
        if (!this.adapter) {
            throw new Error('Adapter not initialized');
        }

        // Détecte le type de données et utilise la bonne méthode de l'adapter
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
            // Par défaut, affiche en JSON
            await this.adapter.displayText(JSON.stringify(data, null, 2));
        }
    }

    /**
     * Accès direct à l'adapter sous-jacent
     */
    getAdapter() {
        return this.adapter;
    }

    /**
     * Destruction
     */
    async onDestroy() {
        if (this.adapter && this.adapter.exit) {
            this.adapter.exit();
        }
        this.adapter = null;
        await super.onDestroy();
    }
}
