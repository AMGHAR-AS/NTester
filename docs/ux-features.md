# UX Features

Modern user experience features in NTester's HTML reports and development server.

## 📋 Table of Contents

- [Overview](#overview)
- [HTML Report Features](#html-report-features)
- [Development Server Features](#development-server-features)
- [Dark Mode](#dark-mode)
- [Interactive Elements](#interactive-elements)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)
- [Browser Support](#browser-support)

## 🎯 Overview

NTester provides a modern, feature-rich HTML reporting system with:

- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🔍 **Real-time Search** - Filter tests instantly
- 📋 **Interactive Filters** - Show/hide test results
- 📊 **Animated Progress Bars** - Visual success indicators
- 🔄 **Live Reload** - Auto-refresh on changes
- 📱 **Responsive Design** - Mobile-friendly layout
- 🎨 **Modern UI** - Clean, professional appearance
- ⚡ **Fast Performance** - Optimized rendering

## 🎨 HTML Report Features

### Fixed Toolbar

Stays at the top of the page while scrolling.

**Components**:
- 🔍 Search box - Real-time test filtering
- 🌙 Dark mode toggle - Theme switcher
- 📥 Export JSON - Download results (placeholder)
- 🖨️ Print - Optimized print layout

**Features**:
- Glassmorphism design (backdrop blur)
- Fixed position at top
- Smooth transitions
- Touch-friendly buttons

**Usage**:
```javascript
import HTMLExportPlugin from './app/plugins/HTMLExportPlugin.js';

const plugin = new HTMLExportPlugin({
    outputPath: './report.html',
    title: 'Test Report'
});
```

The toolbar is automatically included in generated reports.

### Interactive Filters

Filter tests by status with visual feedback.

**Filter Options**:
- 📋 **All Tests** - Show all tests
- ✅ **Passed Only** - Show only successful tests
- ❌ **Failed Only** - Show only failed tests

**Features**:
- Active state highlighting
- Smooth hover animations
- Instant filtering
- Visual icons

**How to Use**:
1. Click filter button
2. Tests update instantly
3. Button shows active state
4. Click again to toggle off

### Real-time Search

Search across test names, step names, and messages.

**Features**:
- Case-insensitive search
- Instant results
- No page reload
- Highlights active input
- Searches:
  - Test names
  - Step names
  - Messages
  - Error text

**How to Use**:
1. Type in search box
2. Results filter instantly
3. Clear to show all

**Example**:
```
Search: "validation"
Shows all tests/steps containing "validation"
```

### Animated Progress Bars

Visual representation of test success rates.

**Features**:
- Smooth fill animation (1s ease-out)
- Gradient colors based on success rate:
  - ✅ **100%** - Green (success)
  - ⚠️ **70-99%** - Orange (partial)
  - ❌ **<70%** - Red (failure)
- Percentage display
- Responsive sizing

**Visual Example**:
```
Total Tests: 15
────────────────── 100%
     ✅ Green

Total Tests: 12
─────────────░░░░ 75%
    ⚠️ Orange

Total Tests: 8
─────░░░░░░░░░░░ 40%
    ❌ Red
```

### Floating Action Button (FAB)

Scroll-to-top button in bottom-right corner.

**Features**:
- Appears after 300px scroll
- Smooth scroll animation
- Circular modern design
- Hover effects
- Touch-friendly size

**Behavior**:
- Hidden initially
- Fades in when scrolling down
- Scrolls smoothly to top on click
- Fades out at top of page

### Toast Notifications

Non-intrusive status messages.

**Features**:
- Bottom-right position
- Slide-up animation
- Auto-dismiss after 3s
- Colored border indicator
- Manual dismiss button

**Types**:
- ℹ️ Info (blue)
- ✅ Success (green)
- ⚠️ Warning (orange)
- ❌ Error (red)

**Example Use Cases**:
- "Filter applied"
- "Search active"
- "Exported successfully"
- "Dark mode enabled"

### Collapsible Tests

Click to expand/collapse test details.

**Features**:
- Click test header to toggle
- Smooth expand/collapse animation
- Arrow indicator (▼/▶)
- Remembers state during session
- Keyboard accessible

**Smart Defaults**:
- Failed tests: Expanded by default
- Passed tests: Collapsed by default
- Override with manual clicks

### Statistics Cards

Modern card layout for key metrics.

**Display Cards**:
1. **Total Tests** - Total test count
2. **Passed Tests** - Success count
3. **Failed Tests** - Failure count
4. **Success Rate** - Percentage
5. **Duration** - Execution time

**Features**:
- Colored left border (4px)
- Icon for each metric
- Large number display
- Progress bar
- Fade-in animation
- Hover lift effect

**Card Colors**:
- Total: Blue
- Passed: Green
- Failed: Red
- Success Rate: Purple
- Duration: Gray

### Modern Header

Gradient background with metadata display.

**Layout**:
```
📊 Test Suite Title
   Optional subtitle

Project    Version    Date       Author
[Value]    [Value]    [Value]    [Value]
```

**Features**:
- Gradient background (primary → secondary)
- Grid layout for metadata
- Responsive columns
- Uppercase labels
- Clean typography
- Slide-down animation

## 🌐 Development Server Features

### Live Reload

Automatic browser refresh when report changes.

**How it Works**:
1. Server watches HTML file
2. Detects file changes
3. Sends SSE event to browser
4. Browser reloads automatically

**Features**:
- Server-Sent Events (SSE)
- No polling overhead
- Instant updates
- Multiple client support
- Reconnection handling

**Usage**:
```javascript
import HTMLServerPlugin from './app/plugins/HTMLServerPlugin.js';

const server = new HTMLServerPlugin({
    htmlFile: './report.html',
    port: 3000,
    autoRerun: false
});

await server.start();
```

### Status Dashboard

Real-time server monitoring at `/status`.

**Features**:
- Connected clients count
- Server uptime
- Status indicator (animated pulse)
- Server information
- Auto-refresh (every 5s)
- Action buttons

**Stats Displayed**:
- 👥 Connected Clients
- ⏱️ Server Uptime
- 🌐 Server URL
- 🔄 Live Reload Status
- 📊 Memory Usage

**Actions**:
- View Report - Opens main report
- Refresh Stats - Manual refresh
- Dark Mode - Theme toggle

**Uptime Format**:
```
2d 5h 30m 15s  →  2 days, 5 hours, 30 minutes, 15 seconds
5h 30m 15s     →  5 hours, 30 minutes, 15 seconds
30m 15s        →  30 minutes, 15 seconds
15s            →  15 seconds
```

### API Endpoints

#### GET /

Main HTML report.

**Response**: HTML file content
**Content-Type**: text/html

#### GET /events

Server-Sent Events for live reload.

**Response**: Event stream
**Content-Type**: text/event-stream

**Events**:
- `connected` - Initial connection
- `reload` - File changed, reload
- `test-start` - Test execution started
- `test-end` - Test execution completed

**Example Event**:
```
data: {"type":"reload","timestamp":1699876543210}
```

#### GET /status

Server status dashboard.

**Response**: HTML dashboard
**Content-Type**: text/html

**Features**:
- Real-time statistics
- Auto-refresh UI
- Dark mode toggle
- Action buttons

#### GET /api/stats

JSON statistics endpoint.

**Response**: JSON object
**Content-Type**: application/json

**Example Response**:
```json
{
  "clients": 3,
  "uptime": 8130,
  "port": 3000,
  "htmlFile": "./test-report.html",
  "memory": {
    "rss": 45678912,
    "heapTotal": 12345678,
    "heapUsed": 9876543,
    "external": 1234567
  },
  "timestamp": 1699876543210
}
```

## 🌙 Dark Mode

### Features

- **Toggle Button** - Click to switch themes
- **Persistent** - Saved in localStorage
- **Smooth Transition** - 0.3s animation
- **Dynamic Icon** - 🌙 (dark) / ☀️ (light)
- **System Default** - Respects OS preference

### Color Palette

#### Light Mode
```css
Background:  #f8f9fa (Light gray)
Cards:       #ffffff (White)
Text:        #1f2937 (Dark gray)
Border:      #e5e7eb (Light border)
```

#### Dark Mode
```css
Background:  #111827 (Very dark gray)
Cards:       #1f2937 (Dark gray)
Text:        #f9fafb (Off-white)
Border:      #374151 (Medium gray)
```

#### Accent Colors (Same in both modes)
```css
Primary:     #667eea (Blue-violet)
Secondary:   #764ba2 (Violet)
Success:     #10b981 (Green)
Warning:     #f59e0b (Orange)
Danger:      #ef4444 (Red)
```

### Implementation

**CSS Variables**:
```css
:root {
  --bg-color: #f8f9fa;
  --text-color: #1f2937;
  --card-bg: #ffffff;
}

[data-theme="dark"] {
  --bg-color: #111827;
  --text-color: #f9fafb;
  --card-bg: #1f2937;
}
```

**JavaScript Toggle**:
```javascript
function toggleDarkMode() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}
```

**Persistence**:
```javascript
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
});
```

## 🎮 Interactive Elements

### Test Collapse/Expand

**Click Behavior**:
- Click test header to toggle
- Arrow icon changes (▼ ↔ ▶)
- Smooth height animation

**Keyboard Accessible**:
- Tab to focus
- Enter/Space to toggle

**Smart Defaults**:
```javascript
// Failed tests: expanded
if (test.failed) {
    testElement.classList.remove('collapsed');
}

// Passed tests: collapsed
if (test.passed && !test.failed) {
    testElement.classList.add('collapsed');
}
```

### Search Input

**Interactive Features**:
- Focus highlight (blue border)
- Real-time filtering
- Clear icon appears when typing
- Debounced for performance

**Search Logic**:
```javascript
function search(query) {
    const lowerQuery = query.toLowerCase();

    tests.forEach(test => {
        const matches =
            test.name.toLowerCase().includes(lowerQuery) ||
            test.steps.some(s => s.name.toLowerCase().includes(lowerQuery));

        test.element.style.display = matches ? 'block' : 'none';
    });
}
```

### Filter Buttons

**States**:
- Default - Gray background
- Hover - Darker gray
- Active - Blue background + white text

**Click Behavior**:
```javascript
function filterTests(status) {
    tests.forEach(test => {
        if (status === 'all') {
            test.element.style.display = 'block';
        } else if (status === 'passed') {
            test.element.style.display = test.passed ? 'block' : 'none';
        } else if (status === 'failed') {
            test.element.style.display = test.failed ? 'block' : 'none';
        }
    });
}
```

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
    .stats { grid-template-columns: 1fr; }
    .toolbar { flex-direction: column; }
    .search-box input { width: 100%; }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
    .stats { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1025px) {
    .stats { grid-template-columns: repeat(5, 1fr); }
}
```

### Mobile Optimizations

- **Touch Targets**: Minimum 44x44px
- **Font Sizes**: Readable on small screens
- **Spacing**: Adequate padding/margins
- **Scroll**: Smooth scrolling behavior
- **Zoom**: Prevents unwanted zoom on inputs

### Tablet Optimizations

- **Two-column Grid**: Statistics in 2 columns
- **Adaptive Toolbar**: Stacked or horizontal
- **Touch-friendly**: Large interactive areas

### Desktop Optimizations

- **Full Grid**: 5-column statistics
- **Sidebar Space**: Optimal content width
- **Hover Effects**: Enhanced interactions
- **Keyboard Nav**: Full keyboard support

## ♿ Accessibility

### Keyboard Navigation

**Supported Actions**:
- Tab - Navigate between elements
- Enter/Space - Activate buttons
- Escape - Close modals/dropdowns

**Focus Indicators**:
- Visible focus outline
- High contrast
- Consistent across elements

### Screen Readers

**ARIA Labels**:
```html
<button aria-label="Toggle dark mode">
<input aria-label="Search tests" role="searchbox">
<div role="alert" aria-live="polite">Filter applied</div>
```

**Semantic HTML**:
- Proper heading hierarchy (h1 → h6)
- `<nav>`, `<main>`, `<section>` tags
- `<button>` for interactions (not `<div>`)

### Color Contrast

**WCAG AA Compliance**:
- Text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Interactive elements: 3:1 ratio

**High Contrast Mode**:
- Works in Windows High Contrast
- Respects prefers-contrast media query

### Visual Indicators

**Not Color-Only**:
- Icons + colors for status
- Patterns + colors for charts
- Text + colors for alerts

**Example**:
```
✅ Passed (green + checkmark)
❌ Failed (red + X mark)
⚠️ Warning (orange + warning icon)
```

## 🌐 Browser Support

### Supported Browsers

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Opera | 76+ | ✅ Full |

### Required Features

- **CSS Grid** - Layout system
- **CSS Variables** - Theming
- **Flexbox** - Component layout
- **ES6+ JavaScript** - Modern syntax
- **localStorage** - Theme persistence
- **EventSource** - Live reload (SSE)

### Graceful Degradation

**No JavaScript**:
- Report still readable
- No interactive features
- Print works

**No CSS Grid**:
- Falls back to flexbox
- Vertical layout

**No localStorage**:
- Dark mode works per session
- Not persisted across reloads

### Polyfills

Not required for modern browsers. For older browsers:

```html
<!-- EventSource polyfill for IE11 -->
<script src="https://cdn.jsdelivr.net/npm/event-source-polyfill@1.0.25/src/eventsource.min.js"></script>

<!-- CSS Variables polyfill -->
<script src="https://cdn.jsdelivr.net/npm/css-vars-ponyfill@2"></script>
```

## 🎨 Animations

### CSS Animations

**Fade In**:
```css
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```

**Fade In Up**:
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

**Slide Down**:
```css
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

**Pulse**:
```css
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
```

### Timing Functions

```css
/* Ease out - Natural deceleration */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Ease in-out - Smooth start and end */
transition: all 0.3s ease-in-out;

/* Linear - Constant speed */
animation: pulse 2s linear infinite;
```

### Performance

**GPU Acceleration**:
```css
transform: translateZ(0);  /* Force GPU rendering */
will-change: transform;     /* Hint browser */
```

**Avoid**:
- Width/height animations (use transform: scale)
- Top/left animations (use transform: translate)
- Animating many elements simultaneously

## 🖨️ Print Styles

### Print Optimizations

```css
@media print {
    /* Hide interactive elements */
    .toolbar, .filters, .fab, .toast {
        display: none !important;
    }

    /* Expand all content */
    .subtest.collapsed .subtest-content {
        display: block !important;
    }

    /* Remove backgrounds */
    body, .container {
        background: white !important;
        color: black !important;
    }

    /* Page breaks */
    .test {
        page-break-inside: avoid;
    }
}
```

### Print Features

- ✅ All content visible (no collapsed sections)
- ✅ Black and white friendly
- ✅ No interactive elements
- ✅ Proper page breaks
- ✅ Headers/footers optimized
- ✅ Links show URLs

## 🔗 Related Documentation

- [Getting Started](./getting-started.md)
- [Plugin System](./plugin-system.md)
- [API Reference](./api-reference.md)
- [Architecture](./architecture.md)
- [Contributing](./contributing.md)

---

All UX features are automatically included when using HTMLExportPlugin or HTMLServerPlugin.
