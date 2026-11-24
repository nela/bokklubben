import type { FormValues, SendEmailResult } from '$lib/dto/admin';
import { createEmailTemplate } from '$lib/server/db/admin';
import { sendMemberEmail } from '$lib/server/services/member-email';
import { dbFailure, formFailure } from './form';
import type { SendEmailInput } from './schemas';

interface Recipient {
	firstName: string;
	lastName: string;
	email: string;
}

const SIMULTANEOUS_SENDS = 5;

/**
 * Sends the email from the "Send e-post" panel to each recipient on their own, so placeholders
 * are filled in per member and nobody sees the others' addresses. Can first save the email as a
 * new template (unfilled). Fails only if nothing could be sent, or the template name is taken.
 */
export async function sendEmailToMembers(
	email: SendEmailInput,
	values: FormValues,
	recipients: Array<Recipient>
) {
	let savedTemplate: SendEmailResult['savedTemplate'] = null;
	if (email.saveAsTemplate && email.templateName) {
		const name = email.templateName;
		const created = await createEmailTemplate({ name, subject: email.subject, body: email.body });
		if (created.isErr()) {
			return dbFailure(values, created.error, {
				email_templates_name_unique: {
					templateName: ['Det finnes allerede en mal med dette navnet.']
				}
			});
		}
		savedTemplate = { id: created.value, name };
	}

	const result: SendEmailResult = { sent: [], failed: [], savedTemplate };
	for (let i = 0; i < recipients.length; i += SIMULTANEOUS_SENDS) {
		const batch = recipients.slice(i, i + SIMULTANEOUS_SENDS);
		const outcomes = await Promise.all(batch.map((r) => sendMemberEmail(r, email)));
		outcomes.forEach((outcome, j) => {
			const { firstName, lastName } = batch[j];
			if (outcome.isErr()) {
				console.error(outcome.error);
				result.failed.push(`${firstName} ${lastName}`);
			} else {
				result.sent.push(`${firstName} ${lastName}`);
			}
		});
	}

	if (result.sent.length === 0) {
		const saved = savedTemplate ? ` Malen «${savedTemplate.name}» ble lagret.` : '';
		return formFailure(values, { form: [`Kunne ikke sende e-posten.${saved}`] }, 502);
	}
	return result;
}
