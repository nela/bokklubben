import { fromPromise } from 'neverthrow';
import { EmailInternalError } from '$lib/errors/mail';
import { SMTP2GO_URL, SMTP2GO_API_KEY, SOURCE_EMAIL } from '$env/static/private';
import { json } from '@sveltejs/kit';

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

/* curl --request POST \
     --url https://api.smtp2go.com/v3/email/send \
     --header 'Content-Type: application/json' \
     --header 'X-Smtp2go-Api-Key: api-xxxxxxxxxxxxxxxxxx' \
     --header 'accept: application/json' \
     --data '
{
  "sender": "email@example.com",
  "to": [
    "friend@example.com"
  ],
  "subject": "My First Email",
  "text_body": "Hello from the other side."
}
' */

export function sendEmail(
	recipients: string | Array<string>,
	subject: string,
	content: EmailContent
) {
	return fromPromise(
		fetch(SMTP2GO_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				accept: 'application/json',
				'X-Smtp2go-Api-Key': SMTP2GO_API_KEY
				// Authorization: `Bearer ${SENDGRID_TOKEN}`
			},
			body: JSON.stringify({
				sender: SOURCE_EMAIL,
				subject: subject,
				html_body: content.value,
				// content: [content],
				to: Array.isArray(recipients) ? recipients : [recipients]
				// personalizations: (Array.isArray(recipients) ? recipients : [recipients]).map((e) => ({
				// 	to: [{ email: e }]
				// }))
			})
		}),
		(e) => new EmailInternalError({ cause: e })
	);
}
