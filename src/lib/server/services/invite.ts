import { render } from 'svelte/server';
import InvitationEmail from '$lib/components/invitation-email.svelte';
import { createHtmlString, sendEmail } from './mail';

/** Emails one person the invitation to sign up at bokklubben.eu. */
export function sendInvite(email: string) {
	const { head, body } = render(InvitationEmail);
	return sendEmail(email, 'Invitasjon til Bokklubben', {
		type: 'text/html',
		value: createHtmlString(head, body)
	});
}
