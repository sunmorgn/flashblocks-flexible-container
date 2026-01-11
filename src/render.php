<?php
/**
 * Render callback for Flexible Container block
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block      Block instance.
 * @return string Block HTML.
 */

if ( ! function_exists( 'flashblocks_flexible_container_get_inherited_value' ) ) {
	/**
	 * Helper function to get effective value with inheritance
	 *
	 * @param string $prop Property name.
	 * @param array  $mobile Mobile attributes.
	 * @param array  $tablet Tablet attributes.
	 * @param array  $desktop Desktop attributes.
	 * @param string $viewport Current viewport.
	 * @return string Property value.
	 */
	function flashblocks_flexible_container_get_inherited_value( $prop, $mobile, $tablet, $desktop, $viewport ) {
		if ( $viewport === 'mobile' ) {
			return isset( $mobile[ $prop ] ) ? $mobile[ $prop ] : '';
		}
		if ( $viewport === 'tablet' ) {
			// Tablet inherits from mobile if not set
			if ( isset( $tablet[ $prop ] ) && $tablet[ $prop ] !== '' ) {
				return $tablet[ $prop ];
			}
			return isset( $mobile[ $prop ] ) ? $mobile[ $prop ] : '';
		}
		if ( $viewport === 'desktop' ) {
			// Desktop inherits from tablet, which inherits from mobile
			if ( isset( $desktop[ $prop ] ) && $desktop[ $prop ] !== '' ) {
				return $desktop[ $prop ];
			}
			if ( isset( $tablet[ $prop ] ) && $tablet[ $prop ] !== '' ) {
				return $tablet[ $prop ];
			}
			return isset( $mobile[ $prop ] ) ? $mobile[ $prop ] : '';
		}
		return '';
	}
}

$mobile = isset( $attributes['mobile'] ) ? $attributes['mobile'] : array();
$tablet = isset( $attributes['tablet'] ) ? $attributes['tablet'] : array();
$desktop = isset( $attributes['desktop'] ) ? $attributes['desktop'] : array();

// Build inline styles for mobile (default/base styles)
$mobile_styles = array();
$props = array( 'position', 'top', 'right', 'bottom', 'left', 'width', 'height', 'zIndex' );

foreach ( $props as $prop ) {
	$value = flashblocks_flexible_container_get_inherited_value( $prop, $mobile, $tablet, $desktop, 'mobile' );
	if ( $value !== '' ) {
		$css_prop = $prop === 'zIndex' ? 'z-index' : $prop;
		$mobile_styles[] = $css_prop . ': ' . esc_attr( $value );
	}
}

$inline_style = ! empty( $mobile_styles ) ? implode( '; ', $mobile_styles ) : '';

// Generate unique ID for this block instance
$unique_id = 'flexible-container-' . wp_unique_id();

// Build media query styles
$media_styles = '';

// Tablet styles (min-width: 600px)
$tablet_styles = array();
foreach ( $props as $prop ) {
	$tablet_value = flashblocks_flexible_container_get_inherited_value( $prop, $mobile, $tablet, $desktop, 'tablet' );
	$mobile_value = flashblocks_flexible_container_get_inherited_value( $prop, $mobile, $tablet, $desktop, 'mobile' );
	
	// Only add to media query if different from mobile
	if ( $tablet_value !== '' && $tablet_value !== $mobile_value ) {
		$css_prop = $prop === 'zIndex' ? 'z-index' : $prop;
		$tablet_styles[] = $css_prop . ': ' . esc_attr( $tablet_value );
	}
}

if ( ! empty( $tablet_styles ) ) {
	$media_styles .= '@media (min-width: 600px) { .' . esc_attr( $unique_id ) . ' { ' . implode( '; ', $tablet_styles ) . '; } }';
}

// Desktop styles (min-width: 1024px)
$desktop_styles = array();
foreach ( $props as $prop ) {
	$desktop_value = flashblocks_flexible_container_get_inherited_value( $prop, $mobile, $tablet, $desktop, 'desktop' );
	$tablet_value = flashblocks_flexible_container_get_inherited_value( $prop, $mobile, $tablet, $desktop, 'tablet' );
	
	// Only add to media query if different from tablet
	if ( $desktop_value !== '' && $desktop_value !== $tablet_value ) {
		$css_prop = $prop === 'zIndex' ? 'z-index' : $prop;
		$desktop_styles[] = $css_prop . ': ' . esc_attr( $desktop_value );
	}
}

if ( ! empty( $desktop_styles ) ) {
	$media_styles .= '@media (min-width: 1024px) { .' . esc_attr( $unique_id ) . ' { ' . implode( '; ', $desktop_styles ) . '; } }';
}

// Get block wrapper attributes
$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => $unique_id,
		'style' => $inline_style,
	)
);
?>

<?php if ( ! empty( $media_styles ) ) : ?>
<style>
<?php echo $media_styles; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</style>
<?php endif; ?>

<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</div>