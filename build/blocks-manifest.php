<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'flashblocks/flexible-container',
		'version' => '0.1.0',
		'title' => 'Flexible Container',
		'category' => 'design',
		'icon' => 'move',
		'description' => 'A flexible container with responsive positioning and sizing controls',
		'keywords' => array(
			'container',
			'position',
			'responsive',
			'layout'
		),
		'attributes' => array(
			'blockId' => array(
				'type' => 'string',
				'default' => ''
			),
			'tabletBreakpoint' => array(
				'type' => 'string',
				'default' => '600px'
			),
			'desktopBreakpoint' => array(
				'type' => 'string',
				'default' => '1024px'
			),
			'desktop' => array(
				'type' => 'object',
				'default' => array(
					'position' => '',
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => '',
					'width' => '',
					'height' => '',
					'zIndex' => ''
				)
			),
			'tablet' => array(
				'type' => 'object',
				'default' => array(
					'position' => '',
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => '',
					'width' => '',
					'height' => '',
					'zIndex' => ''
				)
			),
			'mobile' => array(
				'type' => 'object',
				'default' => array(
					'position' => '',
					'top' => '',
					'right' => '',
					'bottom' => '',
					'left' => '',
					'width' => '',
					'height' => '',
					'zIndex' => ''
				)
			)
		),
		'supports' => array(
			'html' => false,
			'align' => true,
			'color' => array(
				'background' => true,
				'text' => true,
				'link' => true
			),
			'spacing' => array(
				'padding' => true,
				'margin' => true
			),
			'typography' => array(
				'fontSize' => true,
				'lineHeight' => true
			)
		),
		'textdomain' => 'flexible-container',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css'
	)
);
