import { errAsync, fromPromise, okAsync, type ResultAsync } from 'neverthrow';
import { SMTP2GO_API_KEY, SMTP2GO_URL, SOURCE_EMAIL } from '$env/static/private';
import { EmailInternalError, type EmailError } from '$lib/errors/mail';

export interface EmailContent {
	value: string;
	type: 'text/plain' | 'text/html';
}

export function createHtmlString(head: string, body: string) {
	return (
		'<html>' +
		`<head><meta http-equiv="Content-Type" content="text/html charset=UTF-8"/>${head}</head>` +
		`<body>${body}</body>` +
		'</html>'
	);
}

/**
 * Sends an email through SMTP2GO's API (https://developers.smtp2go.com/reference/send-standard-email).
 * Fails if the request fails or SMTP2GO doesn't accept it.
 */
export function sendEmail(
	recipients: string | Array<string>,
	subject: string,
	content: EmailContent
): ResultAsync<void, EmailError> {
	return fromPromise(
		fetch(SMTP2GO_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				accept: 'application/json',
				'X-Smtp2go-Api-Key': SMTP2GO_API_KEY
			},
			body: JSON.stringify({
				sender: SOURCE_EMAIL,
				to: Array.isArray(recipients) ? recipients : [recipients],
				subject,
				[content.type === 'text/html' ? 'html_body' : 'text_body']: content.value
			})
		}),
		(e) => new EmailInternalError({ cause: e })
	).andThen((res) =>
		res.ok
			? okAsync(undefined)
			: errAsync(new EmailInternalError({ cause: new Error(`SMTP2GO answered ${res.status}`) }))
	);
}
