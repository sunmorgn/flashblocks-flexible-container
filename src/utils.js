/**
 * Shared utilities for Flexible Container block.
 */

/**
 * CSS properties supported by the block.
 */
export const PROPS = [
	'display',
	'position',
	'top',
	'right',
	'bottom',
	'left',
	'width',
	'height',
	'zIndex',
	'transform',
];

/**
 * Empty viewport object with all props set to empty string.
 */
export const EMPTY_VIEWPORT = Object.fromEntries(PROPS.map((p) => [p, '']));

/**
 * Position type options.
 */
export const POSITION_OPTIONS = ['static', 'relative', 'absolute', 'fixed', 'sticky'];

/**
 * Read breakpoints from BBE or localized data or use defaults.
 * @returns {{ tabletMin: number, desktopMin: number }}
 */
export const getBreakpoints = () => {
	// Try BBE data first (window.WPBBE_DATA.breakpoints)
	const bbe = window.WPBBE_DATA?.breakpoints;
	// Then try our localized data
	const fc = window.fcBreakpoints;

	if (bbe) {
		const mobileBreakpoint = bbe.find((b) => b.key === 'mobile');
		const tabletBreakpoint = bbe.find((b) => b.key === 'tablet');
		return {
			tabletMin: mobileBreakpoint ? parseInt(mobileBreakpoint.value) + 1 : 481,
			desktopMin: tabletBreakpoint ? parseInt(tabletBreakpoint.value) + 1 : 961,
		};
	}

	return {
		tabletMin: fc?.tabletMin || 481,
		desktopMin: fc?.desktopMin || 961,
	};
};

/**
 * Generate a unique block ID.
 * @returns {string}
 */
export const generateBlockId = () => {
	return 'fc-' + Math.random().toString(36).substring(2, 9);
};
