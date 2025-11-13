import AbstractAdapter from './AbstractAdapter.js';
import ModernStackAdapter from './ModernStackAdapter.js';
import InkAdapter from './InkAdapter.js';
import MinimalAdapter from './MinimalAdapter.js';

/**
 * AdapterFactory - Factory pattern pour créer des adapters
 *
 * Permet de créer facilement un adapter selon le type souhaité
 * et de gérer la configuration globale.
 */
class AdapterFactory {
    static TYPES = {
        MODERN: 'modern',
        INK: 'ink',
        MINIMAL: 'minimal',
        TERMINAL_KIT: 'terminal-kit', // Legacy
        AUTO: 'auto'
    };

    static _defaultType = AdapterFactory.TYPES.MODERN;
    static _customAdapters = new Map();

    /**
     * Crée un adapter du type spécifié
     * @param {string} type - Type d'adapter (modern, ink, minimal, auto)
     * @param {Object} options - Options de configuration
     * @returns {AbstractAdapter} Instance de l'adapter
     */
    static create(type = AdapterFactory.TYPES.AUTO, options = {}) {
        // Auto-detection
        if (type === AdapterFactory.TYPES.AUTO) {
            type = AdapterFactory._detectBestAdapter();
        }

        // Check custom adapters first
        if (AdapterFactory._customAdapters.has(type)) {
            const CustomAdapter = AdapterFactory._customAdapters.get(type);
            return new CustomAdapter(options);
        }

        // Built-in adapters
        switch (type) {
            case AdapterFactory.TYPES.MODERN:
                return new ModernStackAdapter(options);

            case AdapterFactory.TYPES.INK:
                return new InkAdapter(options);

            case AdapterFactory.TYPES.MINIMAL:
                return new MinimalAdapter(options);

            case AdapterFactory.TYPES.TERMINAL_KIT:
                return AdapterFactory._createTerminalKitAdapter(options);

            default:
                console.warn(
                    `Unknown adapter type "${type}", falling back to modern stack`
                );
                return new ModernStackAdapter(options);
        }
    }

    /**
     * Enregistre un adapter personnalisé
     * @param {string} name - Nom de l'adapter
     * @param {Class} AdapterClass - Classe de l'adapter (doit étendre AbstractAdapter)
     */
    static register(name, AdapterClass) {
        if (!(AdapterClass.prototype instanceof AbstractAdapter)) {
            throw new Error(
                'Custom adapter must extend AbstractAdapter'
            );
        }

        AdapterFactory._customAdapters.set(name, AdapterClass);
    }

    /**
     * Définit l'adapter par défaut
     * @param {string} type - Type d'adapter par défaut
     */
    static setDefault(type) {
        AdapterFactory._defaultType = type;
    }

    /**
     * Obtient l'adapter par défaut
     * @returns {string} Type d'adapter par défaut
     */
    static getDefault() {
        return AdapterFactory._defaultType;
    }

    /**
     * Crée un adapter avec la configuration par défaut
     * @param {Object} options - Options supplémentaires
     * @returns {AbstractAdapter} Instance de l'adapter
     */
    static createDefault(options = {}) {
        return AdapterFactory.create(AdapterFactory._defaultType, options);
    }

    /**
     * Détecte le meilleur adapter disponible
     * @returns {string} Type d'adapter recommandé
     * @private
     */
    static _detectBestAdapter() {
        // Check if running in CI/CD
        if (process.env.CI || !process.stdout.isTTY) {
            return AdapterFactory.TYPES.MINIMAL;
        }

        // Check for React/Ink preference
        if (process.env.NTESTER_ADAPTER === 'ink') {
            return AdapterFactory.TYPES.INK;
        }

        // Check for minimal preference
        if (process.env.NTESTER_ADAPTER === 'minimal') {
            return AdapterFactory.TYPES.MINIMAL;
        }

        // Default to modern stack (best balance)
        return AdapterFactory.TYPES.MODERN;
    }

    /**
     * Crée l'adapter legacy terminal-kit
     * @param {Object} options - Options
     * @returns {AbstractAdapter} Instance de l'adapter
     * @private
     */
    static _createTerminalKitAdapter(options) {
        try {
            // Try to load the old ConsoleAdapter
            const ConsoleAdapter = require('../ConsoleAdapter.js').default;
            return new ConsoleAdapter(options);
        } catch (error) {
            console.warn(
                'terminal-kit adapter not available, falling back to modern stack'
            );
            return new ModernStackAdapter(options);
        }
    }

    /**
     * Liste tous les adapters disponibles
     * @returns {Array<string>} Liste des types d'adapters
     */
    static listAvailable() {
        return [
            ...Object.values(AdapterFactory.TYPES),
            ...Array.from(AdapterFactory._customAdapters.keys())
        ];
    }

    /**
     * Vérifie si un adapter est disponible
     * @param {string} type - Type d'adapter
     * @returns {boolean} true si disponible
     */
    static isAvailable(type) {
        return (
            Object.values(AdapterFactory.TYPES).includes(type) ||
            AdapterFactory._customAdapters.has(type)
        );
    }
}

// Export the class
export { AdapterFactory };
export default AdapterFactory;

/**
 * Helper function pour créer rapidement un adapter
 * @param {string} type - Type d'adapter
 * @param {Object} options - Options
 * @returns {AbstractAdapter} Instance de l'adapter
 */
export function createAdapter(type, options) {
    return AdapterFactory.create(type, options);
}

/**
 * Configuration globale via fichier ou objet
 */
export class AdapterConfig {
    static _config = {
        defaultType: AdapterFactory.TYPES.MODERN,
        options: {}
    };

    /**
     * Charge la configuration depuis un fichier ou objet
     * @param {Object|string} config - Configuration ou chemin vers fichier
     */
    static async load(config) {
        if (typeof config === 'string') {
            // Load from file
            try {
                const fs = await import('fs/promises');
                const content = await fs.readFile(config, 'utf-8');
                config = JSON.parse(content);
            } catch (error) {
                console.error('Failed to load adapter config:', error);
                return;
            }
        }

        AdapterConfig._config = {
            ...AdapterConfig._config,
            ...config
        };

        if (config.defaultType) {
            AdapterFactory.setDefault(config.defaultType);
        }
    }

    /**
     * Obtient la configuration actuelle
     * @returns {Object} Configuration
     */
    static get() {
        return { ...AdapterConfig._config };
    }

    /**
     * Met à jour la configuration
     * @param {Object} updates - Mises à jour
     */
    static update(updates) {
        AdapterConfig._config = {
            ...AdapterConfig._config,
            ...updates
        };

        if (updates.defaultType) {
            AdapterFactory.setDefault(updates.defaultType);
        }
    }
}

/**
 * Exemples d'utilisation:
 *
 * // Basic usage
 * import { createAdapter } from './AdapterFactory.js';
 *
 * const adapter = createAdapter('modern');
 * await adapter.displayText('Hello!', { color: 'green' });
 *
 * // With configuration
 * import { AdapterFactory, AdapterConfig } from './AdapterFactory.js';
 *
 * AdapterConfig.update({
 *   defaultType: 'modern',
 *   options: { colors: true }
 * });
 *
 * const adapter = AdapterFactory.createDefault();
 *
 * // Register custom adapter
 * class MyAdapter extends AbstractAdapter {
 *   // ... implementation
 * }
 *
 * AdapterFactory.register('my-adapter', MyAdapter);
 * const myAdapter = createAdapter('my-adapter');
 *
 * // Environment-based
 * process.env.NTESTER_ADAPTER = 'ink';
 * const adapter = createAdapter('auto'); // Will use Ink
 *
 * // Load from config file
 * await AdapterConfig.load('./.ntester.json');
 * const adapter = AdapterFactory.createDefault();
 */
