import { ReporterPlugin } from './AbstractPlugin.js';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';

/**
 * HTMLExportPlugin - Exporte les résultats des tests en HTML
 *
 * Génère un rapport HTML complet avec styles et interactivité
 */
export default class HTMLExportPlugin extends ReporterPlugin {
    constructor(options = {}) {
        super(options);

        this.outputPath = options.outputPath || './test-report.html';
        this.title = options.title || 'NTester Report';
        this.includeDetails = options.includeDetails !== false;
        this.autoOpen = options.autoOpen || false;
        this.results = null;
    }

    /**
     * Métadonnées du plugin
     */
    getMetadata() {
        return {
            ...super.getMetadata(),
            name: 'HTML Export Plugin',
            description: 'Exports test results to HTML',
            version: '1.0.0',
            outputPath: this.outputPath
        };
    }

    /**
     * Initialisation
     */
    async onInit(context) {
        await super.onInit(context);
        console.log(`✓ HTML Export Plugin initialized (output: ${this.outputPath})`);
    }

    /**
     * Après l'exécution - Collecte les résultats
     */
    async onAfterRun(process) {
        this.results = this._collectResults(process);
    }

    /**
     * Génération du rapport HTML
     */
    async onReport(process) {
        if (!this.results) {
            this.results = this._collectResults(process);
        }

        await this.generate(this.results);
    }

    /**
     * Génère le fichier HTML
     */
    async generate(results) {
        const html = this._generateHTML(results);
        const outputPath = resolve(this.outputPath);

        try {
            await writeFile(outputPath, html, 'utf-8');
            console.log(`✓ HTML report generated: ${outputPath}`);

            if (this.autoOpen) {
                await this._openInBrowser(outputPath);
            }
        } catch (error) {
            console.error('✗ Failed to write HTML report:', error.message);
            throw error;
        }
    }

    /**
     * Collecte les résultats des tests
     */
    _collectResults(process) {
        const results = {
            project: process.p || 'NTester',
            version: process.v || '1.0',
            date: new Date().toISOString(),
            testName: process.n,
            section: process.s,
            authors: process.a || [],
            subTests: []
        };

        if (process.subTests) {
            for (const subTest of process.subTests) {
                const subTestData = {
                    name: subTest.n,
                    section: subTest.s,
                    steps: []
                };

                if (subTest.steps) {
                    for (const step of subTest.steps) {
                        const stepData = {
                            name: step.n,
                            index: step.index,
                            passed: step.log && step.log.every(r => r === true) && !step.error,
                            results: step.log || [],
                            messages: step.msg || [],
                            error: step.error || null
                        };

                        subTestData.steps.push(stepData);
                    }
                }

                results.subTests.push(subTestData);
            }
        }

        results.stats = this._calculateStats(results);

        return results;
    }

    /**
     * Calcule les statistiques
     */
    _calculateStats(results) {
        let totalSteps = 0;
        let passed = 0;
        let failed = 0;

        for (const subTest of results.subTests) {
            for (const step of subTest.steps) {
                totalSteps++;
                if (step.passed) {
                    passed++;
                } else {
                    failed++;
                }
            }
        }

        return {
            totalTests: results.subTests.length,
            totalSteps,
            passed,
            failed,
            successRate: totalSteps > 0 ? Math.round((passed / totalSteps) * 100) : 0
        };
    }

    /**
     * Génère le HTML complet
     */
    _generateHTML(results) {
        return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.title}</title>
    <style>
        ${this._getStyles()}
    </style>
</head>
<body>
    ${this._generateToolbar(results)}
    <div class="container">
        ${this._generateHeader(results)}
        ${this._generateStats(results.stats)}
        ${this._generateFilters()}
        ${this._generateTestResults(results)}
    </div>
    ${this._generateFloatingActions()}
    <script>
        const RESULTS_DATA = ${JSON.stringify(results, null, 2)};
        ${this._getScripts()}
    </script>
</body>
</html>`;
    }

    /**
     * Génère la toolbar
     */
    _generateToolbar(results) {
        return `
        <div class="toolbar">
            <div class="toolbar-left">
                <h2>🧪 NTester Report</h2>
            </div>
            <div class="toolbar-right">
                <div class="search-box">
                    <input type="text" id="searchInput" placeholder="🔍 Search tests..." />
                </div>
                <button class="btn-icon" id="darkModeToggle" title="Toggle Dark Mode">
                    <span class="icon-light">🌙</span>
                    <span class="icon-dark">☀️</span>
                </button>
                <button class="btn-icon" id="exportJson" title="Export as JSON">📥</button>
                <button class="btn-icon" id="printReport" title="Print Report">🖨️</button>
            </div>
        </div>`;
    }

    /**
     * Génère l'en-tête
     */
    _generateHeader(results) {
        return `
        <header>
            <div class="header-title">
                <h1>📊 ${this.title}</h1>
                <span class="header-subtitle">${results.testName || 'Test Report'}</span>
            </div>
            <div class="header-info">
                <div class="info-item">
                    <span class="info-label">Project</span>
                    <span class="info-value">${results.project}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Version</span>
                    <span class="info-value">${results.version}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Date</span>
                    <span class="info-value">${new Date(results.date).toLocaleString()}</span>
                </div>
                ${results.authors.length > 0 ? `
                <div class="info-item">
                    <span class="info-label">Authors</span>
                    <span class="info-value">${results.authors.join(', ')}</span>
                </div>` : ''}
            </div>
        </header>`;
    }

    /**
     * Génère les filtres
     */
    _generateFilters() {
        return `
        <div class="filters">
            <button class="filter-btn active" data-filter="all">
                <span class="filter-icon">📋</span>
                All Tests
            </button>
            <button class="filter-btn" data-filter="passed">
                <span class="filter-icon">✅</span>
                Passed Only
            </button>
            <button class="filter-btn" data-filter="failed">
                <span class="filter-icon">❌</span>
                Failed Only
            </button>
        </div>`;
    }

    /**
     * Génère les actions flottantes
     */
    _generateFloatingActions() {
        return `
        <div class="floating-actions">
            <button class="fab" id="scrollTop" title="Scroll to Top">↑</button>
        </div>
        <div id="toast" class="toast"></div>`;
    }

    /**
     * Génère les statistiques
     */
    _generateStats(stats) {
        const statusClass = stats.failed === 0 ? 'success' : 'partial';

        return `
        <section class="stats ${statusClass}">
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.totalTests}</div>
                    <div class="stat-label">Tests</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📝</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.totalSteps}</div>
                    <div class="stat-label">Steps</div>
                </div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.passed}</div>
                    <div class="stat-label">Passed</div>
                </div>
            </div>
            <div class="stat-card ${stats.failed > 0 ? 'failure' : ''}">
                <div class="stat-icon">❌</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.failed}</div>
                    <div class="stat-label">Failed</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📈</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.successRate}%</div>
                    <div class="stat-label">Success Rate</div>
                    <div class="progress-bar">
                        <div class="progress-fill ${stats.successRate === 100 ? 'success' : stats.successRate >= 70 ? 'partial' : 'failure'}"
                             style="width: ${stats.successRate}%"
                             data-percentage="${stats.successRate}"></div>
                    </div>
                </div>
            </div>
        </section>`;
    }

    /**
     * Génère les résultats des tests
     */
    _generateTestResults(results) {
        let html = '<section class="test-results">';

        for (const subTest of results.subTests) {
            html += this._generateSubTest(subTest);
        }

        html += '</section>';
        return html;
    }

    /**
     * Génère un sous-test
     */
    _generateSubTest(subTest) {
        const allPassed = subTest.steps.every(s => s.passed);
        const statusClass = allPassed ? 'success' : 'failure';
        const statusIcon = allPassed ? '✅' : '❌';

        let html = `
        <div class="subtest ${statusClass}">
            <h2 class="subtest-header" onclick="toggleSubtest(this)">
                <span class="status-icon">${statusIcon}</span>
                ${subTest.name}
                ${subTest.section ? `<span class="section">${subTest.section}</span>` : ''}
                <span class="toggle-icon">▼</span>
            </h2>
            <div class="subtest-content">`;

        for (const step of subTest.steps) {
            html += this._generateStep(step);
        }

        html += `
            </div>
        </div>`;

        return html;
    }

    /**
     * Génère une étape
     */
    _generateStep(step) {
        const statusClass = step.passed ? 'success' : 'failure';
        const statusIcon = step.passed ? '✓' : '✗';

        let html = `
        <div class="step ${statusClass}">
            <div class="step-header">
                <span class="status-icon">${statusIcon}</span>
                <span class="step-name">${step.name}</span>
            </div>`;

        if (this.includeDetails) {
            // Messages
            if (step.messages && step.messages.length > 0) {
                html += '<div class="step-messages">';
                for (const msg of step.messages) {
                    html += `<div class="message">${msg}</div>`;
                }
                html += '</div>';
            }

            // Résultats
            if (step.results && step.results.length > 0) {
                html += '<div class="step-results">';
                for (const result of step.results) {
                    const resultClass = result === true ? 'result-pass' : 'result-fail';
                    html += `<span class="result ${resultClass}">${result === true ? '✓' : '✗'}</span>`;
                }
                html += '</div>';
            }

            // Erreurs
            if (step.error) {
                html += `<div class="step-error"><strong>Error:</strong> ${this._escapeHtml(step.error)}</div>`;
            }
        }

        html += '</div>';
        return html;
    }

    /**
     * Échappe le HTML
     */
    _escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Styles CSS
     */
    _getStyles() {
        return `
        /* ========== CSS VARIABLES ========== */
        :root {
            --primary: #667eea;
            --primary-dark: #5568d3;
            --secondary: #764ba2;
            --success: #10b981;
            --success-light: #d1fae5;
            --warning: #f59e0b;
            --warning-light: #fef3c7;
            --danger: #ef4444;
            --danger-light: #fee2e2;
            --bg-main: #f8f9fa;
            --bg-card: #ffffff;
            --bg-hover: #f3f4f6;
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --text-muted: #9ca3af;
            --border: #e5e7eb;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            --radius: 12px;
            --radius-sm: 6px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        [data-theme="dark"] {
            --bg-main: #111827;
            --bg-card: #1f2937;
            --bg-hover: #374151;
            --text-primary: #f9fafb;
            --text-secondary: #d1d5db;
            --text-muted: #9ca3af;
            --border: #374151;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
        }

        /* ========== RESET & BASE ========== */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--bg-main);
            color: var(--text-primary);
            line-height: 1.6;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 80px 20px 20px;
        }

        /* ========== TOOLBAR ========== */
        .toolbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: var(--bg-card);
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            z-index: 1000;
            box-shadow: var(--shadow-sm);
            backdrop-filter: blur(10px);
        }

        .toolbar-left h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--primary);
        }

        .toolbar-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .search-box {
            position: relative;
        }

        .search-box input {
            width: 280px;
            padding: 8px 16px;
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            background: var(--bg-main);
            color: var(--text-primary);
            font-size: 0.875rem;
            transition: var(--transition);
        }

        .search-box input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn-icon {
            width: 40px;
            height: 40px;
            border: none;
            border-radius: var(--radius-sm);
            background: var(--bg-hover);
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            transition: var(--transition);
        }

        .btn-icon:hover {
            background: var(--border);
            transform: translateY(-2px);
        }

        [data-theme="light"] .icon-dark { display: none; }
        [data-theme="dark"] .icon-light { display: none; }

        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        header h1 {
            font-size: 2.5em;
            margin-bottom: 15px;
        }

        .header-info {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            font-size: 1.1em;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
        }

        .stat-card.success {
            border-left-color: #10b981;
        }

        .stat-card.failure {
            border-left-color: #ef4444;
        }

        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
        }

        .stat-card.success .stat-value {
            color: #10b981;
        }

        .stat-card.failure .stat-value {
            color: #ef4444;
        }

        .stat-label {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }

        .subtest {
            background: white;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .subtest-header {
            padding: 20px;
            cursor: pointer;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 10px;
            background: #f9fafb;
            border-left: 4px solid #667eea;
        }

        .subtest.success .subtest-header {
            border-left-color: #10b981;
        }

        .subtest.failure .subtest-header {
            border-left-color: #ef4444;
        }

        .subtest-header:hover {
            background: #f3f4f6;
        }

        .status-icon {
            font-size: 1.5em;
        }

        .section {
            background: #e5e7eb;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            margin-left: auto;
        }

        .toggle-icon {
            margin-left: auto;
            transition: transform 0.3s;
        }

        .subtest.collapsed .toggle-icon {
            transform: rotate(-90deg);
        }

        .subtest-content {
            padding: 20px;
            border-top: 1px solid #e5e7eb;
        }

        .subtest.collapsed .subtest-content {
            display: none;
        }

        .step {
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 6px;
            border-left: 3px solid #e5e7eb;
        }

        .step.success {
            background: #f0fdf4;
            border-left-color: #10b981;
        }

        .step.failure {
            background: #fef2f2;
            border-left-color: #ef4444;
        }

        .step-header {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
        }

        .step-messages {
            margin-top: 10px;
            padding: 10px;
            background: rgba(0,0,0,0.02);
            border-radius: 4px;
        }

        .message {
            padding: 5px 0;
            color: #666;
        }

        .step-results {
            margin-top: 10px;
            display: flex;
            gap: 5px;
        }

        .result {
            width: 24px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-size: 0.8em;
        }

        .result-pass {
            background: #10b981;
            color: white;
        }

        .result-fail {
            background: #ef4444;
            color: white;
        }

        .step-error {
            margin-top: 10px;
            padding: 10px;
            background: #fee;
            border-left: 3px solid #ef4444;
            border-radius: 4px;
            color: #b91c1c;
            font-family: monospace;
        }
        `;
    }

    /**
     * Scripts JavaScript
     */
    _getScripts() {
        return `
        function toggleSubtest(header) {
            const subtest = header.parentElement;
            subtest.classList.toggle('collapsed');
        }

        // Collapse all failed tests by default
        document.addEventListener('DOMContentLoaded', () => {
            // Auto-collapse passed tests if there are failures
            const failedTests = document.querySelectorAll('.subtest.failure');
            if (failedTests.length > 0) {
                const passedTests = document.querySelectorAll('.subtest.success');
                passedTests.forEach(test => test.classList.add('collapsed'));
            }
        });
        `;
    }

    /**
     * Ouvre le rapport dans le navigateur
     */
    async _openInBrowser(path) {
        const { default: open } = await import('open');
        await open(path);
    }
}
