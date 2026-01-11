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
