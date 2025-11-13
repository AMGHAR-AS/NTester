/**
 * NTester Terminal Adapters
 *
 * Architecture modulaire permettant de choisir le renderer de terminal
 * selon les besoins et préférences.
 */

// Core
export { default as AbstractAdapter } from './AbstractAdapter.js';
export { default as AdapterFactory, createAdapter } from './AdapterFactory.js';
export { AdapterConfig } from './AdapterFactory.js';

// Built-in Adapters
export { default as ModernStackAdapter } from './ModernStackAdapter.js';
export { default as InkAdapter } from './InkAdapter.js';
export { default as MinimalAdapter } from './MinimalAdapter.js';

/**
 * Quick Start Guide:
 *
 * 1. Import and create an adapter:
 *    ```javascript
 *    import { createAdapter } from './adapters/index.js';
 *    const adapter = createAdapter('modern'); // or 'ink', 'minimal'
 *    ```
 *
 * 2. Use the adapter:
 *    ```javascript
 *    await adapter.displayText('Hello!', { color: 'green', bold: true });
 *    await adapter.displayTable(data, { border: true });
 *    const spinner = await adapter.displaySpinner('Loading...');
 *    ```
 *
 * 3. Interactive prompts:
 *    ```javascript
 *    const name = await adapter.prompt('Your name?');
 *    const confirmed = await adapter.confirm('Continue?');
 *    const choice = await adapter.select(['A', 'B', 'C']);
 *    ```
 *
 * Available Adapters:
 * - 'modern' (⭐ RECOMMENDED): chalk + cli-table3 + ora + inquirer
 * - 'ink' (⚛️ REACT): React-based terminal UI
 * - 'minimal' (🪶 LIGHTWEIGHT): Simple console output
 * - 'auto' (🤖 SMART): Auto-detects best adapter
 */

// Default export - Factory
export { AdapterFactory as default } from './AdapterFactory.js';
