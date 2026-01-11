
=== Flexible Container ===

Contributors:      flashblocks
Tags:              block, container, responsive, positioning
Tested up to:      6.8
Stable tag:        0.1.0
License:           GPLv2 or later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A flexible container block with responsive positioning controls and support for CSS variables.

== Description ==

The Flexible Container block provides advanced positioning and sizing controls with full responsive support. Perfect for creating complex layouts with precise control over element positioning across different screen sizes.

Key Features:
* Position type control (static, relative, absolute, fixed, sticky)
* Individual controls for top, right, bottom, left positioning
* Width and height controls
* Responsive controls for desktop, tablet, and mobile viewports
* Support for CSS variables (var(--custom-property)) and calc() functions
* Clean, intuitive UI with viewport tabs
* Saves unique settings for each breakpoint

Use Cases:
* Create overlays and floating elements
* Build responsive card layouts
* Position elements precisely relative to their containers
* Implement sticky headers or sidebars
* Create complex grid-like layouts with absolute positioning

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/flexible-container` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Add the Flexible Container block from the block inserter
4. Configure positioning and sizing using the sidebar controls
5. Switch between viewport tabs to set responsive values

== Frequently Asked Questions ==

= Can I use CSS variables and calc() functions? =

Yes! All positioning and sizing fields accept CSS variables like var(--my-spacing) and calc() functions like calc(100% - 20px).

= How do the responsive controls work? =

The block provides three viewport tabs: Desktop, Tablet, and Mobile. Each viewport saves its own set of positioning values, allowing you to create fully responsive layouts.

= What position types are supported? =

The block supports all CSS position types: static, relative, absolute, fixed, and sticky.

= Can I nest other blocks inside this container? =

Absolutely! The Flexible Container is designed to hold any WordPress blocks, including text, images, and other containers.

== Screenshots ==

1. The Flexible Container block in the editor with responsive viewport controls
2. Position type selector and positioning controls in the sidebar
3. Example of a complex layout using multiple Flexible Containers

== Changelog ==

= 0.1.0 =
* Initial release
* Responsive viewport controls (desktop, tablet, mobile)
* Position type selector
* Top, right, bottom, left positioning controls
* Width and height controls
* Support for CSS variables and calc() functions
