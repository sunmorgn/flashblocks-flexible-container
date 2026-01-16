=== Flexible Container ===

Contributors:      flashblocks
Tags:              block, container, responsive, positioning
Tested up to:      6.8
Stable tag:        0.1.0
License:           GPLv2 or later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A flexible container block with responsive positioning controls and Better Block Editor integration.

== Description ==

The Flexible Container block provides advanced positioning and sizing controls with full responsive support. Perfect for creating complex layouts with precise control over element positioning across different screen sizes.

**Key Features:**

* Position type control (static, relative, absolute, fixed, sticky)
* Individual controls for top, right, bottom, left positioning
* Width, height, and z-index controls
* Transform property support
* Responsive controls for desktop, tablet, and mobile viewports
* Mobile-first CSS with inheritance (tablet inherits mobile, desktop inherits tablet)
* Support for CSS variables (var(--custom-property)) and calc() functions
* Clean, intuitive UI with viewport tabs synced to editor preview
* Each block gets unique scoped styles (no conflicts)

**Better Block Editor Integration:**

When the [Better Block Editor](https://developer.developer.developer) plugin is installed, Flexible Container automatically uses your configured breakpoints:

* Reads breakpoints from BBE settings (mobile: 480px, tablet: 960px by default)
* Converts to mobile-first min-width queries (481px, 961px)
* Changing BBE breakpoints immediately affects all existing blocks (no re-saving needed)

**Use Cases:**

* Create overlays and floating elements
* Build responsive card layouts
* Position elements precisely relative to their containers
* Implement sticky headers or sidebars
* Hide/show elements at different screen sizes
* Create complex grid-like layouts with absolute positioning

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/flexible-container` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress
3. (Optional) Install Better Block Editor plugin for configurable breakpoints
4. Add the Flexible Container block from the block inserter
5. Configure positioning and sizing using the sidebar controls
6. Switch between viewport tabs to set responsive values

== Frequently Asked Questions ==

= Can I use CSS variables and calc() functions? =

Yes! All positioning and sizing fields accept CSS variables like var(--my-spacing) and calc() functions like calc(100% - 20px).

= How do the responsive controls work? =

The block provides three viewport tabs: Mobile, Tablet, and Desktop. Values cascade upward (mobile-first):
- Mobile values are the base
- Tablet inherits from mobile unless overridden
- Desktop inherits from tablet (then mobile) unless overridden

= What are the default breakpoints? =

- Mobile: 0 - 480px (base styles, no media query)
- Tablet: 481px and up (@media min-width: 481px)
- Desktop: 961px and up (@media min-width: 961px)

If Better Block Editor is installed, breakpoints come from your BBE settings.

= What position types are supported? =

The block supports all CSS position types: static, relative, absolute, fixed, and sticky.

= Can I nest other blocks inside this container? =

Absolutely! The Flexible Container is designed to hold any WordPress blocks, including text, images, and other containers.

= How does the "Hide on this viewport" toggle work? =

It sets `display: none` for the selected viewport. Combined with inheritance, you can show/hide elements responsively.

== Screenshots ==

1. The Flexible Container block in the editor with responsive viewport controls
2. Position type selector and positioning controls in the sidebar
3. Example of a complex layout using multiple Flexible Containers

== Changelog ==

= 0.1.0 =
* Initial release
* Responsive viewport controls (desktop, tablet, mobile)
* Mobile-first CSS with inheritance
* Better Block Editor (BBE) breakpoint integration
* Position type selector
* Top, right, bottom, left positioning controls
* Width, height, and z-index controls
* Transform property support
* Unique block IDs for scoped CSS
* Support for CSS variables and calc() functions
