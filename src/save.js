import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

// Convert camelCase to kebab-case
const toKebab = (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

export default function save({ attributes }) {
	const { mobile, tablet, desktop, tabletBreakpoint, desktopBreakpoint, blockId } = attributes;
	const props = ['position', 'top', 'right', 'bottom', 'left', 'width', 'height', 'zIndex'];
	
	// Build CSS for each breakpoint
	const buildStyles = (values) => {
		return props
			.filter(prop => values[prop])
			.map(prop => `${toKebab(prop)}: ${values[prop]}`)
			.join('; ');
	};
	
	const mobileStyles = buildStyles(mobile);
	const tabletStyles = buildStyles(tablet);
	const desktopStyles = buildStyles(desktop);
	
	// Build the style tag content
	let styleContent = '';
	const selector = `.fc-${blockId}`;
	
	if (mobileStyles) {
		styleContent += `${selector} { ${mobileStyles}; }`;
	}
	if (tabletStyles) {
		styleContent += `@media (min-width: ${tabletBreakpoint}) { ${selector} { ${tabletStyles}; } }`;
	}
	if (desktopStyles) {
		styleContent += `@media (min-width: ${desktopBreakpoint}) { ${selector} { ${desktopStyles}; } }`;
	}
	
	const blockProps = useBlockProps.save({
		className: `fc-${blockId}`
	});
	
	return (
		<>
			{styleContent && <style>{styleContent}</style>}
			<div {...blockProps}>
				<InnerBlocks.Content />
			</div>
		</>
	);
}
