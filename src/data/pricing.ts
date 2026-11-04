// Pricing plans (SPEC.md F4, decision D1). Values match the "Example pricing" table in SPEC.md Site facts.
// Single source of truth: the /pricing page and the SoftwareApplication `offers` JSON-LD (F8.3) both render from this file.
// Limits are numbers so F8 can use them directly; `null` means the plan has custom limits.

export interface Plan {
	id: 'starter' | 'team' | 'enterprise';
	name: string;
	/** USD per month. `null` = no fixed price ("Contact us"); F8 omits such plans from `offers`. */
	monthlyPriceUsd: number | null;
	/** Learners who can have a lab running at the same time. */
	seats: number | null;
	labHoursPerMonth: number | null;
	maxLabHours: number | null;
	/** Visible badge text. Only one plan is highlighted (F4.4). */
	highlight?: string;
}

export const plans: Plan[] = [
	{ id: 'starter', name: 'Starter', monthlyPriceUsd: 49, seats: 5, labHoursPerMonth: 50, maxLabHours: 2 },
	{
		id: 'team',
		name: 'Team',
		monthlyPriceUsd: 199,
		seats: 25,
		labHoursPerMonth: 300,
		maxLabHours: 8,
		highlight: 'Most popular',
	},
	{ id: 'enterprise', name: 'Enterprise', monthlyPriceUsd: null, seats: null, labHoursPerMonth: null, maxLabHours: null },
];

export const pricingIntro =
	'Plans differ in how many learners can have a lab running at the same time, how many lab hours you get each month, and how long a single lab can run.';

export const pricingNotice = 'Example pricing for a fictional product. Prices are in USD.';

export const seatNote = 'A seat is one learner with a lab running at the same time.';

export const includedInEveryPlan = ['Azure and AWS sandboxes', 'Labs auto-delete after the time limit'];

export function formatPrice(plan: Plan): string {
	return plan.monthlyPriceUsd === null ? 'Contact us' : `$${plan.monthlyPriceUsd}/month`;
}

/** The plan's list items, in display order: its three limits, then what every plan includes. */
export function planItems(plan: Plan): string[] {
	return [
		plan.seats === null ? 'Custom seats' : `${plan.seats} seats`,
		plan.labHoursPerMonth === null ? 'Custom lab hours per month' : `${plan.labHoursPerMonth} lab hours per month`,
		plan.maxLabHours === null ? 'Custom max lab duration' : `${plan.maxLabHours}-hour max lab duration`,
		...includedInEveryPlan,
	];
}
