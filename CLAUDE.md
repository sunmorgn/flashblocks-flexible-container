# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run build        # Production build with wp-scripts
npm run start        # Development mode with hot reload and blocks manifest
npm run lint:js      # Lint JavaScript files
npm run lint:css     # Lint SCSS/CSS files
npm run format       # Format code with wp-scripts
```

## Architecture

This is a WordPress Gutenberg block plugin called "Flexible Container" that provides responsive positioning and sizing controls.

### Block Structure

- **`flashblocks-flexible-container.php`** - Main plugin file with `Flashblocks_Flexible_Container` class, handles block registration, style collection/output, and BBE integration
- **`src/block.json`** - Block metadata with responsive attributes for mobile/tablet/desktop
- **`src/edit.js`** - Editor component with Inspector Controls for responsive settings
- **`src/save.js`** - Save function outputs wrapper div structure with blockId class
- **`src/utils.js`** - Shared utilities (PROPS, EMPTY_VIEWPORT, POSITION_OPTIONS, getBreakpoints, generateBlockId)
- **`src/style.scss`** - Base styles including `.fc-inner` positioning context
- **`src/editor.scss`** - Editor-only styles for the block UI

### Responsive System

The block uses a mobile-first inheritance model:
- Each breakpoint (mobile, tablet, desktop) stores its own CSS properties (display, position, top/right/bottom/left, width, height, z-index, transform)
- Tablet inherits from mobile; desktop inherits from tablet (then mobile)
- Breakpoint values come from Better Block Editor (BBE) plugin if installed
- Each block instance gets a unique `blockId` for scoped CSS selectors (`.fc-{blockId}`)

### CSS Output Strategy (render_block + wp_footer)

Styles are generated at render time by PHP, not stored in block content:

1. **`render_block` filter** - Collects styles from each FC block into a global array
2. **`wp_footer` action** - Outputs all collected styles once as a single `<style>` tag

This approach (similar to BBE's StyleEngine pattern):
- Uses current BBE breakpoints at render time (not stored values)
- Changing BBE settings immediately affects all existing blocks
- Outputs CSS once per page, not per block
- Avoids storing breakpoints in block attributes

```html
<!-- Output in wp_footer -->
<style id="flashblocks-fc-styles">
.fc-abc1234 { display: none; }
.fc-def5678 { position: absolute; top: -20px; }

@media (min-width: 481px) {
    .fc-abc1234 { display: block; }
    .fc-def5678 { width: 450px; }
}

@media (min-width: 961px) {
    .fc-abc1234 { width: 50%; }
    .fc-def5678 { width: 660px; }
}
</style>
```

### Better Block Editor (BBE) Integration

The plugin integrates with BBE's user-defined breakpoints:

**PHP (`flashblocks-flexible-container.php`):**
- Uses `fns_bbe_get_breakpoint()` helper if available (from theme)
- Falls back to reading `better-block-editor__user-defined-responsiveness-breakpoints` option directly
- Passes breakpoints to editor via `wp_localize_script('fcBreakpoints')`
- Generates CSS with current BBE breakpoints at render time

**JavaScript (`src/utils.js` → `edit.js`):**
- Reads breakpoints from `window.WPBBE_DATA.breakpoints` (BBE's global) first
- Falls back to `window.fcBreakpoints` (our localized data)
- Falls back to defaults (tablet: 481px, desktop: 961px)

**Breakpoint Interpretation (mobile-first):**
- BBE stores max-width values (e.g., mobile: 480px, tablet: 960px)
- FC interprets as min-width: tablet starts at 481px, desktop starts at 961px
- CSS output: `@media (min-width: 481px)` for tablet, `@media (min-width: 961px)` for desktop

### Key Attributes

| Attribute | Type | Purpose |
|-----------|------|---------|
| `blockId` | string | Unique ID for CSS scoping (e.g., `fc-abc1234`) |
| `mobile` | object | CSS properties for mobile viewport |
| `tablet` | object | CSS properties for tablet viewport |
| `desktop` | object | CSS properties for desktop viewport |

### Shared Utilities (`src/utils.js`)

| Export | Purpose |
|--------|---------|
| `PROPS` | Array of CSS property names supported by the block |
| `EMPTY_VIEWPORT` | Object with all props set to empty string |
| `POSITION_OPTIONS` | Array of position type values |
| `getBreakpoints()` | Returns `{ tabletMin, desktopMin }` from BBE or defaults |
| `generateBlockId()` | Generates unique ID like `fc-abc1234` |

### Editor/Preview Sync

The edit component syncs its viewport tabs with the WordPress editor's device preview mode using `core/edit-post` and `core/editor` data stores.
