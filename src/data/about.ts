// About page copy (SPEC.md F5.1–F5.3). Copy follows SPEC.md "Product facts" and "Copy rule".
// No team members, people, founding dates, funding or locations: none are in the product facts (F5.3).

export interface AboutSection {
	title: string;
	text: string;
}

export interface Audience {
	title: string;
	text: string;
}

export const aboutIntro =
	'LabForge gives training teams and software companies ready-to-use, hands-on cloud lab environments: Azure and AWS sandboxes that launch in the browser. Teams use them for courses, workshops, and product demos.';

export const audiencesTitle = "Who it's for";

export const audiences: Audience[] = [
	{
		title: 'L&D managers',
		text: 'Add hands-on cloud practice to training programs without asking each learner to set up their own cloud account.',
	},
	{
		title: 'Technical trainers',
		text: 'Run courses and workshops where learners open a ready-to-use lab in the browser instead of installing tools first.',
	},
	{
		title: 'DevRel teams',
		text: 'Give workshop attendees and demo audiences a sandbox to try your product in, with nothing for them to install.',
	},
];

export const aboutSections: AboutSection[] = [
	{
		title: 'Why labs delete themselves',
		text: 'Every lab is deleted automatically after its time limit. That keeps cloud costs under control, because no forgotten resources are left running after a session.',
	},
	{
		title: 'A fictional product',
		text: 'LabForge is a fictional product built as a portfolio project. There is nothing to sign up for.',
	},
];
