// Home page hero and final call to action (SPEC.md F3). Copy must stay within SPEC.md "Product facts".

export interface Cta {
	label: string;
	href: string;
}

// Both home page CTAs (SPEC.md D2).
export const pricingCta: Cta = { label: 'View pricing', href: '/pricing' };

export const hero = {
	title: 'Hands-on cloud labs that launch in the browser',
	text: 'LabForge gives training teams and software companies ready-to-use Azure and AWS sandbox environments for courses, workshops, and product demos.',
};

export const finalCta = {
	title: 'Plan your hands-on labs',
	text: 'Compare the example plans on the pricing page.',
};
