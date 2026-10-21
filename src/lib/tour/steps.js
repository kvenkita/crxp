/**
 * The guided tour, as data. Each step:
 *   id        unique key
 *   route     page the step belongs on (with trailing slash, without the base path); null = the page
 *             the tour started from (Home, or the map that carolinasexplorer.com/map embeds)
 *   page      short page name, shown while the tour is opening that page (for route null, Tour.svelte
 *             names the starting page instead)
 *   target    data-tour value of the element to spotlight; omitted = centered card
 *   placement preferred side for the card: 'right' | 'left' | 'bottom' | 'top' | 'center'
 *   ready     selector that must exist before the step's actions run (the Explore page sets
 *             data-tour-ready once it has loaded)
 *   action    live-demo action name in demo.js
 *   ui        Explore panels to open or close: { controls?, trend?, legend? } (phones only; on desktop
 *             these panels are always shown)
 *   mobileCenter  on phones, show as a centered card without a spotlight
 *   title, body   card text
 */
import { DEMO } from './demo-config.js';

/**
 * @typedef {{
 *   id: string, route: string | null, page: string, target?: string,
 *   placement: 'right' | 'left' | 'bottom' | 'top' | 'center', ready?: string,
 *   action?: 'base' | 'sample' | 'bivariate' | 'clusters' | 'explore',
 *   ui?: { controls?: boolean, trend?: boolean, legend?: boolean },
 *   mobileCenter?: boolean, title: string, body: string
 * }} Step
 */

const EXPLORE_READY = '[data-tour-ready]';

/** @type {Step[]} */
export const STEPS = [
	{
		id: 'welcome',
		route: null,
		page: 'Start',
		placement: 'center',
		title: 'Welcome to the Carolinas Regional Explorer',
		body: 'Quality-of-life indicators for every Census tract in the 14-county Charlotte region. This tour takes about three minutes, and you can close it at any time.'
	},
	{
		id: 'map',
		route: '/explore/',
		page: 'Explore',
		ready: EXPLORE_READY,
		target: 'map',
		placement: 'center',
		action: 'base',
		ui: { controls: false, trend: false, legend: false },
		title: 'The map',
		body: 'Each shape is a Census tract, shaded by the selected indicator. Here it is the poverty rate: darker tracts have more of the measure.'
	},
	{
		id: 'indicator-browser',
		route: '/explore/',
		page: 'Explore',
		ready: EXPLORE_READY,
		target: 'indicator-browser',
		placement: 'right',
		ui: { controls: true },
		title: 'Pick an indicator',
		body: 'Browse 68 measures by theme or search by name. "About this indicator" below explains what it means and where it comes from.'
	},
	{
		id: 'year-slider',
		route: '/explore/',
		page: 'Explore',
		ready: EXPLORE_READY,
		target: 'year-slider',
		placement: 'top',
		ui: { controls: false },
		title: 'Move through time',
		body: 'Drag the slider to see other years. Each indicator offers only the years it has data for.'
	},
	{
		id: 'legend',
		route: '/explore/',
		page: 'Explore',
		ready: EXPLORE_READY,
		target: 'legend',
		placement: 'left',
		ui: { controls: false, legend: true },
		title: 'Read the colors',
		body: 'The legend shows the range each color covers. Hover over a class to highlight those tracts, or click it to keep them highlighted.'
	},
	{
		id: 'geo-level',
		route: '/explore/',
		page: 'Explore',
		ready: EXPLORE_READY,
		target: 'geo-level',
		placement: 'right',
		ui: { controls: true, legend: false },
		title: 'Tracts or counties',
		body: 'Switch between neighborhood-sized Census tracts and whole counties.'
	},
	{
		id: 'search',
		route: '/explore/',
		page: 'Explore',
		ready: EXPLORE_READY,
		target: 'search',
		placement: 'bottom',
		ui: { controls: false },
		title: 'Find a place',
		body: 'Search for a tract, county, city, or neighborhood by name, or type an address to find the tract it is in.'
	},
	{
		id: 'trend',
		route: '/explore/',
		page: 'Explore',
		ready: EXPLORE_READY,
		target: 'trend',
		placement: 'left',
		action: 'sample',
		ui: { controls: false, trend: true },
		title: 'Select an area',
		body: 'Click a tract to see its trend next to its county and the region. The shaded band is the margin of error, and the change markers say whether a change over time is statistically significant.'
	},
	{
		id: 'generate-report',
		route: '/explore/',
		page: 'Explore',
		ready: EXPLORE_READY,
		target: 'generate-report',
		placement: 'left',
		ui: { trend: true },
		title: 'Build a report',
		body: 'Select one or more tracts, then generate a printable report that covers every indicator for that area.'
	},
	{
		id: 'mode-bar',
		route: '/explore/',
		page: 'Explore',
		ready: EXPLORE_READY,
		target: 'mode-bar',
		placement: 'right',
		ui: { controls: true, trend: false },
		title: 'Three ways to analyze',
		body: 'Explore one indicator, compare two at once, or find spatial clusters.'
	},
	{
		id: 'bivariate',
		route: '/explore/',
		page: 'Explore',
		ready: EXPLORE_READY,
		target: 'bivariate-panel',
		placement: 'right',
		action: 'bivariate',
		ui: { controls: true, trend: true },
		mobileCenter: true,
		title: 'Compare two indicators',
		body: 'Here, poverty against the share of adults with a bachelor\'s degree. The map colors each tract by both measures, and the scatter shows how they move together. A correlation does not show that one causes the other.'
	},
	{
		id: 'clusters',
		route: '/explore/',
		page: 'Explore',
		ready: EXPLORE_READY,
		target: 'lisa-panel',
		placement: 'right',
		action: 'clusters',
		ui: { controls: true, trend: false },
		title: 'Hot and cold spots',
		body: 'Spatial clusters show where high or low values group together more than chance would produce, after adjusting for the number of tracts tested.'
	},
	{
		id: 'map-settings',
		route: '/explore/',
		page: 'Explore',
		ready: EXPLORE_READY,
		target: 'map-settings',
		placement: 'bottom',
		action: 'explore',
		ui: { controls: false },
		mobileCenter: true,
		title: 'Map settings',
		body: 'Change the basemap, adjust the transparency, or hatch the tracts whose estimates are unreliable.'
	},
	{
		id: 'share',
		route: '/explore/',
		page: 'Explore',
		ready: EXPLORE_READY,
		target: 'share',
		placement: 'right',
		ui: { controls: true },
		title: 'Share what you see',
		body: 'Copy a link to this exact view, or embed the map on another website.'
	},
	{
		id: 'indicator-list',
		route: '/indicators/',
		page: 'Indicators',
		target: 'indicator-list',
		placement: 'bottom',
		title: 'Every indicator, explained',
		body: 'Indicators are grouped by quality-of-life dimension. Each one has its own page with its definition and source.'
	},
	{
		id: 'indicator-page',
		route: `/indicators/${DEMO.indicatorSlug}/`,
		page: 'Poverty rate',
		target: 'indicator-why',
		placement: 'bottom',
		title: 'One page per indicator',
		body: 'Why the measure matters, how it is calculated, how the region compares, and related measures.'
	},
	{
		id: 'county-switcher',
		route: `/county/${DEMO.county}/`,
		page: 'Mecklenburg County',
		target: 'county-switcher',
		placement: 'bottom',
		title: 'County profiles',
		body: 'Pick any of the 14 counties for a ready-made profile.'
	},
	{
		id: 'metric-cards',
		route: `/county/${DEMO.county}/`,
		page: 'Mecklenburg County',
		target: 'metric-cards',
		placement: 'top',
		title: 'The county at a glance',
		body: 'Each card shows the county\'s latest value, the region\'s value, and a trend line. Use Share above to send the profile to someone.'
	},
	{
		id: 'report',
		route: `/report/?tracts=${DEMO.reportTracts.join(',')}&geo=tract`,
		page: 'Custom area report',
		target: 'report-summary',
		placement: 'bottom',
		title: 'Custom area reports',
		body: 'This is the report built from selected tracts: every indicator for your area, averaged across its tracts, next to the region. Print it or save it as a PDF.'
	},
	{
		id: 'methods',
		route: '/methods/',
		page: 'Methods',
		target: 'methods-links',
		placement: 'top',
		title: 'How the data is made',
		body: 'The Methods page explains the sources, margins of error, and comparisons over time, and links to the methodology guide, the working paper, and the code.'
	},
	{
		id: 'data',
		route: '/data/',
		page: 'Data',
		target: 'data-downloads',
		placement: 'bottom',
		title: 'Download the data',
		body: 'Download any indicator as CSV or JSON, or everything in one archive.'
	},
	{
		id: 'done',
		route: null,
		page: 'Start',
		placement: 'center',
		title: "You're ready",
		body: 'Start exploring. You can take this tour again any time with the "Take a tour" button on the map.'
	}
];
