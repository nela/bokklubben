import type { RequestHandler } from './$types';
import { fetchMemberEmails } from '$lib/server/db/queries';
import { error, json } from '@sveltejs/kit';
import { createHtmlString, sendEmail } from '$lib/server/services/mail';
import { render } from 'svelte/server';
import InvitationEmail from '$lib/components/invitation-email.svelte';

export const GET: RequestHandler = async () => {
	const recipients = await fetchMemberEmails().unwrapOr([]);
	if (recipients.length < 1) {
		return json({ success: false, message: 'Found no members to invite.' });
	}

	const renderOutput = render(InvitationEmail);
	const emailContent = createHtmlString(renderOutput.head, renderOutput.body);

	return await sendEmail(recipients, 'Invitasjon til Bokklubben', {
		type: 'text/html',
		value: emailContent
	}).match(
		(r) => {
			console.log(r);
			return json({
				success: true,
				message: 'Sent email to all members'
			});
		},
		(e) => {
			console.error(e);
			return error(500, 'Something went wrong with email dispatch.');
		}
	);
};
