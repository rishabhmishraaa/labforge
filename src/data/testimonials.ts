// Home page testimonials (SPEC.md F3.7–F3.9). These are fictional placeholders, not real people or companies.
// Each one speaks from its role's point of view. Copy follows SPEC.md "Product facts" and "Copy rule".

export interface Testimonial {
	quote: string;
	name: string;
	role: string;
}

export const testimonialNotice = 'These testimonials are fictional placeholders. LabForge is a fictional product.';

export const testimonials: Testimonial[] = [
	{
		quote: 'We can offer hands-on cloud training without asking every team to set up its own cloud accounts.',
		name: 'Alex Example',
		role: 'L&D manager',
	},
	{
		quote: 'My workshops start with the material, not with a round of installation troubleshooting.',
		name: 'Sam Placeholder',
		role: 'Technical trainer',
	},
	{
		quote: 'At product demos, people try our software in a live cloud environment instead of watching me click through it.',
		name: 'Jordan Sample',
		role: 'DevRel lead',
	},
];
