import { render } from 'svelte/server';
import MemberEmail from '$lib/components/member-email.svelte';
import { createHtmlString, sendEmail } from './mail';

/**
 * The "Glemt passord" email, with the link from Better Auth (valid for an hour). Sent through
 * `emailAndPassword.sendResetPassword` in $lib/server/auth.
 */
export function sendPasswordResetEmail(user: { name: string; email: string }, url: string) {
	const firstName = user.name.split(' ')[0] || user.name;
	const { head, body } = render(MemberEmail, {
		props: {
			paragraphs: [
				[`Hei ${firstName},`],
				['Noen, forhåpentligvis du, har bedt om å få velge nytt passord på Bokklubben.'],
				['Lenken virker i én time. Har du ikke bedt om dette, kan du se bort fra e-posten.']
			],
			button: { label: 'Velg nytt passord', url }
		}
	});
	return sendEmail(user.email, 'Nytt passord til Bokklubben', {
		type: 'text/html',
		value: createHtmlString(head, body)
	});
}
