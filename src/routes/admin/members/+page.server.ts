import { error } from '@sveltejs/kit';
import { ResultAsync } from 'neverthrow';
import { formFailure, parseForm } from '$lib/server/admin/form';
import { sendBulkEmailSchema } from '$lib/server/admin/schemas';
import { sendEmailToMembers } from '$lib/server/admin/send-email';
import { fetchAdminMembers, fetchEmailRecipients, fetchEmailTemplates } from '$lib/server/db/admin';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const result = await ResultAsync.combine([fetchAdminMembers(), fetchEmailTemplates()]);
	if (result.isErr()) {
		console.error(result.error);
		error(500, 'Kunne ikke laste medlemmer.');
	}

	const [members, emailTemplates] = result.value;
	return { members, emailTemplates };
};

export const actions: Actions = {
	/** From the "Send e-post" panel: sends the email to each chosen member; see `sendEmailToMembers`. */
	sendEmail: async ({ request }) => {
		const form = parseForm(await request.formData(), sendBulkEmailSchema);
		if (form.isErr()) {
			return form.error;
		}
		const { data, values } = form.value;

		const recipients = await fetchEmailRecipients(data.recipientIds);
		if (recipients.isErr()) {
			console.error(recipients.error);
			return formFailure(values, { form: ['Kunne ikke sende e-posten.'] }, 500);
		}
		if (recipients.value.length === 0) {
			return formFailure(values, { recipientIds: ['Fant ingen av mottakerne.'] });
		}

		return sendEmailToMembers(data, values, recipients.value);
	}
};
