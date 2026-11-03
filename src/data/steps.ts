// Home page "How it works" steps (SPEC.md F3.6): before, during, and after a session.
// Copy follows SPEC.md "Product facts" and "Copy rule".

export interface Step {
	title: string;
	description: string;
}

export const steps: Step[] = [
	{
		title: 'Before: nothing to build',
		description: "The Azure or AWS sandbox is ready to use, so trainers don't prepare environments ahead of time.",
	},
	{
		title: 'During: start right away',
		description: 'Learners open the lab in their browser and spend the session on the exercise itself.',
	},
	{
		title: 'After: no cleanup',
		description: 'The lab deletes itself when its time limit ends, so nobody has to remember to shut it down.',
	},
];
