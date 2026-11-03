// Home page hero and final call to action (SPEC.md F3). Copy follows SPEC.md "Product facts" and "Copy rule".

export interface Cta {
	label: string;
	href: string;
}

// Both home page CTAs (SPEC.md D2).
export const pricingCta: Cta = { label: 'View pricing', href: '/pricing' };

export const hero = {
	title: 'Hands-on cloud labs that launch in the browser',
	text: 'Give learners ready-to-use Azure and AWS sandboxes for courses, workshops, and product demos, with nothing to install and nothing left running afterwards.',
};

export const finalCta = {
	title: 'Plan your hands-on labs',
	text: 'Compare the example plans on the pricing page.',
};
