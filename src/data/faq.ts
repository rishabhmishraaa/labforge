// Home page FAQ (SPEC.md F3.10–F3.12).
// Single source of truth: the visible FAQ and the FAQPage JSON-LD (F8.4) must both render from this list,
// so keep answers as plain text (no markup). Answers are 1–2 full sentences.
// Copy follows SPEC.md "Product facts" and "Copy rule".

export interface FaqItem {
	question: string;
	answer: string;
}

export const faq: FaqItem[] = [
	{
		question: 'What is LabForge?',
		answer:
			'LabForge is a cloud lab service for training teams and software companies. It provides ready-to-use Azure and AWS sandboxes for hands-on practice.',
	},
	{
		question: 'Do learners need their own Azure or AWS account?',
		answer:
			"No. Each lab comes with a ready-to-use sandbox, so learners don't create or configure cloud accounts.",
	},
	{
		question: 'Which cloud platforms are available?',
		answer: 'Labs run on Azure and AWS. Each lab is a sandbox on one of those two platforms.',
	},
	{
		question: 'What happens when the time limit ends?',
		answer:
			'The lab is deleted automatically when its time limit ends. Plan sessions so learners finish their exercises within that window.',
	},
	{
		question: 'Who uses LabForge?',
		answer:
			'L&D managers use it for hands-on training programs, technical trainers use it in courses and workshops, and DevRel teams use it for workshops and product demos.',
	},
	{
		question: 'Is LabForge a real product?',
		answer: 'No. LabForge is a fictional product built as a portfolio project, so there is nothing to sign up for.',
	},
];
