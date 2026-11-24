import { error, redirect } from '@sveltejs/kit';
import { okAsync, ResultAsync } from 'neverthrow';
import { AdminRoutes } from '$lib/routes';
import { dbFailure, formFailure, parseForm, parseRecordId } from '$lib/server/admin/form';
import { meetSchema } from '$lib/server/admin/schemas';
import {
	createMeet,
	deleteMeet,
	fetchAdminMeet,
	fetchMemberOptions,
	updateMeet
} from '$lib/server/db/admin';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseRecordId(params.id);

	const result = await ResultAsync.combine([
		id === null ? okAsync(null) : fetchAdminMeet(id),
		fetchMemberOptions()
	]);
	if (result.isErr()) {
		console.error(result.error);
		error(500, 'Kunne ikke laste møtet.');
	}

	const [meet, members] = result.value;
	if (id !== null && !meet) {
		error(404, 'Fant ikke møtet.');
	}

	return { meet, members };
};

export const actions: Actions = {
	save: async ({ params, request }) => {
		const form = parseForm(await request.formData(), meetSchema);
		if (form.isErr()) {
			return form.error;
		}

		const { data, values } = form.value;
		const id = parseRecordId(params.id);
		const saved = await (id === null ? createMeet(data) : updateMeet(id, data));
		if (saved.isErr()) {
			return dbFailure(values, saved.error);
		}

		redirect(303, AdminRoutes.MEETS);
	},

	delete: async ({ params }) => {
		const id = parseRecordId(params.id);
		if (id === null) {
			error(400, 'Møtet er ikke lagret.');
		}

		const deleted = await deleteMeet(id);
		if (deleted.isErr()) {
			console.error(deleted.error);
			return formFailure({}, { form: ['Kunne ikke slette møtet.'] }, 500);
		}

		redirect(303, AdminRoutes.MEETS);
	}
};
