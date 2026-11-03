// Home page FAQ (SPEC.md F3.10–F3.12).
// Single source of truth: the visible FAQ and the FAQPage JSON-LD (F8.4) must both render from this list,
// so keep answers as plain text (no markup).

export interface FaqItem {
	question: string;
	answer: string;
}

export const faq: FaqItem[] = [
	{
		question: 'What is LabForge?',
		answer:
			'LabForge gives training teams and software companies ready-to-use, hands-on cloud lab environments: Azure and AWS sandboxes that launch in the browser.',
	},
	{
		question: 'Which cloud platforms do the labs use?',
		answer: 'Labs run as Azure and AWS sandboxes.',
	},
	{
		question: 'How do learners open a lab?',
		answer: 'Labs launch in the browser.',
	},
	{
		question: "What happens when a lab's time limit ends?",
		answer: 'The lab auto-deletes to control cost.',
	},
	{
		question: 'Who is LabForge for?',
		answer: 'L&D managers, technical trainers, and DevRel teams who run courses, workshops, and product demos.',
	},
	{
		question: 'Is LabForge a real product?',
		answer: 'No. LabForge is a fictional product built as a portfolio project.',
	},
];
