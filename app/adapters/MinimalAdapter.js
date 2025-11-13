import AbstractAdapter from './AbstractAdapter.js';

/**
 * MinimalAdapter - Adapter console simple avec styling basique
 *
 * Stack:
 * - chalk uniquement (optionnel)
 * - console.log natif
 * - ASCII art simple
 *
 * 🪶 LÉGER: Minimal dependencies, console simple
 * ✅ COMPATIBLE: Fonctionne partout
 */
export default class MinimalAdapter extends AbstractAdapter {
    constructor(options = {}) {
        super(options);
        this._chalk = null;
        this._useColors = options.colors !== false;
    }

    // =========================================================================
    // LAZY LOADING
    // =========================================================================

    async _loadChalk() {
        if (!this._chalk && this._useColors) {
            try {
                const module = await import('chalk');
                this._chalk = module.default;
            } catch (e) {
                // Chalk not available, use plain console
                this._useColors = false;
            }
        }
        return this._chalk;
    }

    // =========================================================================
    // CORE METHODS
    // =========================================================================

    clear() {
        console.clear();
    }

    async setConsole(id) {
        this._currentConsole = id;
        const content = this._getContent(id);

        if (!content || content.length === 0) {
            console.log('No content available');
            return;
        }

        this.clear();
        console.log(''); // Empty line

        for (const item of content) {
            await this._renderItem(item);
        }

        console.log(''); // Empty line at end
    }

    exit() {
        console.log('\n👋 Goodbye!\n');
        process.exit(0);
    }

    // =========================================================================
    // DISPLAY METHODS
    // =========================================================================

    async displayText(text, options = {}) {
        const chalk = await this._loadChalk();
        let output = text;

        if (chalk && this._useColors) {
            if (options.color && chalk[options.color]) {
                output = chalk[options.color](output);
            }
            if (options.bold) output = chalk.bold(output);
            if (options.italic) output = chalk.italic(output);
            if (options.underline) output = chalk.underline(output);
            if (options.dim) output = chalk.dim(output);
        }

        console.log(output);
    }

    async displayTable(data, options = {}) {
        const chalk = await this._loadChalk();

        // Simple ASCII table
        const border = options.border !== false;
        const headers = options.headers || [];

        if (border) {
            console.log(this._createBorder(data, headers, 'top'));
        }

        // Headers
        if (headers.length > 0) {
            const headerRow = headers.join(' │ ');
            console.log(
                border
                    ? `│ ${chalk && this._useColors ? chalk.cyan.bold(headerRow) : headerRow} │`
                    : chalk && this._useColors
                    ? chalk.cyan.bold(headerRow)
                    : headerRow
            );

            if (border) {
                console.log(this._createBorder(data, headers, 'mid'));
            }
        }

        // Data rows
        data.forEach((row) => {
            const rowData = Array.isArray(row) ? row.join(' │ ') : String(row);
            console.log(border ? `│ ${rowData} │` : rowData);
        });

        if (border) {
            console.log(this._createBorder(data, headers, 'bottom'));
        }
    }

    async displayList(items, options = {}, callback) {
        const chalk = await this._loadChalk();

        console.log(''); // Empty line
        if (options.message) {
            await this.displayText(options.message, { color: 'cyan', bold: true });
            console.log('');
        }

        // Display items with numbers
        items.forEach((item, index) => {
            const number =
                chalk && this._useColors
                    ? chalk.gray(`${index + 1}.`)
                    : `${index + 1}.`;
            console.log(`  ${number} ${item}`);
        });

        console.log('');

        // Simple selection (not truly interactive in minimal mode)
        if (callback) {
            // Return first item by default in non-interactive mode
            setTimeout(() => {
                callback(null, { selectedIndex: 0, selectedText: items[0] });
            }, 100);
        }

        return 0;
    }

    async displaySpinner(text) {
        const chalk = await this._loadChalk();
        let stopped = false;

        // Simple text spinner (not animated in minimal mode)
        const spinnerText =
            chalk && this._useColors ? chalk.blue('⣾') : '>';
        console.log(`${spinnerText} ${text}`);

        return {
            stop: () => {
                stopped = true;
            },
            succeed: (msg) => {
                if (!stopped) {
                    const check =
                        chalk && this._useColors ? chalk.green('✔') : '✓';
                    console.log(`${check} ${msg || text}`);
                }
            },
            fail: (msg) => {
                if (!stopped) {
                    const cross =
                        chalk && this._useColors ? chalk.red('✖') : '✗';
                    console.log(`${cross} ${msg || text}`);
                }
            },
            info: (msg) => {
                if (!stopped) {
                    const info =
                        chalk && this._useColors ? chalk.blue('ℹ') : 'i';
                    console.log(`${info} ${msg || text}`);
                }
            },
            warn: (msg) => {
                if (!stopped) {
                    const warn =
                        chalk && this._useColors ? chalk.yellow('⚠') : '!';
                    console.log(`${warn} ${msg || text}`);
                }
            },
            update: (msg) => {
                if (!stopped) {
                    text = msg;
                }
            }
        };
    }

    async displayProgress(options = {}) {
        const chalk = await this._loadChalk();

        let progress = 0;
        const total = options.total || 100;
        const width = options.width || 40;

        const render = () => {
            const percentage = Math.floor((progress / total) * 100);
            const filled = Math.floor((progress / total) * width);
            const empty = width - filled;

            const bar =
                (chalk && this._useColors
                    ? chalk.green('█'.repeat(filled))
                    : '█'.repeat(filled)) +
                (chalk && this._useColors
                    ? chalk.gray('░'.repeat(empty))
                    : '░'.repeat(empty));

            console.log(`${options.title || 'Progress'}: [${bar}] ${percentage}%`);
        };

        render();

        return {
            update: (value) => {
                progress = value;
                render();
            },
            done: () => {
                progress = total;
                render();
            }
        };
    }

    // =========================================================================
    // INTERACTIVE METHODS - Non-interactive fallbacks
    // =========================================================================

    async prompt(question, options = {}) {
        const chalk = await this._loadChalk();

        // In minimal mode, we can't do interactive input easily
        // Return default or empty string
        console.log(
            chalk && this._useColors ? chalk.cyan(question) : question
        );

        if (options.default) {
            console.log(
                chalk && this._useColors
                    ? chalk.gray(`  (using default: ${options.default})`)
                    : `  (using default: ${options.default})`
            );
            return options.default;
        }

        return '';
    }

    async select(choices, options = {}) {
        return this.displayList(choices, {
            message: options.message || 'Available options:'
        });
    }

    async confirm(question) {
        const chalk = await this._loadChalk();
        console.log(
            chalk && this._useColors ? chalk.cyan(question) : question
        );
        console.log(
            chalk && this._useColors
                ? chalk.gray('  (defaulting to: Yes)')
                : '  (defaulting to: Yes)'
        );
        return true;
    }

    // =========================================================================
    // RENDERING
    // =========================================================================

    async _renderItem(item) {
        const parsed = this._parseContent(item);

        switch (parsed.type) {
            case 'clear':
                this.clear();
                break;

            case 'text':
                await this.displayText(parsed.value || parsed.text, parsed);
                break;

            case 'table':
                await this.displayTable(parsed.items || [], {
                    headers: parsed.headers,
                    border: parsed.border
                });
                break;

            case 'list':
                await this.displayList(
                    parsed.items || [],
                    {
                        message: parsed.message
                    },
                    parsed.event
                );
                break;

            default:
                console.log(item);
        }
    }

    // =========================================================================
    // UTILITIES
    // =========================================================================

    _createBorder(data, headers, position = 'mid') {
        const cols = headers.length || (data[0] ? data[0].length : 1);
        const width = 60; // Fixed width for simplicity

        const chars = {
            top: { left: '┌', mid: '┬', right: '┐', line: '─' },
            mid: { left: '├', mid: '┼', right: '┤', line: '─' },
            bottom: { left: '└', mid: '┴', right: '┘', line: '─' }
        };

        const char = chars[position] || chars.mid;
        const line = char.line.repeat(width);

        if (cols > 1) {
            const segmentWidth = Math.floor(width / cols);
            const segments = Array(cols).fill(char.line.repeat(segmentWidth));
            return char.left + segments.join(char.mid) + char.right;
        }

        return char.left + line + char.right;
    }
}

/**
 * Exemple d'utilisation:
 *
 * import MinimalAdapter from './MinimalAdapter.js';
 *
 * const adapter = new MinimalAdapter({ colors: true });
 *
 * // Simple console output
 * await adapter.displayText('Hello World', { color: 'green' });
 *
 * // ASCII table
 * await adapter.displayTable([
 *   ['Alice', '30'],
 *   ['Bob', '25']
 * ], { headers: ['Name', 'Age'], border: true });
 *
 * // Non-interactive spinner
 * const spinner = await adapter.displaySpinner('Processing...');
 * setTimeout(() => spinner.succeed('Done!'), 2000);
 *
 * // Works without any dependencies!
 */
