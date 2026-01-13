import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl, Button, __experimentalToggleGroupControl as ToggleGroupControl, __experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { desktop, tablet, mobile, reset } from '@wordpress/icons';
import './editor.scss';

export default function Edit({ attributes, setAttributes, clientId }) {
	const [activeViewport, setActiveViewport] = useState('mobile');
	
	// Generate unique blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId.substring(0, 8) });
		}
	}, []);
	
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
	
	// Sync our tabs when editor preview changes (from WP toolbar)
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

	// Reset current viewport to default/inherited values
	const resetViewport = () => {
		const updates = {
			[activeViewport]: {
				display: '',
				position: '',
				top: '',
				right: '',
				bottom: '',
				left: '',
				width: '',
				height: '',
				zIndex: ''
			}
		};
		
		// Also reset breakpoint to default
		if (activeViewport === 'tablet') {
			updates.tabletBreakpoint = '600px';
		} else if (activeViewport === 'desktop') {
			updates.desktopBreakpoint = '1024px';
		}
		
		setAttributes(updates);
	};

	// Check if a specific viewport has any values set
	const viewportHasValues = (viewport) => {
		return Object.values(attributes[viewport]).some(val => val !== '');
	};

	// Check if current viewport has any values set
	const hasAnyValues = () => {
		return viewportHasValues(activeViewport);
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
		
		// For tablet/desktop, show what value would be inherited
		let inheritedValue = '';
		if (activeViewport === 'tablet') {
			inheritedValue = attributes.mobile.position;
		} else if (activeViewport === 'desktop') {
			// Desktop inherits from tablet if set, otherwise mobile
			inheritedValue = attributes.tablet.position || attributes.mobile.position;
		}
		
		const inheritLabel = inheritedValue 
			? `↑ ${inheritedValue.charAt(0).toUpperCase() + inheritedValue.slice(1)} (inherited)`
			: __('↑ Default (inherited)', 'flexible-container');
		
		return [{ label: inheritLabel, value: '' }, ...baseOptions];
	};

	// Build display options with inherited value indicator
	const getDisplayOptions = () => {
		const baseOptions = [
			{ label: __('Block', 'flexible-container'), value: 'block' },
			{ label: __('Flex', 'flexible-container'), value: 'flex' },
			{ label: __('Grid', 'flexible-container'), value: 'grid' },
			{ label: __('Inline', 'flexible-container'), value: 'inline' },
			{ label: __('Inline-Block', 'flexible-container'), value: 'inline-block' },
			{ label: __('Inline-Flex', 'flexible-container'), value: 'inline-flex' },
			{ label: __('None', 'flexible-container'), value: 'none' }
		];
		
		if (activeViewport === 'mobile') {
			return [{ label: __('Default', 'flexible-container'), value: '' }, ...baseOptions];
		}
		
		let inheritedValue = '';
		if (activeViewport === 'tablet') {
			inheritedValue = attributes.mobile.display;
		} else if (activeViewport === 'desktop') {
			inheritedValue = attributes.tablet.display || attributes.mobile.display;
		}
		
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
		
		const display = getEffectiveValue('display');
		const position = getEffectiveValue('position');
		const top = getEffectiveValue('top');
		const right = getEffectiveValue('right');
		const bottom = getEffectiveValue('bottom');
		const left = getEffectiveValue('left');
		const width = getEffectiveValue('width');
		const height = getEffectiveValue('height');
		const zIndex = getEffectiveValue('zIndex');
		
		if (display) styles.display = display;
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
				<PanelBody title={__('Responsive', 'flexible-container')} initialOpen={true}>
					<div className="flexible-container-viewport-controls">
						<div className="flexible-container-viewport-tabs">
							<ToggleGroupControl
								value={activeViewport}
								onChange={handleViewportChange}
								isBlock
								__nextHasNoMarginBottom
							>
								{Object.entries(viewportIcons).map(([key, { icon, label }]) => (
									<ToggleGroupControlOptionIcon
										key={key}
										value={key}
										icon={icon}
										label={label}
										className={viewportHasValues(key) ? 'has-values' : ''}
									/>
								))}
							</ToggleGroupControl>
						</div>
						<div className="flexible-container-viewport-label">
							{__('Editing:', 'flexible-container')} <strong>{viewportIcons[activeViewport].label}</strong>
							{activeViewport === 'tablet' && (
								<TextControl
									value={attributes.tabletBreakpoint}
									onChange={(value) => setAttributes({ tabletBreakpoint: value })}
									className="flexible-container-breakpoint-input"
								/>
							)}
							{activeViewport === 'desktop' && (
								<TextControl
									value={attributes.desktopBreakpoint}
									onChange={(value) => setAttributes({ desktopBreakpoint: value })}
									className="flexible-container-breakpoint-input"
								/>
							)}
							{hasAnyValues() && (
								<Button
									icon={reset}
									onClick={resetViewport}
									label={__('Reset all values', 'flexible-container')}
									isSmall
									isDestructive
									className="flexible-container-reset-btn"
								/>
							)}
							{activeViewport !== 'mobile' && (
								<div className="flexible-container-inheritance-note">
									{activeViewport === 'tablet' && __('Inherits from Mobile unless overridden', 'flexible-container')}
									{activeViewport === 'desktop' && __('Inherits from Tablet/Mobile unless overridden', 'flexible-container')}
								</div>
							)}
						</div>
					</div>
					
					<SelectControl
						label={__('Display', 'flexible-container')}
						value={viewportData.display}
						options={getDisplayOptions()}
						onChange={(value) => updateViewportAttribute('display', value)}
						className={!hasOverride('display') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
				</PanelBody>
				
				<PanelBody title={__('Position', 'flexible-container')}>
					<SelectControl
						label={__('Position Type', 'flexible-container')}
						value={viewportData.position}
						options={getPositionOptions()}
						onChange={(value) => updateViewportAttribute('position', value)}
						className={!hasOverride('position') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
					
					<TextControl
						label={__('Top', 'flexible-container')}
						value={viewportData.top}
						onChange={(value) => updateViewportAttribute('top', value)}
						placeholder={!hasOverride('top') && activeViewport !== 'mobile' ? getEffectiveValue('top') || 'inherited' : ''}
						className={!hasOverride('top') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
					
					<TextControl
						label={__('Right', 'flexible-container')}
						value={viewportData.right}
						onChange={(value) => updateViewportAttribute('right', value)}
						placeholder={!hasOverride('right') && activeViewport !== 'mobile' ? getEffectiveValue('right') || 'inherited' : ''}
						className={!hasOverride('right') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
					
					<TextControl
						label={__('Bottom', 'flexible-container')}
						value={viewportData.bottom}
						onChange={(value) => updateViewportAttribute('bottom', value)}
						placeholder={!hasOverride('bottom') && activeViewport !== 'mobile' ? getEffectiveValue('bottom') || 'inherited' : ''}
						className={!hasOverride('bottom') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
					
					<TextControl
						label={__('Left', 'flexible-container')}
						value={viewportData.left}
						onChange={(value) => updateViewportAttribute('left', value)}
						placeholder={!hasOverride('left') && activeViewport !== 'mobile' ? getEffectiveValue('left') || 'inherited' : ''}
						className={!hasOverride('left') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
					
					<TextControl
						label={__('Z-Index', 'flexible-container')}
						value={viewportData.zIndex}
						onChange={(value) => updateViewportAttribute('zIndex', value)}
						placeholder={!hasOverride('zIndex') && activeViewport !== 'mobile' ? getEffectiveValue('zIndex') || 'inherited' : ''}
						className={!hasOverride('zIndex') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
				</PanelBody>
				
				<PanelBody title={__('Dimensions', 'flexible-container')} initialOpen={true}>
					<TextControl
						label={__('Width', 'flexible-container')}
						value={viewportData.width}
						onChange={(value) => updateViewportAttribute('width', value)}
						placeholder={!hasOverride('width') && activeViewport !== 'mobile' ? getEffectiveValue('width') || 'inherited' : ''}
						className={!hasOverride('width') && activeViewport !== 'mobile' ? 'is-inherited' : ''}
					/>
					
					<TextControl
						label={__('Height', 'flexible-container')}
						value={viewportData.height}
						onChange={(value) => updateViewportAttribute('height', value)}
						placeholder={!hasOverride('height') && activeViewport !== 'mobile' ? getEffectiveValue('height') || 'inherited' : ''}
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