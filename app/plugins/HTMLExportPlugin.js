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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.title}</title>
    <style>
        ${this._getStyles()}
    </style>
</head>
<body>
    <div class="container">
        ${this._generateHeader(results)}
        ${this._generateStats(results.stats)}
        ${this._generateTestResults(results)}
    </div>
    <script>
        ${this._getScripts()}
    </script>
</body>
</html>`;
    }

    /**
     * Génère l'en-tête
     */
    _generateHeader(results) {
        return `
        <header>
            <h1>📊 ${this.title}</h1>
            <div class="header-info">
                <div><strong>Project:</strong> ${results.project}</div>
                <div><strong>Version:</strong> ${results.version}</div>
                <div><strong>Date:</strong> ${new Date(results.date).toLocaleString()}</div>
                ${results.authors.length > 0 ? `<div><strong>Authors:</strong> ${results.authors.join(', ')}</div>` : ''}
            </div>
        </header>`;
    }

    /**
     * Génère les statistiques
     */
    _generateStats(stats) {
        const statusClass = stats.failed === 0 ? 'success' : 'partial';

        return `
        <section class="stats ${statusClass}">
            <div class="stat-card">
                <div class="stat-value">${stats.totalTests}</div>
                <div class="stat-label">Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalSteps}</div>
                <div class="stat-label">Steps</div>
            </div>
            <div class="stat-card success">
                <div class="stat-value">${stats.passed}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card ${stats.failed > 0 ? 'failure' : ''}">
                <div class="stat-value">${stats.failed}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.successRate}%</div>
                <div class="stat-label">Success Rate</div>
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
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

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
