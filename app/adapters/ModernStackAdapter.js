import AbstractAdapter from './AbstractAdapter.js';

/**
 * ModernStackAdapter - Adapter moderne utilisant les meilleures libs
 *
 * Stack:
 * - chalk: styling et colors
 * - cli-table3: tableaux propres
 * - ora: spinners élégants
 * - inquirer: prompts interactifs
 * - log-update: mises à jour live
 *
 * ⭐ RECOMMANDÉ: Stack moderne, légère et activement maintenue
 */
export default class ModernStackAdapter extends AbstractAdapter {
    constructor(options = {}) {
        super(options);
        this._spinners = new Map();
        this._currentScreen = null;

        // Lazy loading des dépendances
        this._chalk = null;
        this._Table = null;
        this._ora = null;
        this._inquirer = null;
        this._logUpdate = null;
    }

    // =========================================================================
    // LAZY LOADING - Charge les libs uniquement si nécessaire
    // =========================================================================

    async _loadChalk() {
        if (!this._chalk) {
            const module = await import('chalk');
            this._chalk = module.default;
        }
        return this._chalk;
    }

    async _loadTable() {
        if (!this._Table) {
            const module = await import('cli-table3');
            this._Table = module.default;
        }
        return this._Table;
    }

    async _loadOra() {
        if (!this._ora) {
            const module = await import('ora');
            this._ora = module.default;
        }
        return this._ora;
    }

    async _loadInquirer() {
        if (!this._inquirer) {
            this._inquirer = await import('inquirer');
        }
        return this._inquirer;
    }

    async _loadLogUpdate() {
        if (!this._logUpdate) {
            const module = await import('log-update');
            this._logUpdate = module.default;
        }
        return this._logUpdate;
    }

    // =========================================================================
    // CORE METHODS IMPLEMENTATION
    // =========================================================================

    clear() {
        console.clear();
    }

    async setConsole(id) {
        this._currentConsole = id;
        const content = this._getContent(id);

        if (!content || content.length === 0) {
            console.log('No content found for', id);
            return;
        }

        this.clear();

        for (const item of content) {
            await this._renderItem(item);
        }
    }

    exit() {
        // Cleanup spinners
        for (const spinner of this._spinners.values()) {
            if (spinner.isSpinning) {
                spinner.stop();
            }
        }

        console.log('\n👋 Goodbye!\n');
        process.exit(0);
    }

    // =========================================================================
    // DISPLAY METHODS IMPLEMENTATION
    // =========================================================================

    async displayText(text, options = {}) {
        const chalk = await this._loadChalk();
        let output = text;

        // Apply styling
        if (options.color && chalk[options.color]) {
            output = chalk[options.color](output);
        }
        if (options.bold) {
            output = chalk.bold(output);
        }
        if (options.italic) {
            output = chalk.italic(output);
        }
        if (options.underline) {
            output = chalk.underline(output);
        }
        if (options.dim) {
            output = chalk.dim(output);
        }

        console.log(output);
    }

    async displayTable(data, options = {}) {
        const Table = await this._loadTable();
        const chalk = await this._loadChalk();

        const tableConfig = {
            head: options.headers || [],
            style: {
                head: options.headerColor ? [options.headerColor] : ['cyan'],
                border: options.borderColor ? [options.borderColor] : ['gray'],
            },
            chars: options.border ? undefined : {
                'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
                'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
                'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
                'right': '', 'right-mid': '', 'middle': ' '
            }
        };

        const table = new Table(tableConfig);

        // Add rows
        if (Array.isArray(data)) {
            data.forEach(row => {
                if (Array.isArray(row)) {
                    table.push(row);
                } else {
                    table.push([row]);
                }
            });
        }

        console.log(table.toString());
    }

    async displayList(items, options = {}, callback) {
        const inquirer = await this._loadInquirer();
        const chalk = await this._loadChalk();

        try {
            const answer = await inquirer.default.prompt([
                {
                    type: 'list',
                    name: 'selection',
                    message: options.message || 'Select an option:',
                    choices: items.map((item, index) => ({
                        name: item,
                        value: index
                    })),
                    pageSize: options.pageSize || 10
                }
            ]);

            if (callback) {
                callback(null, {
                    selectedIndex: answer.selection,
                    selectedText: items[answer.selection]
                });
            }

            return answer.selection;
        } catch (error) {
            if (callback) {
                callback(error, null);
            }
            throw error;
        }
    }

    async displaySpinner(text) {
        const ora = await this._loadOra();
        const spinner = ora({
            text: text,
            spinner: 'dots'
        }).start();

        const spinnerId = Date.now().toString();
        this._spinners.set(spinnerId, spinner);

        return {
            stop: () => spinner.stop(),
            succeed: (msg) => spinner.succeed(msg),
            fail: (msg) => spinner.fail(msg),
            info: (msg) => spinner.info(msg),
            warn: (msg) => spinner.warn(msg),
            update: (msg) => { spinner.text = msg; }
        };
    }

    async displayProgress(options = {}) {
        const chalk = await this._loadChalk();
        const logUpdate = await this._loadLogUpdate();

        let progress = 0;
        const total = options.total || 100;
        const barLength = options.width || 40;

        const render = () => {
            const percentage = Math.floor((progress / total) * 100);
            const filled = Math.floor((progress / total) * barLength);
            const empty = barLength - filled;

            const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
            const text = `${options.title || 'Progress'}: ${bar} ${percentage}%`;

            logUpdate(text);
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
                logUpdate.done();
            }
        };
    }

    // =========================================================================
    // INTERACTIVE METHODS IMPLEMENTATION
    // =========================================================================

    async prompt(question, options = {}) {
        const inquirer = await this._loadInquirer();

        const answer = await inquirer.default.prompt([
            {
                type: 'input',
                name: 'response',
                message: question,
                default: options.default,
                validate: options.validate
            }
        ]);

        return answer.response;
    }

    async select(choices, options = {}) {
        return this.displayList(choices, {
            message: options.message || 'Select an option:'
        });
    }

    async confirm(question) {
        const inquirer = await this._loadInquirer();

        const answer = await inquirer.default.prompt([
            {
                type: 'confirm',
                name: 'confirmed',
                message: question,
                default: false
            }
        ]);

        return answer.confirmed;
    }

    // =========================================================================
    // RENDERING - Rendu intelligent selon le type
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
                    border: parsed.border,
                    headerColor: parsed.headerColor,
                    borderColor: parsed.borderColor
                });
                break;

            case 'list':
                await this.displayList(parsed.items || [], {
                    message: parsed.message,
                    pageSize: parsed.pageSize
                }, parsed.event);
                break;

            case 'prompt':
                if (parsed.confirm) {
                    const result = await this.confirm(parsed.text || parsed.message);
                    if (parsed.event) {
                        parsed.event.call(this, null, result);
                    }
                } else {
                    const result = await this.prompt(parsed.text || parsed.message, {
                        default: parsed.default
                    });
                    if (parsed.event) {
                        parsed.event.call(this, null, result);
                    }
                }
                break;

            case 'loader':
                if (parsed.spinner) {
                    const spinner = await this.displaySpinner(parsed.text);
                    // Auto-stop after 2s for demo
                    setTimeout(() => spinner.succeed('Done!'), 2000);
                } else if (parsed.progressBar) {
                    const progress = await this.displayProgress({
                        title: parsed.title,
                        total: 100,
                        width: parsed.width
                    });

                    if (parsed.update) {
                        parsed.update((value) => progress.update(value));
                    }
                }
                break;

            default:
                console.log(item);
        }
    }
}

// =========================================================================
// STANDALONE USAGE - Peut être utilisé directement
// =========================================================================

/**
 * Exemple d'utilisation standalone:
 *
 * import ModernStackAdapter from './ModernStackAdapter.js';
 *
 * const adapter = new ModernStackAdapter();
 *
 * // Simple text
 * await adapter.displayText('Hello World', { color: 'green', bold: true });
 *
 * // Table
 * await adapter.displayTable([
 *   ['Name', 'Age'],
 *   ['Alice', '30'],
 *   ['Bob', '25']
 * ], { border: true, headers: ['Name', 'Age'] });
 *
 * // Spinner
 * const spinner = await adapter.displaySpinner('Loading...');
 * setTimeout(() => spinner.succeed('Done!'), 2000);
 *
 * // Interactive
 * const name = await adapter.prompt('What is your name?');
 * const confirmed = await adapter.confirm('Are you sure?');
 * const choice = await adapter.select(['Option 1', 'Option 2', 'Option 3']);
 */
