import { error, redirect } from '@sveltejs/kit';
import { AdminRoutes } from '$lib/routes';
import { dbFailure, formFailure, parseForm, parseRecordId } from '$lib/server/admin/form';
import { emailTemplateSchema } from '$lib/server/admin/schemas';
import {
	createEmailTemplate,
	deleteEmailTemplate,
	fetchEmailTemplate,
	updateEmailTemplate
} from '$lib/server/db/admin';
import type { Actions, PageServerLoad } from './$types';

const nameTaken = {
	email_templates_name_unique: { name: ['Det finnes allerede en mal med dette navnet.'] }
};

export const load: PageServerLoad = async ({ params }) => {
	const id = parseRecordId(params.id);
	if (id === null) {
		return { template: null };
	}

	const template = await fetchEmailTemplate(id);
	if (template.isErr()) {
		console.error(template.error);
		error(500, 'Kunne ikke laste malen.');
	}
	if (!template.value) {
		error(404, 'Fant ikke malen.');
	}

	return { template: template.value };
};

/** Creates the template (`id` null) or updates the existing one, then goes back to the list. */
async function save(id: number | null, request: Request) {
	const form = parseForm(await request.formData(), emailTemplateSchema);
	if (form.isErr()) {
		return form.error;
	}

	const { data, values } = form.value;
	const saved = await (id === null ? createEmailTemplate(data) : updateEmailTemplate(id, data));
	if (saved.isErr()) {
		return dbFailure(values, saved.error, nameTaken);
	}

	redirect(303, AdminRoutes.EMAILS);
}

export const actions: Actions = {
	/** `/admin/emails/new`. */
	create: async ({ params, request }) => {
		if (parseRecordId(params.id) !== null) {
			error(400, 'Malen finnes allerede.');
		}
		return save(null, request);
	},

	/** `/admin/emails/<id>`. */
	update: async ({ params, request }) => {
		const id = parseRecordId(params.id);
		if (id === null) {
			error(400, 'Malen er ikke lagret.');
		}
		return save(id, request);
	},

	delete: async ({ params }) => {
		const id = parseRecordId(params.id);
		if (id === null) {
			error(400, 'Malen er ikke lagret.');
		}

		const deleted = await deleteEmailTemplate(id);
		if (deleted.isErr()) {
			console.error(deleted.error);
			return formFailure({}, { form: ['Kunne ikke slette malen.'] }, 500);
		}

		redirect(303, AdminRoutes.EMAILS);
	}
};
