import AbstractPlugin, { PluginTypes } from './AbstractPlugin.js';

/**
 * PluginManager - Gestionnaire central de tous les plugins
 *
 * Gère le cycle de vie, l'enregistrement et l'exécution des plugins
 */
export default class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.pluginsByType = new Map();
        this.context = null;
        this.hooks = new Map();
    }

    // =========================================================================
    // PLUGIN REGISTRATION
    // =========================================================================

    /**
     * Enregistre un plugin
     * @param {string} name - Nom du plugin
     * @param {AbstractPlugin} plugin - Instance du plugin
     * @param {string} type - Type du plugin (optional)
     */
    register(name, plugin, type = PluginTypes.HOOK) {
        if (!(plugin instanceof AbstractPlugin)) {
            throw new Error(`Plugin ${name} must extend AbstractPlugin`);
        }

        if (this.plugins.has(name)) {
            console.warn(`Plugin ${name} already registered, overriding...`);
        }

        this.plugins.set(name, plugin);

        // Index par type
        if (!this.pluginsByType.has(type)) {
            this.pluginsByType.set(type, new Map());
        }
        this.pluginsByType.get(type).set(name, plugin);

        console.log(`✓ Plugin registered: ${name} (${type})`);
    }

    /**
     * Désenregistre un plugin
     * @param {string} name - Nom du plugin
     */
    async unregister(name) {
        const plugin = this.plugins.get(name);
        if (plugin) {
            await plugin.onDestroy();
            this.plugins.delete(name);

            // Remove from type index
            for (const [type, typePlugins] of this.pluginsByType.entries()) {
                if (typePlugins.has(name)) {
                    typePlugins.delete(name);
                }
            }

            console.log(`✓ Plugin unregistered: ${name}`);
        }
    }

    /**
     * Obtient un plugin par son nom
     * @param {string} name
     * @returns {AbstractPlugin|null}
     */
    get(name) {
        return this.plugins.get(name) || null;
    }

    /**
     * Obtient tous les plugins d'un type
     * @param {string} type
     * @returns {Map<string, AbstractPlugin>}
     */
    getByType(type) {
        return this.pluginsByType.get(type) || new Map();
    }

    /**
     * Liste tous les plugins enregistrés
     * @returns {Array<Object>}
     */
    list() {
        return Array.from(this.plugins.entries()).map(([name, plugin]) => ({
            name,
            ...plugin.getMetadata()
        }));
    }

    // =========================================================================
    // LIFECYCLE MANAGEMENT
    // =========================================================================

    /**
     * Initialise tous les plugins
     * @param {Object} context - Contexte NTester
     */
    async initAll(context) {
        this.context = context;

        for (const [name, plugin] of this.plugins.entries()) {
            if (plugin.isEnabled()) {
                try {
                    await plugin.onInit(context);
                    console.log(`✓ Plugin initialized: ${name}`);
                } catch (error) {
                    console.error(`✗ Error initializing plugin ${name}:`, error);
                }
            }
        }
    }

    /**
     * Exécute un hook sur tous les plugins
     * @param {string} hookName - Nom du hook (onBeforeRun, onAfterRun, etc.)
     * @param  {...any} args - Arguments à passer au hook
     */
    async executeHook(hookName, ...args) {
        const results = [];

        for (const [name, plugin] of this.plugins.entries()) {
            if (plugin.isEnabled() && typeof plugin[hookName] === 'function') {
                try {
                    const result = await plugin[hookName](...args);
                    results.push({ name, result });
                } catch (error) {
                    console.error(`✗ Error in ${name}.${hookName}:`, error);
                    results.push({ name, error });
                }
            }
        }

        // Execute custom hooks
        if (this.hooks.has(hookName)) {
            for (const callback of this.hooks.get(hookName)) {
                try {
                    await callback(...args);
                } catch (error) {
                    console.error(`✗ Error in custom hook ${hookName}:`, error);
                }
            }
        }

        return results;
    }

    /**
     * Enregistre un hook global
     * @param {string} hookName
     * @param {Function} callback
     */
    registerGlobalHook(hookName, callback) {
        if (!this.hooks.has(hookName)) {
            this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName).push(callback);
    }

    // =========================================================================
    // PLUGIN MANAGEMENT
    // =========================================================================

    /**
     * Active un plugin
     * @param {string} name
     */
    enable(name) {
        const plugin = this.plugins.get(name);
        if (plugin) {
            plugin.enable();
            console.log(`✓ Plugin enabled: ${name}`);
        }
    }

    /**
     * Désactive un plugin
     * @param {string} name
     */
    disable(name) {
        const plugin = this.plugins.get(name);
        if (plugin) {
            plugin.disable();
            console.log(`✓ Plugin disabled: ${name}`);
        }
    }

    /**
     * Vérifie si un plugin existe
     * @param {string} name
     * @returns {boolean}
     */
    has(name) {
        return this.plugins.has(name);
    }

    /**
     * Détruit tous les plugins
     */
    async destroyAll() {
        for (const [name, plugin] of this.plugins.entries()) {
            try {
                await plugin.onDestroy();
            } catch (error) {
                console.error(`✗ Error destroying plugin ${name}:`, error);
            }
        }
        this.plugins.clear();
        this.pluginsByType.clear();
        this.hooks.clear();
    }

    // =========================================================================
    // UTILITIES
    // =========================================================================

    /**
     * Charge des plugins depuis une configuration
     * @param {Object} config - Configuration des plugins
     */
    async loadFromConfig(config) {
        if (!config || !config.plugins) return;

        for (const [name, pluginConfig] of Object.entries(config.plugins)) {
            try {
                const { path, type, options, enabled = true } = pluginConfig;

                if (!enabled) continue;

                // Dynamic import
                const module = await import(path);
                const PluginClass = module.default || module[name];

                if (!PluginClass) {
                    throw new Error(`Plugin ${name} not found in ${path}`);
                }

                const plugin = new PluginClass(options);
                this.register(name, plugin, type);
            } catch (error) {
                console.error(`✗ Error loading plugin ${name}:`, error);
            }
        }
    }

    /**
     * Obtient les statistiques des plugins
     * @returns {Object}
     */
    getStats() {
        const total = this.plugins.size;
        const enabled = Array.from(this.plugins.values()).filter(p =>
            p.isEnabled()
        ).length;

        const byType = {};
        for (const [type, plugins] of this.pluginsByType.entries()) {
            byType[type] = plugins.size;
        }

        return {
            total,
            enabled,
            disabled: total - enabled,
            byType
        };
    }
}

/**
 * Instance globale du PluginManager (Singleton)
 */
let globalPluginManager = null;

export function getPluginManager() {
    if (!globalPluginManager) {
        globalPluginManager = new PluginManager();
    }
    return globalPluginManager;
}

export function resetPluginManager() {
    if (globalPluginManager) {
        globalPluginManager.destroyAll();
    }
    globalPluginManager = new PluginManager();
    return globalPluginManager;
}
