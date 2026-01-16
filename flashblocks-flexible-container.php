<?php
/**
 * Plugin Name:       Flexible Container
 * Description:       A flexible container block with responsive positioning controls and support for CSS variables
 * Version:           0.1.0
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Author:            Flashblocks
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       flexible-container
 *
 * @package Flashblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Get current BBE breakpoints as min-width values.
 *
 * @return array{tabletMin: int, desktopMin: int}
 */
function flashblocks_fc_get_breakpoints(): array {
	if ( function_exists( 'fns_bbe_get_breakpoint' ) ) {
		$mobile_max = fns_bbe_get_breakpoint( 'mobile', false ) ?? 480;
		$tablet_max = fns_bbe_get_breakpoint( 'tablet', false ) ?? 960;
	} else {
		$breakpoints = get_option( 'better-block-editor__user-defined-responsiveness-breakpoints', array() );
		$mobile_max  = isset( $breakpoints['mobile']['value'] ) ? (int) $breakpoints['mobile']['value'] : 480;
		$tablet_max  = isset( $breakpoints['tablet']['value'] ) ? (int) $breakpoints['tablet']['value'] : 960;
	}

	return array(
		'tabletMin'  => $mobile_max + 1,
		'desktopMin' => $tablet_max + 1,
	);
}

/**
 * Generate CSS rules from viewport attributes.
 *
 * @param array $values Viewport CSS values.
 * @return string CSS rules.
 */
function flashblocks_fc_generate_css( array $values ): string {
	$prop_map = array(
		'display'   => 'display',
		'position'  => 'position',
		'top'       => 'top',
		'right'     => 'right',
		'bottom'    => 'bottom',
		'left'      => 'left',
		'width'     => 'width',
		'height'    => 'height',
		'zIndex'    => 'z-index',
		'transform' => 'transform',
	);

	$rules = array();
	foreach ( $prop_map as $attr_key => $css_prop ) {
		if ( ! empty( $values[ $attr_key ] ) ) {
			$rules[] = $css_prop . ': ' . $values[ $attr_key ];
		}
	}

	return $rules ? implode( '; ', $rules ) . ';' : '';
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function flashblocks_flexible_container_block_init() {
	register_block_type( __DIR__ . '/build/' );
}
add_action( 'init', 'flashblocks_flexible_container_block_init' );

/**
 * Storage for collected FC block styles during render.
 */
global $flashblocks_fc_styles;
$flashblocks_fc_styles = array();

/**
 * Collect styles from FC blocks during render_block filter.
 * Styles are stored and output once at wp_footer.
 *
 * @param string $block_content Rendered block content.
 * @param array  $block         Block data.
 * @return string Unmodified block content.
 */
function flashblocks_fc_collect_styles_on_render( string $block_content, array $block ): string {
	global $flashblocks_fc_styles;

	$attrs    = $block['attrs'] ?? array();
	$block_id = $attrs['blockId'] ?? '';

	if ( ! $block_id ) {
		return $block_content;
	}

	// Collect styles for this block.
	$flashblocks_fc_styles[ $block_id ] = array(
		'mobile'  => flashblocks_fc_generate_css( $attrs['mobile'] ?? array() ),
		'tablet'  => flashblocks_fc_generate_css( $attrs['tablet'] ?? array() ),
		'desktop' => flashblocks_fc_generate_css( $attrs['desktop'] ?? array() ),
	);

	return $block_content;
}
add_filter( 'render_block_flashblocks/flexible-container', 'flashblocks_fc_collect_styles_on_render', 10, 2 );

/**
 * Output collected FC block styles in footer.
 * Uses current BBE breakpoints at render time.
 */
function flashblocks_fc_output_collected_styles(): void {
	global $flashblocks_fc_styles;

	if ( empty( $flashblocks_fc_styles ) ) {
		return;
	}

	// Get current BBE breakpoints.
	$bp = flashblocks_fc_get_breakpoints();

	// Build CSS output.
	$css_output = '';
	foreach ( $flashblocks_fc_styles as $block_id => $viewports ) {
		$selector = '.' . esc_attr( $block_id );

		if ( ! empty( $viewports['mobile'] ) ) {
			$css_output .= "{$selector} { {$viewports['mobile']} } ";
		}
		if ( ! empty( $viewports['tablet'] ) ) {
			$css_output .= "@media (min-width: {$bp['tabletMin']}px) { {$selector} { {$viewports['tablet']} } } ";
		}
		if ( ! empty( $viewports['desktop'] ) ) {
			$css_output .= "@media (min-width: {$bp['desktopMin']}px) { {$selector} { {$viewports['desktop']} } } ";
		}
	}

	if ( $css_output ) {
		echo '<style id="flashblocks-fc-styles">' . $css_output . '</style>' . PHP_EOL;
	}

	// Clear for next page load.
	$flashblocks_fc_styles = array();
}
add_action( 'wp_footer', 'flashblocks_fc_output_collected_styles', 1 );

/**
 * Pass BBE breakpoints to the editor script.
 */
function flashblocks_fc_enqueue_editor_assets() {
	$bp = flashblocks_fc_get_breakpoints();

	wp_localize_script(
		'flashblocks-flexible-container-editor-script',
		'fcBreakpoints',
		$bp
	);
}
add_action( 'enqueue_block_editor_assets', 'flashblocks_fc_enqueue_editor_assets' );
