import { ServerPlugin } from './AbstractPlugin.js';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { watch } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * HTMLServerPlugin - Serveur HTTP avec live reload
 *
 * Lance un serveur HTTP pour afficher les rapports HTML en temps réel
 * avec rechargement automatique lors des modifications
 */
export default class HTMLServerPlugin extends ServerPlugin {
    constructor(options = {}) {
        super(options);

        this.port = options.port || 3000;
        this.host = options.host || 'localhost';
        this.htmlFile = options.htmlFile || './test-report.html';
        this.watchFiles = options.watchFiles || ['./tests/**/*.js', './app/**/*.js'];
        this.autoRerun = options.autoRerun !== false;

        this.server = null;
        this.clients = new Set();
        this.watcher = null;
    }

    /**
     * Métadonnées du plugin
     */
    getMetadata() {
        return {
            ...super.getMetadata(),
            name: 'HTML Server Plugin',
            description: 'HTTP server with live reload',
            version: '1.0.0',
            port: this.port,
            url: `http://${this.host}:${this.port}`
        };
    }

    /**
     * Initialisation
     */
    async onInit(context) {
        await super.onInit(context);
        console.log(`✓ HTML Server Plugin initialized (${this.host}:${this.port})`);
    }

    /**
     * Démarre le serveur
     */
    async start() {
        await this._createServer();
        await this._startWatching();
        console.log(`🚀 Server running at http://${this.host}:${this.port}`);
        console.log(`📁 Serving: ${this.htmlFile}`);
        console.log(`👀 Watching for changes...`);
    }

    /**
     * Arrête le serveur
     */
    async stop() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }

        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(() => {
                    console.log('✓ Server stopped');
                    resolve();
                });
            });
        }
    }

    /**
     * Crée le serveur HTTP
     */
    async _createServer() {
        this.server = createServer(async (req, res) => {
            try {
                if (req.url === '/') {
                    await this._serveHTML(res);
                } else if (req.url === '/events') {
                    this._handleSSE(req, res);
                } else if (req.url === '/status') {
                    this._serveStatus(res);
                } else if (req.url === '/api/stats') {
                    this._serveStats(res);
                } else {
                    res.writeHead(404);
                    res.end('Not found');
                }
            } catch (error) {
                console.error('Server error:', error);
                res.writeHead(500);
                res.end('Internal server error');
            }
        });

        return new Promise((resolve, reject) => {
            this.server.listen(this.port, this.host, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }

    /**
     * Sert le fichier HTML avec live reload injecté
     */
    async _serveHTML(res) {
        try {
            const htmlPath = resolve(this.htmlFile);
            let html = await readFile(htmlPath, 'utf-8');

            // Injecte le script de live reload
            const liveReloadScript = this._getLiveReloadScript();
            html = html.replace('</body>', `${liveReloadScript}</body>`);

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        } catch (error) {
            console.error('Error serving HTML:', error);
            res.writeHead(500);
            res.end(this._getErrorPage(error));
        }
    }

    /**
     * Gère les connexions Server-Sent Events pour le live reload
     */
    _handleSSE(req, res) {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // Ajoute le client
        this.clients.add(res);

        // Envoie un message initial
        res.write('data: {"type":"connected"}\n\n');

        // Nettoie à la déconnexion
        req.on('close', () => {
            this.clients.delete(res);
        });
    }

    /**
     * Sert la page de status
     */
    _serveStatus(res) {
        const stats = {
            clients: this.clients.size,
            uptime: process.uptime(),
            port: this.port,
            htmlFile: this.htmlFile
        };

        const html = this._getStatusPage(stats);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    }

    /**
     * Sert les stats en JSON
     */
    _serveStats(res) {
        const stats = {
            clients: this.clients.size,
            uptime: process.uptime(),
            port: this.port,
            htmlFile: this.htmlFile,
            memory: process.memoryUsage(),
            timestamp: Date.now()
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(stats, null, 2));
    }

    /**
     * Génère la page de status
     */
    _getStatusPage(stats) {
        const uptimeFormatted = this._formatUptime(stats.uptime);

        return `
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NTester Server Status</title>
    <style>
        ${this._getStatusStyles()}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🌐 NTester Server Status</h1>
            <div class="status-indicator online">
                <span class="pulse"></span>
                <span>Online</span>
            </div>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                    <div class="stat-value" id="clientCount">${stats.clients}</div>
                    <div class="stat-label">Connected Clients</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-info">
                    <div class="stat-value" id="uptime">${uptimeFormatted}</div>
                    <div class="stat-label">Uptime</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">🔌</div>
                <div class="stat-info">
                    <div class="stat-value">:${stats.port}</div>
                    <div class="stat-label">Port</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">📄</div>
                <div class="stat-info">
                    <div class="stat-value" style="font-size: 0.9rem">${stats.htmlFile}</div>
                    <div class="stat-label">Report File</div>
                </div>
            </div>
        </div>

        <div class="actions">
            <a href="/" class="btn primary">View Report</a>
            <button onclick="refreshStats()" class="btn">Refresh Stats</button>
            <button onclick="toggleDarkMode()" class="btn">🌙 Dark Mode</button>
        </div>

        <div class="info-section">
            <h2>📡 Server Information</h2>
            <div class="info-grid">
                <div class="info-item">
                    <strong>URL:</strong>
                    <code>http://${this.host}:${this.port}</code>
                </div>
                <div class="info-item">
                    <strong>Live Reload:</strong>
                    <span class="badge success">Enabled</span>
                </div>
                <div class="info-item">
                    <strong>Auto-rerun:</strong>
                    <span class="badge ${this.autoRerun ? 'success' : 'muted'}">${this.autoRerun ? 'Enabled' : 'Disabled'}</span>
                </div>
            </div>
        </div>
    </div>

    <script>
        ${this._getStatusScripts()}
    </script>
</body>
</html>`;
    }

    /**
     * Format uptime
     */
    _formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        parts.push(`${secs}s`);

        return parts.join(' ');
    }

    /**
     * Styles pour la page de status
     */
    _getStatusStyles() {
        return `
        :root {
            --primary: #667eea;
            --success: #10b981;
            --bg: #f8f9fa;
            --card: #ffffff;
            --text: #1f2937;
            --border: #e5e7eb;
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        [data-theme="dark"] {
            --bg: #111827;
            --card: #1f2937;
            --text: #f9fafb;
            --border: #374151;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            padding: 20px;
            transition: all 0.3s ease;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
        }

        header {
            text-align: center;
            margin-bottom: 40px;
        }

        header h1 {
            font-size: 2.5rem;
            margin-bottom: 16px;
        }

        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
        }

        .status-indicator.online {
            background: #d1fae5;
            color: #059669;
        }

        .pulse {
            width: 12px;
            height: 12px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% {
                opacity: 1;
                transform: scale(1);
            }
            50% {
                opacity: 0.5;
                transform: scale(1.1);
            }
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }

        .stat-card {
            background: var(--card);
            padding: 24px;
            border-radius: 12px;
            box-shadow: var(--shadow);
            display: flex;
            gap: 16px;
            align-items: center;
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-4px);
        }

        .stat-icon {
            font-size: 2.5rem;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary);
        }

        .stat-label {
            font-size: 0.875rem;
            color: var(--text);
            opacity: 0.7;
        }

        .actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-bottom: 32px;
            flex-wrap: wrap;
        }

        .btn {
            padding: 12px 24px;
            border-radius: 8px;
            border: none;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }

        .btn.primary {
            background: var(--primary);
            color: white;
        }

        .btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 12px -3px rgba(102, 126, 234, 0.3);
        }

        .btn:not(.primary) {
            background: var(--card);
            color: var(--text);
            border: 2px solid var(--border);
        }

        .btn:not(.primary):hover {
            border-color: var(--primary);
        }

        .info-section {
            background: var(--card);
            padding: 24px;
            border-radius: 12px;
            box-shadow: var(--shadow);
        }

        .info-section h2 {
            margin-bottom: 16px;
        }

        .info-grid {
            display: grid;
            gap: 12px;
        }

        .info-item {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        code {
            background: var(--bg);
            padding: 4px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }

        .badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .badge.success {
            background: #d1fae5;
            color: #059669;
        }

        .badge.muted {
            background: var(--border);
            color: var(--text);
        }

        @media (max-width: 768px) {
            header h1 {
                font-size: 1.75rem;
            }
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
        `;
    }

    /**
     * Scripts pour la page de status
     */
    _getStatusScripts() {
        return `
        // Auto-refresh stats
        async function refreshStats() {
            try {
                const response = await fetch('/api/stats');
                const stats = await response.json();

                document.getElementById('clientCount').textContent = stats.clients;
                document.getElementById('uptime').textContent = formatUptime(stats.uptime);
            } catch (error) {
                console.error('Failed to refresh stats:', error);
            }
        }

        function formatUptime(seconds) {
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);

            const parts = [];
            if (days > 0) parts.push(days + 'd');
            if (hours > 0) parts.push(hours + 'h');
            if (minutes > 0) parts.push(minutes + 'm');
            parts.push(secs + 's');

            return parts.join(' ');
        }

        function toggleDarkMode() {
            const html = document.documentElement;
            const current = html.getAttribute('data-theme');
            const newTheme = current === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
        }

        // Auto-refresh every 5 seconds
        setInterval(refreshStats, 5000);
        `;
    }

    /**
     * Notifie tous les clients connectés
     */
    _notifyClients(event) {
        const data = `data: ${JSON.stringify(event)}\n\n`;

        for (const client of this.clients) {
            try {
                client.write(data);
            } catch (error) {
                this.clients.delete(client);
            }
        }
    }

    /**
     * Script de live reload
     */
    _getLiveReloadScript() {
        return `
        <script>
            (function() {
                console.log('🔄 Live reload enabled');

                const eventSource = new EventSource('/events');

                eventSource.onmessage = function(event) {
                    const data = JSON.parse(event.data);

                    if (data.type === 'reload') {
                        console.log('🔄 Reloading page...');
                        setTimeout(() => {
                            window.location.reload();
                        }, 100);
                    } else if (data.type === 'connected') {
                        console.log('✓ Connected to live reload server');
                    } else if (data.type === 'test-start') {
                        console.log('🧪 Tests running...');
                    } else if (data.type === 'test-end') {
                        console.log('✓ Tests completed');
                    }
                };

                eventSource.onerror = function(error) {
                    console.log('⚠️ Live reload connection lost, retrying...');
                };

                // Heartbeat pour garder la connexion active
                setInterval(() => {
                    if (eventSource.readyState === EventSource.OPEN) {
                        // Connection is alive
                    }
                }, 30000);
            })();
        </script>
        `;
    }

    /**
     * Page d'erreur
     */
    _getErrorPage(error) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error - NTester Server</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    padding: 50px;
                    background: #f5f5f5;
                }
                .error {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    border-left: 4px solid #ef4444;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                h1 { color: #ef4444; }
                pre {
                    background: #f9fafb;
                    padding: 15px;
                    border-radius: 6px;
                    overflow-x: auto;
                }
            </style>
        </head>
        <body>
            <div class="error">
                <h1>⚠️ Error Loading Test Report</h1>
                <p>Could not load the HTML report file: <code>${this.htmlFile}</code></p>
                <h3>Error Details:</h3>
                <pre>${error.message}</pre>
                <p>Make sure to run the tests first to generate the HTML report.</p>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Surveille les changements de fichiers
     */
    async _startWatching() {
        if (!this.autoRerun) {
            return;
        }

        const watchPaths = Array.isArray(this.watchFiles) ? this.watchFiles : [this.watchFiles];

        // Surveille le fichier HTML
        const htmlPath = resolve(this.htmlFile);

        try {
            this.watcher = watch(htmlPath, async (eventType) => {
                if (eventType === 'change') {
                    console.log('📄 HTML report updated, reloading clients...');
                    this._notifyClients({ type: 'reload' });
                }
            });
        } catch (error) {
            console.warn('Could not watch HTML file:', error.message);
        }

        // Surveille aussi les fichiers de test si demandé
        if (this.autoRerun && this._context) {
            this._watchTestFiles(watchPaths);
        }
    }

    /**
     * Surveille les fichiers de test
     */
    _watchTestFiles(paths) {
        // Cette fonctionnalité nécessiterait chokidar pour être robuste
        // Pour l'instant, on se contente de surveiller le HTML
        console.log('📝 File watching for auto-rerun not implemented yet');
        console.log('   (requires chokidar or similar for glob patterns)');
    }

    /**
     * Après l'exécution - Notifie les clients
     */
    async onAfterRun(process) {
        if (this.clients.size > 0) {
            console.log(`📡 Notifying ${this.clients.size} connected client(s)...`);
            this._notifyClients({ type: 'test-end' });

            // Attendre un peu avant de recharger
            setTimeout(() => {
                this._notifyClients({ type: 'reload' });
            }, 500);
        }
    }

    /**
     * Avant l'exécution - Notifie les clients
     */
    async onBeforeRun(process) {
        if (this.clients.size > 0) {
            this._notifyClients({ type: 'test-start' });
        }
    }

    /**
     * Destruction
     */
    async onDestroy() {
        await this.stop();
        await super.onDestroy();
    }

    /**
     * Obtenir l'URL du serveur
     */
    getURL() {
        return `http://${this.host}:${this.port}`;
    }

    /**
     * Obtenir le nombre de clients connectés
     */
    getClientCount() {
        return this.clients.size;
    }
}
