<?php
/**
 * Plugin Name:       Flexible Container
 * Description:       A flexible container block with responsive positioning controls and support for CSS variables
 * Version:           0.1.1
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
 * Flexible Container Block Class
 */
class Flashblocks_Flexible_Container {

	/**
	 * CSS property mapping.
	 */
	private static $prop_map = [
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
	];

	/**
	 * Collected styles storage.
	 */
	private static $styles = [
		'mobile'  => [],
		'tablet'  => [],
		'desktop' => [],
	];

	/**
	 * Cached breakpoints.
	 */
	private static $cached_breakpoints = null;

	/**
	 * Constructor - register hooks.
	 */
	public function __construct() {
		// Initialize the plugin.
		add_action( 'init', [ $this, 'init' ] );

		// Hook into block rendering.
		add_filter( 'render_block_flashblocks/flexible-container', [ $this, 'collect_styles_on_render' ], 10, 2 );

		// Output styles in footer.
		add_action( 'wp_footer', [ $this, 'output_collected_styles' ], 1 );

		// Enqueue editor assets.
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_editor_assets' ] );
	}

	/**
	 * Get current BBE breakpoints as min-width values (cached).
	 *
	 * @return array{tabletMin: int, desktopMin: int}
	 */
	public static function get_breakpoints(): array {
		if ( self::$cached_breakpoints !== null ) {
			return self::$cached_breakpoints;
		}

		if ( function_exists( 'fns_bbe_get_breakpoint' ) ) {
			$mobile_max = fns_bbe_get_breakpoint( 'mobile', false ) ?? 480;
			$tablet_max = fns_bbe_get_breakpoint( 'tablet', false ) ?? 960;
		} else {
			$breakpoints = get_option( 'better-block-editor__user-defined-responsiveness-breakpoints', [] );
			$mobile_max  = isset( $breakpoints['mobile']['value'] ) ? (int) $breakpoints['mobile']['value'] : 480;
			$tablet_max  = isset( $breakpoints['tablet']['value'] ) ? (int) $breakpoints['tablet']['value'] : 960;
		}

		self::$cached_breakpoints = [
			'tabletMin'  => $mobile_max + 1,
			'desktopMin' => $tablet_max + 1,
		];

		return self::$cached_breakpoints;
	}

	/**
	 * Check if viewport has any non-empty values.
	 *
	 * @param array $values Viewport CSS values.
	 * @return bool True if has values.
	 */
	private static function has_values( array $values ): bool {
		foreach ( self::$prop_map as $attr_key => $css_prop ) {
			if ( ( $values[ $attr_key ] ?? '' ) !== '' ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Generate CSS rules from viewport attributes.
	 *
	 * @param array $values Viewport CSS values.
	 * @return string CSS rules.
	 */
	public static function generate_css( array $values ): string {
		if ( ! self::has_values( $values ) ) {
			return '';
		}

		$rules = ['box-sizing: border-box'];
		foreach ( self::$prop_map as $attr_key => $css_prop ) {
			if ( ( $values[ $attr_key ] ?? '' ) === '' ) continue;

			$rules[] = $css_prop . ':' . $values[ $attr_key ];
		}

		return implode( '; ', $rules ) . ';';
	}

	/**
	 * Collect styles from FC blocks during render_block filter.
	 *
	 * @param string $block_content Rendered block content.
	 * @param array  $block         Block data.
	 * @return string Unmodified block content.
	 */
	public function collect_styles_on_render( string $block_content, array $block ): string {
		$attrs    = $block['attrs'] ?? [];
		$block_id = $attrs['blockId'] ?? '';

		if ( ! $block_id ) {
			return $block_content;
		}

		// Collect styles for this block.
		self::$styles['mobile'][ $block_id ]  = self::generate_css( $attrs['mobile'] ?? [] );
		self::$styles['tablet'][ $block_id ]  = self::generate_css( $attrs['tablet'] ?? [] );
		self::$styles['desktop'][ $block_id ] = self::generate_css( $attrs['desktop'] ?? [] );

		return $block_content;
	}

	/**
	 * Output collected FC block styles in footer.
	 */
	public function output_collected_styles(): void {
		if ( empty( self::$styles['mobile'] ) && empty( self::$styles['tablet'] ) && empty( self::$styles['desktop'] ) ) {
			return;
		}

		// Get current BBE breakpoints.
		$bp = self::get_breakpoints();

		// Build CSS output.
		$css_output = '';

		// Mobile rules (no media query)
		foreach ( self::$styles['mobile'] as $block_id => $css ) {
			if ( ! empty( $css ) ) {
				$css_output .= '.' . esc_attr( $block_id ) . " { {$css} } ";
			}
		}

		// Tablet rules
		$tablet_css = '';
		foreach ( self::$styles['tablet'] as $block_id => $css ) {
			if ( ! empty( $css ) ) {
				$tablet_css .= '.' . esc_attr( $block_id ) . " { {$css} } ";
			}
		}
		if ( ! empty( $tablet_css ) ) {
			$css_output .= "@media (min-width: {$bp['tabletMin']}px) { {$tablet_css} } ";
		}

		// Desktop rules
		$desktop_css = '';
		foreach ( self::$styles['desktop'] as $block_id => $css ) {
			if ( ! empty( $css ) ) {
				$desktop_css .= '.' . esc_attr( $block_id ) . " { {$css} } ";
			}
		}
		if ( ! empty( $desktop_css ) ) {
			$css_output .= "@media (min-width: {$bp['desktopMin']}px) { {$desktop_css} } ";
		}

		if ( $css_output ) {
			echo '<style id="flashblocks-fc-styles">' . $css_output . '</style>' . PHP_EOL;
		}

		// Clear for next page load.
		self::$styles = [
			'mobile'  => [],
			'tablet'  => [],
			'desktop' => [],
		];
	}

	/**
	 * Pass BBE breakpoints to the editor script.
	 */
	public function enqueue_editor_assets(): void {
		$bp = self::get_breakpoints();

		wp_localize_script(
			'flashblocks-flexible-container-editor-script',
			'fcBreakpoints',
			$bp
		);
	}

	/**
	 * Initialize the plugin.
	 */
	public function init(): void {
		register_block_type( __DIR__ . '/build/' );
	}
}

// Initialize the plugin.
new Flashblocks_Flexible_Container();
