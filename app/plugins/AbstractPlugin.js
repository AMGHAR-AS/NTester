/**
 * AbstractPlugin - Classe de base pour tous les plugins NTester
 *
 * Tous les plugins doivent étendre cette classe et implémenter
 * les méthodes nécessaires selon leur type.
 */
export default class AbstractPlugin {
    constructor(options = {}) {
        this.options = options;
        this.enabled = options.enabled !== false;
        this.name = this.constructor.name;
        this.hooks = {};
        this._context = null;
    }

    // =========================================================================
    // LIFECYCLE HOOKS - À implémenter par les plugins
    // =========================================================================

    /**
     * Appelé lors de l'initialisation du plugin
     * @param {Object} context - Contexte NTester (engine, utils, etc.)
     */
    async onInit(context) {
        this._context = context;
    }

    /**
     * Appelé avant l'exécution des tests
     * @param {Object} testSuite - Suite de tests
     */
    async onBeforeRun(testSuite) {}

    /**
     * Appelé après l'exécution des tests
     * @param {Object} results - Résultats des tests
     */
    async onAfterRun(results) {}

    /**
     * Appelé avant chaque test
     * @param {Object} test - Test individuel
     */
    async onBeforeTest(test) {}

    /**
     * Appelé après chaque test
     * @param {Object} test - Test individuel
     * @param {Object} result - Résultat du test
     */
    async onAfterTest(test, result) {}

    /**
     * Appelé lors de la génération du rapport
     * @param {Object} log - Log complet des tests
     */
    async onReport(log) {}

    /**
     * Appelé lors de la destruction du plugin
     */
    async onDestroy() {}

    // =========================================================================
    // PLUGIN API - Méthodes disponibles pour tous les plugins
    // =========================================================================

    /**
     * Enregistre un hook personnalisé
     * @param {string} hookName - Nom du hook
     * @param {Function} callback - Fonction callback
     */
    registerHook(hookName, callback) {
        if (!this.hooks[hookName]) {
            this.hooks[hookName] = [];
        }
        this.hooks[hookName].push(callback);
    }

    /**
     * Exécute un hook personnalisé
     * @param {string} hookName - Nom du hook
     * @param  {...any} args - Arguments à passer
     */
    async executeHook(hookName, ...args) {
        if (this.hooks[hookName]) {
            for (const callback of this.hooks[hookName]) {
                await callback(...args);
            }
        }
    }

    /**
     * Active le plugin
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Désactive le plugin
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Vérifie si le plugin est activé
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Obtient le contexte NTester
     * @returns {Object}
     */
    getContext() {
        return this._context;
    }

    /**
     * Log un message (helper)
     * @param {string} message
     * @param {string} level - info, warn, error
     */
    log(message, level = 'info') {
        const prefix = `[${this.name}]`;
        switch (level) {
            case 'warn':
                console.warn(prefix, message);
                break;
            case 'error':
                console.error(prefix, message);
                break;
            default:
                console.log(prefix, message);
        }
    }

    // =========================================================================
    // METADATA - Informations sur le plugin
    // =========================================================================

    /**
     * Retourne les métadonnées du plugin
     * @returns {Object}
     */
    getMetadata() {
        return {
            name: this.name,
            version: this.version || '1.0.0',
            description: this.description || 'NTester Plugin',
            author: this.author || 'Unknown',
            enabled: this.enabled
        };
    }

    /**
     * Valide les options du plugin
     * @param {Object} options
     * @returns {boolean}
     */
    validateOptions(options) {
        return true; // À override si nécessaire
    }
}

/**
 * Plugin Types - Types de plugins supportés
 */
export const PluginTypes = {
    RENDERER: 'renderer',      // Plugins de rendu (adapters)
    REPORTER: 'reporter',      // Plugins de rapport (HTML, JSON, etc.)
    TRANSFORMER: 'transformer', // Plugins de transformation de données
    SERVER: 'server',          // Plugins serveur (live reload, etc.)
    HOOK: 'hook'               // Plugins custom hooks
};

/**
 * Plugin Interface - Interface pour les différents types de plugins
 */
export class RendererPlugin extends AbstractPlugin {
    async render(content) {
        throw new Error('RendererPlugin.render() must be implemented');
    }
}

export class ReporterPlugin extends AbstractPlugin {
    async generate(results) {
        throw new Error('ReporterPlugin.generate() must be implemented');
    }
}

export class ServerPlugin extends AbstractPlugin {
    async start() {
        throw new Error('ServerPlugin.start() must be implemented');
    }

    async stop() {
        throw new Error('ServerPlugin.stop() must be implemented');
    }
}
