# Contributing to NTester

Thank you for your interest in contributing to NTester! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Documentation](#documentation)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Unprofessional conduct

## 🚀 Getting Started

### Prerequisites

- Node.js 14+
- Git
- Text editor (VS Code recommended)
- Terminal/Command line knowledge

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR-USERNAME/NTester.git
cd NTester
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/ORIGINAL-OWNER/NTester.git
```

4. Install dependencies:

```bash
npm install
```

## 🛠️ Development Setup

### Install All Dependencies

For full development experience:

```bash
# Core dependencies (if any)
npm install

# Modern adapter dependencies
npm install chalk cli-table3 ora inquirer

# Ink adapter dependencies
npm install ink react

# Development tools
npm install --save-dev eslint prettier
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific test
node tests/unit-tests.js
node tests/plugins-test.js
```

### Run Examples

```bash
# Simple demo
node examples/simple-demo.js

# Plugin demo
node examples/plugins-demo.js

# Adapter demo
node examples/adapter-demo.js
```

## 📁 Project Structure

```
NTester/
├── app/                    # Core application code
│   ├── NTester.js         # Main test class
│   ├── process.js         # Test execution state
│   ├── engine.js          # Test runner
│   ├── logger.js          # Output formatter
│   ├── it.js              # Assertion API
│   ├── plugins/           # Plugin system
│   │   ├── AbstractPlugin.js
│   │   ├── PluginManager.js
│   │   ├── RendererPlugin.js
│   │   ├── HTMLExportPlugin.js
│   │   └── HTMLServerPlugin.js
│   └── adapters/          # Terminal adapters
│       ├── AdapterFactory.js
│       ├── ModernAdapter.js
│       ├── InkAdapter.js
│       └── MinimalAdapter.js
│
├── examples/              # Usage examples
├── tests/                 # Test suites
├── docs/                  # Documentation
├── package.json           # Dependencies
└── README.md              # Main README
```

## 📝 Coding Standards

### JavaScript Style

#### Naming Conventions

```javascript
// Classes: PascalCase
class MyClass { }

// Functions/Methods: camelCase
function myFunction() { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Private members: _prefixed
class MyClass {
    _privateMethod() { }
}
```

#### Code Formatting

```javascript
// Use 4 spaces for indentation
function example() {
    if (condition) {
        doSomething();
    }
}

// Use single quotes for strings
const text = 'hello';

// Use template literals for interpolation
const message = `Hello, ${name}!`;

// Arrow functions for callbacks
array.map(item => item.value);

// Async/await over promises
async function fetchData() {
    const result = await apiCall();
    return result;
}
```

#### Documentation

```javascript
/**
 * Brief description of function
 *
 * Detailed description if needed.
 *
 * @param {string} name - Parameter description
 * @param {object} options - Options object
 * @param {boolean} options.flag - Option description
 * @returns {Promise<object>} Description of return value
 *
 * @example
 * const result = await myFunction('test', { flag: true });
 */
async function myFunction(name, options = {}) {
    // Implementation
}
```

### Best Practices

#### 1. Async/Await

Always use async/await for asynchronous operations:

```javascript
// Good
async function loadData() {
    const data = await fetchData();
    const processed = await processData(data);
    return processed;
}

// Avoid
function loadData() {
    return fetchData()
        .then(data => processData(data))
        .then(processed => processed);
}
```

#### 2. Error Handling

Handle errors appropriately:

```javascript
// Good
async function processData(data) {
    try {
        const result = await riskyOperation(data);
        return result;
    } catch (error) {
        console.error('Operation failed:', error);
        throw error; // Re-throw if caller should handle
    }
}
```

#### 3. Validation

Validate inputs:

```javascript
function createTest(name, options = {}) {
    if (typeof name !== 'string') {
        throw new TypeError('name must be a string');
    }

    if (name.trim() === '') {
        throw new Error('name cannot be empty');
    }

    // Continue with valid input
}
```

#### 4. Immutability

Prefer immutable operations:

```javascript
// Good
const newArray = [...oldArray, newItem];
const newObject = { ...oldObject, key: value };

// Avoid
oldArray.push(newItem);
oldObject.key = value;
```

#### 5. Clear Variable Names

Use descriptive names:

```javascript
// Good
const userAuthenticated = checkAuth(user);
const testResults = runTests(suite);

// Avoid
const ua = checkAuth(user);
const res = runTests(suite);
```

## 🧪 Testing

### Writing Tests

Create test files in `tests/` directory:

```javascript
#!/usr/bin/env node

import { it, NTester } from '../app/NTester.js';

const test = new NTester('My Feature Tests');

test.addStep('feature-test-1', function () {
    // Test implementation
    it(value).equal(expected);
}, {
    name: 'Test feature behavior'
});

// Run tests
(async () => {
    const result = await test.run();
    await result.console();

    if (result.failed) {
        process.exit(1);
    }
})();
```

### Test Coverage

Aim for comprehensive test coverage:

- **Unit Tests**: Test individual functions/classes
- **Integration Tests**: Test component interactions
- **Plugin Tests**: Test plugin functionality
- **Adapter Tests**: Test adapter implementations

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
node tests/my-test.js

# Run with specific adapter
NTESTER_ADAPTER=minimal node tests/my-test.js
```

## 🔄 Pull Request Process

### 1. Create a Branch

Create a feature branch from `main`:

```bash
git checkout main
git pull upstream main
git checkout -b feature/my-feature
```

Branch naming:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### 2. Make Changes

- Write clean, well-documented code
- Follow coding standards
- Add/update tests
- Update documentation

### 3. Commit Changes

Write clear commit messages:

```bash
git add .
git commit -m "Add: Feature description"
```

Commit message format:
```
Type: Brief description (50 chars max)

Detailed explanation if needed (wrap at 72 chars)

- Bullet points for multiple changes
- Reference issues: Fixes #123
```

Types:
- `Add:` - New features
- `Fix:` - Bug fixes
- `Update:` - Changes to existing features
- `Doc:` - Documentation changes
- `Refactor:` - Code restructuring
- `Test:` - Test additions/changes
- `Style:` - Formatting changes

### 4. Run Tests

Ensure all tests pass:

```bash
npm test
```

### 5. Push Changes

```bash
git push origin feature/my-feature
```

### 6. Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill in PR template:
   - Description of changes
   - Related issues
   - Type of change
   - Testing done
   - Screenshots (if UI changes)

### 7. Code Review

- Address reviewer feedback
- Make requested changes
- Push updates to same branch
- PR updates automatically

### 8. Merge

Once approved:
- Squash commits if needed
- Merge to main branch
- Delete feature branch

## 🐛 Issue Guidelines

### Before Creating an Issue

1. Search existing issues
2. Check documentation
3. Verify it's reproducible
4. Gather relevant information

### Creating an Issue

Use appropriate template:

#### Bug Report

```markdown
**Describe the bug**
Clear description of the bug.

**To Reproduce**
Steps to reproduce:
1. Step 1
2. Step 2
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Environment**
- OS: [e.g., macOS 12.0]
- Node version: [e.g., 16.14.0]
- NTester version: [e.g., 0.2.0]

**Additional context**
Any other relevant information.
```

#### Feature Request

```markdown
**Feature description**
Clear description of the feature.

**Use case**
Why this feature is needed.

**Proposed solution**
How you think it should work.

**Alternatives considered**
Other solutions you've thought about.

**Additional context**
Any other relevant information.
```

## 📚 Documentation

### Types of Documentation

1. **Code Comments**
   - Explain complex logic
   - Document public APIs
   - Add JSDoc annotations

2. **README Files**
   - Main README.md
   - Component-specific READMEs

3. **API Documentation**
   - docs/api-reference.md
   - Complete API coverage

4. **Guides**
   - docs/getting-started.md
   - docs/plugin-system.md
   - docs/adapter-system.md

5. **Examples**
   - examples/ directory
   - Runnable code samples

### Documentation Standards

#### README Structure

```markdown
# Component Name

Brief description

## Features

- Feature 1
- Feature 2

## Installation

```bash
npm install ...
```

## Usage

```javascript
// Example code
```

## API

### Method1(param)

Description

**Parameters:**
- param (type) - Description

**Returns:** Return type

**Example:**
```javascript
// Usage example
```

## Contributing

Link to contributing guide

## License

License information
```

#### Code Documentation

```javascript
/**
 * Class description
 *
 * @example
 * const instance = new MyClass();
 */
export default class MyClass {
    /**
     * Method description
     *
     * @param {string} param - Parameter description
     * @returns {Promise<object>} Return description
     *
     * @example
     * const result = await instance.method('value');
     */
    async method(param) {
        // Implementation
    }
}
```

### Updating Documentation

When making changes:

1. Update relevant docs
2. Add examples if needed
3. Update changelog
4. Review for accuracy

## 🏷️ Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes

Version format: `MAJOR.MINOR.PATCH`

Example: `1.2.3`

## 🎯 Areas for Contribution

### High Priority

- 🐛 Bug fixes
- 📚 Documentation improvements
- ✅ Test coverage increases
- 🎨 UX enhancements

### Feature Ideas

- 📊 Additional chart types in HTML reports
- 🔌 More built-in plugins
- 🎨 Additional terminal adapters
- 🌍 Internationalization (i18n)
- 📈 Performance optimizations
- 🔔 Notification integrations

### Good First Issues

Look for issues labeled:
- `good-first-issue`
- `help-wanted`
- `documentation`

## 💬 Communication

### Channels

- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - General questions, ideas
- **Pull Requests** - Code contributions

### Response Times

- Issues: Within 48 hours
- PRs: Within 72 hours
- Critical bugs: Within 24 hours

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## 🙏 Acknowledgments

Thank you to all contributors who help make NTester better!

### Contributors

See [Contributors](https://github.com/REPO/graphs/contributors) page.

## 📞 Need Help?

- 📖 Read the [documentation](./getting-started.md)
- 💬 Ask in GitHub Discussions
- 🐛 Report issues on GitHub
- 📧 Contact maintainers

---

**Happy Contributing!** 🎉
