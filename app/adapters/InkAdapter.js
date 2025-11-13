import AbstractAdapter from './AbstractAdapter.js';

/**
 * InkAdapter - Adapter basé sur React pour le terminal
 *
 * Stack:
 * - ink: React pour le terminal
 * - ink-table: Tableaux React
 * - ink-spinner: Spinners React
 * - ink-select-input: Menus de sélection
 *
 * ⚛️ MODERNE: Approche déclarative avec React
 * ⚠️ Nécessite React knowledge
 */
export default class InkAdapter extends AbstractAdapter {
    constructor(options = {}) {
        super(options);
        this._ink = null;
        this._React = null;
        this._render = null;
        this._instances = new Map();
    }

    // =========================================================================
    // LAZY LOADING
    // =========================================================================

    async _loadInk() {
        if (!this._ink) {
            this._ink = await import('ink');
            this._React = await import('react');
            this._render = this._ink.render;
        }
        return this._ink;
    }

    async _loadInkTable() {
        const module = await import('ink-table');
        return module.default;
    }

    async _loadInkSpinner() {
        const module = await import('ink-spinner');
        return module.default;
    }

    async _loadInkSelectInput() {
        const module = await import('ink-select-input');
        return module.default;
    }

    async _loadInkTextInput() {
        const module = await import('ink-text-input');
        return module.default;
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
            return;
        }

        const React = await this._loadInk();
        const { Box, Text } = React;

        // Build React component tree
        const elements = await Promise.all(
            content.map((item, index) => this._buildReactElement(item, index))
        );

        // Render
        const App = () => React.createElement(Box, { flexDirection: 'column' }, ...elements);

        const { unmount } = this._render(React.createElement(App));
        this._instances.set(id, unmount);
    }

    exit() {
        // Unmount all React apps
        for (const unmount of this._instances.values()) {
            unmount();
        }
        process.exit(0);
    }

    // =========================================================================
    // DISPLAY METHODS
    // =========================================================================

    async displayText(text, options = {}) {
        const React = await this._loadInk();
        const { Text } = React;

        const props = {
            color: options.color,
            bold: options.bold,
            italic: options.italic,
            underline: options.underline,
            dimColor: options.dim
        };

        const TextComponent = () => React.createElement(Text, props, text);
        this._render(React.createElement(TextComponent));
    }

    async displayTable(data, options = {}) {
        const React = await this._loadInk();
        const { Box } = React;
        const Table = await this._loadInkTable();

        // Convert data format for ink-table
        const tableData = data.map((row, index) => {
            if (Array.isArray(row)) {
                return options.headers
                    ? options.headers.reduce((obj, header, i) => {
                          obj[header] = row[i];
                          return obj;
                      }, {})
                    : { index, ...row };
            }
            return row;
        });

        const TableComponent = () =>
            React.createElement(Box, { flexDirection: 'column' }, [
                React.createElement(Table, { data: tableData })
            ]);

        this._render(React.createElement(TableComponent));
    }

    async displayList(items, options = {}, callback) {
        const React = await this._loadInk();
        const { Box, Text } = React;
        const SelectInput = await this._loadInkSelectInput();

        const selectItems = items.map((item, index) => ({
            label: item,
            value: index
        }));

        const ListComponent = () => {
            const [selectedItem, setSelectedItem] = React.useState(null);

            const handleSelect = (item) => {
                setSelectedItem(item);
                if (callback) {
                    callback(null, {
                        selectedIndex: item.value,
                        selectedText: item.label
                    });
                }
            };

            return React.createElement(Box, { flexDirection: 'column' }, [
                options.message &&
                    React.createElement(Text, { color: 'cyan' }, options.message),
                React.createElement(SelectInput, {
                    items: selectItems,
                    onSelect: handleSelect
                })
            ]);
        };

        this._render(React.createElement(ListComponent));
    }

    async displaySpinner(text) {
        const React = await this._loadInk();
        const { Box, Text } = React;
        const Spinner = await this._loadInkSpinner();

        let isActive = true;

        const SpinnerComponent = () => {
            if (!isActive) return null;

            return React.createElement(Box, {}, [
                React.createElement(Spinner, { type: 'dots' }),
                React.createElement(Text, {}, ` ${text}`)
            ]);
        };

        const { unmount } = this._render(React.createElement(SpinnerComponent));

        return {
            stop: () => {
                isActive = false;
                unmount();
            },
            succeed: (msg) => {
                isActive = false;
                unmount();
                console.log(`✔ ${msg || text}`);
            },
            fail: (msg) => {
                isActive = false;
                unmount();
                console.log(`✖ ${msg || text}`);
            },
            update: (newText) => {
                text = newText;
            }
        };
    }

    async displayProgress(options = {}) {
        const React = await this._loadInk();
        const { Box, Text } = React;

        let progress = 0;
        let render;

        const ProgressComponent = () => {
            const total = options.total || 100;
            const width = options.width || 40;
            const percentage = Math.floor((progress / total) * 100);
            const filled = Math.floor((progress / total) * width);
            const bar = '█'.repeat(filled) + '░'.repeat(width - filled);

            return React.createElement(Box, {}, [
                React.createElement(Text, {}, `${options.title || 'Progress'}: `),
                React.createElement(Text, { color: 'green' }, bar),
                React.createElement(Text, {}, ` ${percentage}%`)
            ]);
        };

        const instance = this._render(React.createElement(ProgressComponent));
        render = instance.rerender;

        return {
            update: (value) => {
                progress = value;
                render(React.createElement(ProgressComponent));
            },
            done: () => {
                progress = options.total || 100;
                render(React.createElement(ProgressComponent));
                setTimeout(() => instance.unmount(), 500);
            }
        };
    }

    // =========================================================================
    // INTERACTIVE METHODS
    // =========================================================================

    async prompt(question, options = {}) {
        const React = await this._loadInk();
        const { Box, Text } = React;
        const TextInput = await this._loadInkTextInput();

        return new Promise((resolve) => {
            const PromptComponent = () => {
                const [value, setValue] = React.useState(options.default || '');

                const handleSubmit = (val) => {
                    resolve(val);
                };

                return React.createElement(Box, { flexDirection: 'column' }, [
                    React.createElement(Text, { color: 'cyan' }, question),
                    React.createElement(TextInput, {
                        value: value,
                        onChange: setValue,
                        onSubmit: handleSubmit
                    })
                ]);
            };

            const { unmount } = this._render(React.createElement(PromptComponent));
            // Auto-unmount on resolve
            resolve = ((originalResolve) => (val) => {
                unmount();
                originalResolve(val);
            })(resolve);
        });
    }

    async select(choices, options = {}) {
        return this.displayList(choices, {
            message: options.message || 'Select an option:'
        });
    }

    async confirm(question) {
        const React = await this._loadInk();
        const { Box, Text } = React;
        const SelectInput = await this._loadInkSelectInput();

        return new Promise((resolve) => {
            const ConfirmComponent = () => {
                const items = [
                    { label: 'Yes', value: true },
                    { label: 'No', value: false }
                ];

                const handleSelect = (item) => {
                    resolve(item.value);
                };

                return React.createElement(Box, { flexDirection: 'column' }, [
                    React.createElement(Text, { color: 'cyan' }, question),
                    React.createElement(SelectInput, {
                        items: items,
                        onSelect: handleSelect
                    })
                ]);
            };

            const { unmount } = this._render(React.createElement(ConfirmComponent));
            resolve = ((originalResolve) => (val) => {
                unmount();
                originalResolve(val);
            })(resolve);
        });
    }

    // =========================================================================
    // REACT ELEMENT BUILDER
    // =========================================================================

    async _buildReactElement(item, key) {
        const React = await this._loadInk();
        const { Box, Text } = React;
        const parsed = this._parseContent(item);

        switch (parsed.type) {
            case 'text':
                return React.createElement(
                    Text,
                    {
                        key,
                        color: parsed.color,
                        bold: parsed.bold,
                        italic: parsed.italic
                    },
                    parsed.value
                );

            case 'table':
                const Table = await this._loadInkTable();
                return React.createElement(Table, {
                    key,
                    data: parsed.items || []
                });

            case 'list':
                const SelectInput = await this._loadInkSelectInput();
                return React.createElement(SelectInput, {
                    key,
                    items: (parsed.items || []).map((item, i) => ({
                        label: item,
                        value: i
                    })),
                    onSelect: parsed.event
                });

            default:
                return React.createElement(Text, { key }, String(item));
        }
    }
}

/**
 * Exemple d'utilisation:
 *
 * import InkAdapter from './InkAdapter.js';
 *
 * const adapter = new InkAdapter();
 *
 * // React-style rendering
 * await adapter.displayText('Hello from Ink!', { color: 'green', bold: true });
 *
 * // Interactive table
 * await adapter.displayTable([
 *   { name: 'Alice', age: 30 },
 *   { name: 'Bob', age: 25 }
 * ]);
 *
 * // React-powered spinner
 * const spinner = await adapter.displaySpinner('Loading...');
 * setTimeout(() => spinner.succeed('Done!'), 2000);
 */
