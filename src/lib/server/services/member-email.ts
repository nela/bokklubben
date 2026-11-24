import { render } from 'svelte/server';
import MemberEmail from '$lib/components/member-email.svelte';
import type { EmailPlaceholder } from '$lib/email-placeholders';
import { createHtmlString, sendEmail } from './mail';

interface Recipient {
	firstName: string;
	lastName: string;
	email: string;
}

/** Replaces `{fornavn}` and the other placeholders; unknown ones are left as they are. */
export function fillPlaceholders(text: string, recipient: Recipient): string {
	const values: Record<EmailPlaceholder, string> = {
		fornavn: recipient.firstName,
		etternavn: recipient.lastName,
		epost: recipient.email
	};
	return text.replace(/\{(\w+)\}/g, (match, name: string) =>
		name in values ? values[name as EmailPlaceholder] : match
	);
}

/** A blank line starts a new paragraph; single line breaks are kept within it. */
export function toParagraphs(text: string): Array<Array<string>> {
	return text
		.split(/\r?\n\s*\r?\n/)
		.map((paragraph) =>
			paragraph
				.trim()
				.split(/\r?\n/)
				.map((line) => line.trim())
		)
		.filter((lines) => lines.some(Boolean));
}

/** Sends a written email (subject and text with placeholders) to one member. */
export function sendMemberEmail(recipient: Recipient, email: { subject: string; body: string }) {
	const { head, body } = render(MemberEmail, {
		props: { paragraphs: toParagraphs(fillPlaceholders(email.body, recipient)) }
	});
	return sendEmail(recipient.email, fillPlaceholders(email.subject, recipient), {
		type: 'text/html',
		value: createHtmlString(head, body)
	});
}
