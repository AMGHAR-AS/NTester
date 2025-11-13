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
