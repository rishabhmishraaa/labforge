// Home page "How it works" steps (SPEC.md F3.6). Copy must stay within SPEC.md "Product facts".

export interface Step {
	title: string;
	description: string;
}

export const steps: Step[] = [
	{
		title: 'Get a ready-to-use lab',
		description: 'LabForge provides a hands-on Azure or AWS sandbox environment.',
	},
	{
		title: 'Launch it in the browser',
		description: 'The lab launches in the browser.',
	},
	{
		title: 'Let it clean up',
		description: 'The lab auto-deletes after its time limit to control cost.',
	},
];
