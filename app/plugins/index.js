/**
 * NTester Plugins - Exports
 *
 * Plugin system to extend NTester
 */

// Core
export { default as AbstractPlugin, PluginTypes, RendererPlugin, ReporterPlugin, ServerPlugin } from './AbstractPlugin.js';
export { default as PluginManager, getPluginManager, resetPluginManager } from './PluginManager.js';

// Plugins
export { default as RendererPlugin as TerminalRendererPlugin } from './RendererPlugin.js';
export { default as HTMLExportPlugin } from './HTMLExportPlugin.js';
export { default as HTMLServerPlugin } from './HTMLServerPlugin.js';

/**
 * Helper to create and register plugins quickly
 */
export function registerPlugin(name, plugin, type) {
    const manager = getPluginManager();
    manager.register(name, plugin, type);
    return manager;
}

/**
 * Helper to initialize plugins with NTester context
 */
export async function initPlugins(context) {
    const manager = getPluginManager();
    await manager.initAll(context);
    return manager;
}

/**
 * Creates default plugin configuration
 */
export async function createDefaultPlugins(options = {}) {
    const {
        renderer = true,
        htmlExport = false,
        htmlServer = false,
        rendererType = 'auto',
        htmlPath = './test-report.html',
        serverPort = 3000
    } = options;

    const plugins = [];
    const manager = getPluginManager();

    if (renderer) {
        const { default: RendererPlugin } = await import('./RendererPlugin.js');
        const plugin = new RendererPlugin({ adapterType: rendererType });
        manager.register('renderer', plugin, 'renderer');
        plugins.push({ name: 'renderer', plugin });
    }

    if (htmlExport) {
        const { default: HTMLExportPlugin } = await import('./HTMLExportPlugin.js');
        const plugin = new HTMLExportPlugin({ outputPath: htmlPath });
        manager.register('html-export', plugin, 'reporter');
        plugins.push({ name: 'html-export', plugin });
    }

    if (htmlServer) {
        const { default: HTMLServerPlugin } = await import('./HTMLServerPlugin.js');
        const plugin = new HTMLServerPlugin({
            htmlFile: htmlPath,
            port: serverPort
        });
        manager.register('html-server', plugin, 'server');
        plugins.push({ name: 'html-server', plugin });
    }

    return { manager, plugins };
}
