import { NO_REPLY_EMAIL, SENDGRID_TOKEN, SENDGRID_URL } from './config';

export interface EmailContent {
	value: string;
	type: 'text/plain' | 'text/html';
}

export async function sendEmail(
	sendTo: string | Array<string>,
	subject: string,
	content: EmailContent
) {
	let res: Response | undefined = undefined;
	try {
		res = await fetch(SENDGRID_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${SENDGRID_TOKEN}`
			},
			body: JSON.stringify({
				from: {
					email: NO_REPLY_EMAIL
				},
				subject: subject,
				content: [content],
				personalizations: (Array.isArray(sendTo) ? sendTo : [sendTo]).map((e) => ({
					to: [{ email: e }]
				}))
			})
		});
	} catch (error) {
		console.error(error);
	}

	return res?.ok ?? false;
}
