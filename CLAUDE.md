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

- **`flashblocks-flexible-container.php`** - Plugin entry point, registers the block from `build/` directory
- **`src/block.json`** - Block metadata with responsive attributes for mobile/tablet/desktop breakpoints
- **`src/edit.js`** - Editor component with Inspector Controls for responsive settings
- **`src/save.js`** - Frontend output, generates inline `<style>` tags with media queries per block instance
- **`src/editor.scss`** - Editor-only styles for the block UI

### Responsive System

The block uses a mobile-first inheritance model:
- Each breakpoint (mobile, tablet, desktop) stores its own CSS properties (display, position, top/right/bottom/left, width, height, z-index)
- Tablet inherits from mobile; desktop inherits from tablet (then mobile)
- Custom breakpoint values are configurable (`tabletBreakpoint`, `desktopBreakpoint` attributes)
- Each block instance gets a unique `blockId` for scoped CSS selectors (`.fc-{blockId}`)

### Editor/Preview Sync

The edit component syncs its viewport tabs with the WordPress editor's device preview mode using `core/edit-post` and `core/editor` data stores.

### Output Strategy

The save function generates scoped CSS with media queries embedded as a `<style>` tag alongside the block markup, avoiding global stylesheet conflicts.
