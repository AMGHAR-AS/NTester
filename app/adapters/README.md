# NTester Terminal Adapters

Architecture modulaire permettant de choisir votre moteur de rendu terminal préféré.

## 🚀 Quick Start

```javascript
import { createAdapter } from './adapters/index.js';

// Créer un adapter
const adapter = createAdapter('modern'); // Recommandé !

// Utiliser l'adapter
await adapter.displayText('Hello!', { color: 'green', bold: true });
await adapter.displayTable(data, { border: true });
const spinner = await adapter.displaySpinner('Loading...');
```

## 📦 Adapters Disponibles

### 1. Modern Stack (⭐ RECOMMANDÉ)

**Stack**: chalk + cli-table3 + ora + inquirer + log-update

**Installation**:
```bash
npm install chalk cli-table3 ora inquirer log-update
```

**Avantages**:
- ✅ Best-in-class pour chaque fonctionnalité
- ✅ Maintenance active
- ✅ Grande communauté
- ✅ TypeScript support
- ✅ Bundle size optimal (~150kb)

**Usage**:
```javascript
const adapter = createAdapter('modern');
```

### 2. Ink (⚛️ REACT)

**Stack**: ink + react + ink-table + ink-spinner + ink-select-input

**Installation**:
```bash
npm install ink react ink-table ink-spinner ink-select-input ink-text-input
```

**Avantages**:
- ✅ Approche React déclarative
- ✅ Composants réutilisables
- ✅ État géré par React
- ⚠️ Bundle plus lourd
- ⚠️ Nécessite connaissance React

**Usage**:
```javascript
const adapter = createAdapter('ink');
```

### 3. Minimal (🪶 LÉGER)

**Stack**: console.log + chalk (optionnel)

**Installation**:
```bash
npm install chalk  # Optionnel
```

**Avantages**:
- ✅ Aucune dépendance requise
- ✅ Très léger (<10kb)
- ✅ Compatible partout
- ⚠️ Pas d'interactivité
- ⚠️ Rendu basique

**Usage**:
```javascript
const adapter = createAdapter('minimal', { colors: true });
```

### 4. Auto (🤖 INTELLIGENT)

Détecte automatiquement le meilleur adapter selon l'environnement.

**Usage**:
```javascript
const adapter = createAdapter('auto');
```

**Détection**:
- CI/CD → Minimal
- `NTESTER_ADAPTER=ink` → Ink
- `NTESTER_ADAPTER=minimal` → Minimal
- Sinon → Modern Stack

## 📖 API Complète

### Display Methods

```javascript
// Text
await adapter.displayText('Hello World', {
    color: 'green',     // Colors: green, red, blue, yellow, cyan, magenta, etc.
    bold: true,
    italic: false,
    underline: false,
    dim: false
});

// Table
await adapter.displayTable([
    ['Alice', '30', 'Engineer'],
    ['Bob', '25', 'Designer']
], {
    headers: ['Name', 'Age', 'Role'],
    border: true,
    headerColor: 'cyan',
    borderColor: 'gray'
});

// List (interactive)
await adapter.displayList(['Option 1', 'Option 2', 'Option 3'], {
    message: 'Choose an option:',
    pageSize: 10
}, (error, result) => {
    console.log('Selected:', result.selectedText);
});

// Spinner
const spinner = await adapter.displaySpinner('Loading...');
// Later:
spinner.succeed('Done!');
spinner.fail('Error!');
spinner.info('Info');
spinner.warn('Warning');
spinner.update('New text');
spinner.stop();

// Progress Bar
const progress = await adapter.displayProgress({
    title: 'Processing',
    total: 100,
    width: 40
});
progress.update(50);  // 50%
progress.done();      // 100%
```

### Interactive Methods

```javascript
// Text input
const name = await adapter.prompt('What is your name?', {
    default: 'Guest',
    validate: (input) => input.length > 0
});

// Confirmation
const confirmed = await adapter.confirm('Are you sure?');
// Returns: true or false

// Selection
const choice = await adapter.select(['A', 'B', 'C'], {
    message: 'Choose one:'
});
// Returns: index of selected item
```

### Core Methods

```javascript
// Clear screen
adapter.clear();

// Set content for later display
adapter.setContent('screen1', [
    { type: 'text', value: 'Hello' },
    { type: 'table', items: [...] }
]);

// Display content by ID
await adapter.setConsole('screen1');

// Exit properly
adapter.exit();
```

## ⚙️ Configuration

### Via Factory

```javascript
import { AdapterFactory, AdapterConfig } from './adapters/index.js';

// Set default adapter
AdapterFactory.setDefault('modern');

// Create with default
const adapter = AdapterFactory.createDefault();

// List available
console.log(AdapterFactory.listAvailable());
// ['modern', 'ink', 'minimal', 'auto', 'terminal-kit']
```

### Via Config File

Create `.ntester.json`:
```json
{
  "defaultType": "modern",
  "options": {
    "colors": true
  }
}
```

Load in code:
```javascript
import { AdapterConfig, AdapterFactory } from './adapters/index.js';

await AdapterConfig.load('./.ntester.json');
const adapter = AdapterFactory.createDefault();
```

### Via Environment

```bash
# Choose adapter via env var
NTESTER_ADAPTER=ink node your-script.js

# Auto-detection uses this
```

## 🔧 Custom Adapters

Create your own adapter:

```javascript
import { AbstractAdapter, AdapterFactory } from './adapters/index.js';

class MyCustomAdapter extends AbstractAdapter {
    async displayText(text, options) {
        // Your implementation
    }

    async displayTable(data, options) {
        // Your implementation
    }

    // ... implement all required methods
}

// Register
AdapterFactory.register('my-adapter', MyCustomAdapter);

// Use
const adapter = createAdapter('my-adapter');
```

## 📊 Comparison

| Feature | Modern | Ink | Minimal |
|---------|--------|-----|---------|
| Bundle Size | ~150kb | ~500kb | <10kb |
| Interactive | ✅ | ✅ | ❌ |
| Animations | ✅ | ✅ | ❌ |
| TypeScript | ✅ | ✅ | ✅ |
| React | ❌ | ✅ | ❌ |
| Maintenance | ✅ Active | ✅ Active | ✅ Always |
| CI/CD | ✅ | ⚠️ | ✅ |

## 🎯 Recommendations

- **Production apps**: Modern Stack
- **React projects**: Ink
- **CI/CD pipelines**: Minimal
- **Libraries**: Minimal (least deps)
- **Demos**: Modern Stack
- **Quick scripts**: Minimal

## 📚 Examples

See `examples/adapters-demo.js` for complete demonstrations:

```bash
node examples/adapters-demo.js
```

## 🐛 Troubleshooting

### Dependencies not found

Adapters use lazy loading. Install dependencies only when needed:

```bash
# For Modern Stack
npm install chalk cli-table3 ora inquirer log-update

# For Ink
npm install ink react ink-table ink-spinner ink-select-input ink-text-input

# For Minimal (optional)
npm install chalk
```

### Adapter not working in CI

Use Minimal or Auto adapter in CI environments:

```javascript
const adapter = createAdapter(process.env.CI ? 'minimal' : 'modern');
```

### ESM Import errors

All adapters use ESM modules. Ensure your package.json has:
```json
{
  "type": "module"
}
```

## 🔗 Related

- [Main Documentation](../../docs/TERMINAL-ADAPTERS.md)
- [Example Demo](../../examples/adapters-demo.js)
- [NTester Main](../../README.md)

## 📄 License

MIT - Same as NTester
