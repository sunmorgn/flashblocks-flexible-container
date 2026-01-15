import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

const PROP_TO_VAR = {
	display: '--fc-display',
	position: '--fc-position',
	top: '--fc-top',
	right: '--fc-right',
	bottom: '--fc-bottom',
	left: '--fc-left',
	width: '--fc-width',
	height: '--fc-height',
	zIndex: '--fc-z-index'
};

export default function save({ attributes }) {
	const { mobile, tablet, desktop } = attributes;

	// Build CSS variables: mobile (base), tablet (-tablet), desktop (-desktop)
	const cssVars = {};

	const addVars = (values, suffix = '') => {
		Object.entries(PROP_TO_VAR).forEach(([prop, varName]) => {
			if (values[prop]) {
				cssVars[`${varName}${suffix}`] = values[prop];
			}
		});
	};

	addVars(mobile);
	addVars(tablet, '-tablet');
	addVars(desktop, '-desktop');

	return (
		<div {...useBlockProps.save({ className: 'fc-block', style: cssVars })}>
			<InnerBlocks.Content />
		</div>
	);
}
