// Home page testimonials (SPEC.md F3.7–F3.9). These are fictional placeholders, not real people or companies.

export interface Testimonial {
	quote: string;
	name: string;
	role: string;
}

export const testimonialNotice = 'These testimonials are fictional placeholders. LabForge is a fictional product.';

export const testimonials: Testimonial[] = [
	{
		quote: 'Our course participants get ready-to-use Azure and AWS labs in the browser.',
		name: 'Alex Example',
		role: 'L&D manager',
	},
	{
		quote: 'Workshop labs auto-delete after the time limit, so there is nothing left running afterwards.',
		name: 'Sam Placeholder',
		role: 'Technical trainer',
	},
	{
		quote: 'We run product demos in labs that launch in the browser.',
		name: 'Jordan Sample',
		role: 'DevRel lead',
	},
];
