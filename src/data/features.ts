// Home page features (SPEC.md F3.4, F3.5). Copy follows SPEC.md "Product facts" and "Copy rule".
// Each item covers a different consequence of the facts; don't repeat what steps, FAQ, or testimonials say.

export interface Feature {
	title: string;
	description: string;
}

export const features: Feature[] = [
	{
		title: 'Hands-on practice, not slides',
		description: 'Learners work in a real cloud environment instead of watching someone else use one.',
	},
	{
		title: 'Separate from your own accounts',
		description: 'Labs run in Azure and AWS sandboxes, so practice never touches your production cloud accounts.',
	},
	{
		title: 'Nothing to install',
		description: "Labs open in the browser, so learners don't install tools or set up a local environment.",
	},
	{
		title: 'Auto-delete after a time limit',
		description: "When a lab's time is up, it is removed, so forgotten resources never run up a bill.",
	},
	{
		title: 'Courses, workshops, and product demos',
		description: 'Use the same kind of lab for a structured course, a live workshop, or a demo of your own product.',
	},
];
