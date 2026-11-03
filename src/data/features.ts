// Home page features (SPEC.md F3.4, F3.5). Copy must stay within SPEC.md "Product facts".

export interface Feature {
	title: string;
	description: string;
}

export const features: Feature[] = [
	{
		title: 'Ready-to-use environments',
		description: 'Hands-on cloud lab environments are ready to use.',
	},
	{
		title: 'Azure and AWS sandboxes',
		description: 'Labs run as Azure and AWS sandbox environments.',
	},
	{
		title: 'Launch in the browser',
		description: 'Labs launch in the browser.',
	},
	{
		title: 'Auto-delete after a time limit',
		description: 'Labs auto-delete after a time limit to control cost.',
	},
	{
		title: 'For courses, workshops, and demos',
		description: 'Use labs for courses, workshops, and product demos.',
	},
];
