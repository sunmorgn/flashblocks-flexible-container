import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl, Button, ButtonGroup } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { desktop, tablet, mobile } from '@wordpress/icons';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
	const [activeViewport, setActiveViewport] = useState('mobile');
	
	// Get the editor's current device preview mode
	const editorDeviceType = useSelect((select) => {
		// Try the edit-post store first (classic editor structure)
		const editPost = select('core/edit-post');
		if (editPost?.__experimentalGetPreviewDeviceType) {
			return editPost.__experimentalGetPreviewDeviceType();
		}
		// Fall back to editor store (newer/site editor)
		const editor = select('core/editor');
		if (editor?.getDeviceType) {
			return editor.getDeviceType();
		}
		return 'Desktop';
	}, []);
	
	// Get dispatch to set the editor's device preview
	const { __experimentalSetPreviewDeviceType: setEditPostDeviceType } = useDispatch('core/edit-post') || {};
	const { setDeviceType: setEditorDeviceType } = useDispatch('core/editor') || {};
	
	// Sync editor preview when our tabs change
	const syncEditorPreview = (viewport) => {
		const deviceMap = {
			mobile: 'Mobile',
			tablet: 'Tablet', 
			desktop: 'Desktop'
		};
		const deviceType = deviceMap[viewport];
		
		if (setEditPostDeviceType) {
			setEditPostDeviceType(deviceType);
		} else if (setEditorDeviceType) {
			setEditorDeviceType(deviceType);
		}
	};
	
	// Sync our tabs when editor preview changes
	useEffect(() => {
		const viewportMap = {
			'Mobile': 'mobile',
			'Tablet': 'tablet',
			'Desktop': 'desktop'
		};
		const mappedViewport = viewportMap[editorDeviceType];
		if (mappedViewport && mappedViewport !== activeViewport) {
			setActiveViewport(mappedViewport);
		}
	}, [editorDeviceType]);
	
	// Handle tab click - update both local state and editor preview
	const handleViewportChange = (viewport) => {
		setActiveViewport(viewport);
		syncEditorPreview(viewport);
	};
	
	const viewportData = attributes[activeViewport];
	
	// Get effective value with inheritance: desktop inherits from tablet, tablet inherits from mobile
	const getEffectiveValue = (key) => {
		if (activeViewport === 'mobile') {
			return attributes.mobile[key];
		}
		if (activeViewport === 'tablet') {
			// If tablet has a value, use it, otherwise inherit from mobile
			return attributes.tablet[key] !== '' ? attributes.tablet[key] : attributes.mobile[key];
		}
		if (activeViewport === 'desktop') {
			// If desktop has a value, use it
			if (attributes.desktop[key] !== '') return attributes.desktop[key];
			// Otherwise check tablet
			if (attributes.tablet[key] !== '') return attributes.tablet[key];
			// Finally fall back to mobile
			return attributes.mobile[key];
		}
		return '';
	};
	
	const updateViewportAttribute = (key, value) => {
		setAttributes({
			[activeViewport]: {
				...viewportData,
				[key]: value
			}
		});
	};

	// Build position options with inherited value indicator
	const getPositionOptions = () => {
		const baseOptions = [
			{ label: __('Static', 'flexible-container'), value: 'static' },
			{ label: __('Relative', 'flexible-container'), value: 'relative' },
			{ label: __('Absolute', 'flexible-container'), value: 'absolute' },
			{ label: __('Fixed', 'flexible-container'), value: 'fixed' },
			{ label: __('Sticky', 'flexible-container'), value: 'sticky' }
		];
		
		// For mobile, just show "Default" as first option
		if (activeViewport === 'mobile') {
			return [{ label: __('Default', 'flexible-container'), value: '' }, ...baseOptions];
		}
		
		// For tablet/desktop, show inherited value in the "inherit" option
		const inheritedValue = getEffectiveValue('position');
		const inheritLabel = inheritedValue 
			? `↑ ${inheritedValue.charAt(0).toUpperCase() + inheritedValue.slice(1)} (inherited)`
			: __('↑ Default (inherited)', 'flexible-container');
		
		return [{ label: inheritLabel, value: '' }, ...baseOptions];
	};

	const viewportIcons = {
		mobile: { icon: mobile, label: __('Mobile', 'flexible-container') },
		tablet: { icon: tablet, label: __('Tablet', 'flexible-container') },
		desktop: { icon: desktop, label: __('Desktop', 'flexible-container') }
	};

	const getInlineStyles = () => {
		const styles = {};
		
		// Use effective values for preview
		const position = getEffectiveValue('position');
		const top = getEffectiveValue('top');
		const right = getEffectiveValue('right');
		const bottom = getEffectiveValue('bottom');
		const left = getEffectiveValue('left');
		const width = getEffectiveValue('width');
		const height = getEffectiveValue('height');
		const zIndex = getEffectiveValue('zIndex');
		
		if (position) styles.position = position;
		if (top) styles.top = top;
		if (right) styles.right = right;
		if (bottom) styles.bottom = bottom;
		if (left) styles.left = left;
		if (width) styles.width = width;
		if (height) styles.height = height;
		if (zIndex) styles.zIndex = zIndex;
		
		return styles;
	};

	const blockProps = useBlockProps({
		style: getInlineStyles()
	});
	
	// Check if current viewport has overridden values
	const hasOverride = (key) => {
		if (activeViewport === 'mobile') return true;
		return viewportData[key] !== '';
	};

	return (
		<>
			<InspectorControls>
				<div className="flexible-container-viewport-controls">
					<div className="flexible-container-viewport-tabs">
						<ButtonGroup>
							{Object.entries(viewportIcons).map(([key, { icon, label }]) => (
								<Button
									key={key}
									icon={icon}
									isPressed={activeViewport === key}
									onClick={() => handleViewportChange(key)}
									label={label}
								/>
							))}
						</ButtonGroup>
					</div>
					<div className="flexible-container-viewport-label">
						{__('Editing:', 'flexible-container')} <strong>{viewportIcons[activeViewport].label}</strong>
						{activeViewport !== 'mobile' && (
							<div className="flexible-container-inheritance-note">
								{activeViewport === 'tablet' && __('Inherits from Mobile unless overridden', 'flexible-container')}
								{activeViewport === 'desktop' && __('Inherits from Tablet/Mobile unless overridden', 'flexible-container')}
							</div>
						)}
					</div>
				</div>
				
				<PanelBody title={__('Position', 'flexible-container')}>
					<SelectControl
						label={__('Position Type', 'flexible-container')}
						value={viewportData.position}
						options={getPositionOptions()}
						onChange={(value) => updateViewportAttribute('position', value)}
						help={!hasOverride('position') && activeViewport !== 'mobile' ? __('Using inherited value', 'flexible-container') : __('Controls how the element is positioned', 'flexible-container')}
						className={!hasOverride('position') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
					
					<TextControl
						label={__('Top', 'flexible-container')}
						value={viewportData.top}
						onChange={(value) => updateViewportAttribute('top', value)}
						placeholder={!hasOverride('top') && activeViewport !== 'mobile' ? getEffectiveValue('top') || 'inherited' : 'e.g., 10px, 0, calc(50% - 20px)'}
						help={!hasOverride('top') && activeViewport !== 'mobile' ? __('Inherited (edit to override)', 'flexible-container') : ''}
						className={!hasOverride('top') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
					
					<TextControl
						label={__('Right', 'flexible-container')}
						value={viewportData.right}
						onChange={(value) => updateViewportAttribute('right', value)}
						placeholder={!hasOverride('right') && activeViewport !== 'mobile' ? getEffectiveValue('right') || 'inherited' : 'e.g., 10px, 0, calc(50% - 20px)'}
						help={!hasOverride('right') && activeViewport !== 'mobile' ? __('Inherited (edit to override)', 'flexible-container') : ''}
						className={!hasOverride('right') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
					
					<TextControl
						label={__('Bottom', 'flexible-container')}
						value={viewportData.bottom}
						onChange={(value) => updateViewportAttribute('bottom', value)}
						placeholder={!hasOverride('bottom') && activeViewport !== 'mobile' ? getEffectiveValue('bottom') || 'inherited' : 'e.g., 10px, 0, calc(50% - 20px)'}
						help={!hasOverride('bottom') && activeViewport !== 'mobile' ? __('Inherited (edit to override)', 'flexible-container') : ''}
						className={!hasOverride('bottom') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
					
					<TextControl
						label={__('Left', 'flexible-container')}
						value={viewportData.left}
						onChange={(value) => updateViewportAttribute('left', value)}
						placeholder={!hasOverride('left') && activeViewport !== 'mobile' ? getEffectiveValue('left') || 'inherited' : 'e.g., 10px, 0, calc(50% - 20px)'}
						help={!hasOverride('left') && activeViewport !== 'mobile' ? __('Inherited (edit to override)', 'flexible-container') : ''}
						className={!hasOverride('left') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
					
					<TextControl
						label={__('Z-Index', 'flexible-container')}
						value={viewportData.zIndex}
						onChange={(value) => updateViewportAttribute('zIndex', value)}
						placeholder={!hasOverride('zIndex') && activeViewport !== 'mobile' ? getEffectiveValue('zIndex') || 'inherited' : 'e.g., 10, 999'}
						help={!hasOverride('zIndex') && activeViewport !== 'mobile' ? __('Inherited (edit to override)', 'flexible-container') : __('Stacking order (higher values appear on top)', 'flexible-container')}
						className={!hasOverride('zIndex') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
				</PanelBody>
				
				<PanelBody title={__('Dimensions', 'flexible-container')} initialOpen={true}>
					<TextControl
						label={__('Width', 'flexible-container')}
						value={viewportData.width}
						onChange={(value) => updateViewportAttribute('width', value)}
						placeholder={!hasOverride('width') && activeViewport !== 'mobile' ? getEffectiveValue('width') || 'inherited' : 'e.g., 100%, calc(100vw - 40px)'}
						help={!hasOverride('width') && activeViewport !== 'mobile' ? __('Inherited (edit to override)', 'flexible-container') : ''}
						className={!hasOverride('width') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
					
					<TextControl
						label={__('Height', 'flexible-container')}
						value={viewportData.height}
						onChange={(value) => updateViewportAttribute('height', value)}
						placeholder={!hasOverride('height') && activeViewport !== 'mobile' ? getEffectiveValue('height') || 'inherited' : 'e.g., 100vh, calc(100% - 40px)'}
						help={!hasOverride('height') && activeViewport !== 'mobile' ? __('Inherited (edit to override)', 'flexible-container') : ''}
						className={!hasOverride('height') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...blockProps}>
				<InnerBlocks />
			</div>
		</>
	);
}