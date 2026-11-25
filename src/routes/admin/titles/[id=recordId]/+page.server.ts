import { error, redirect } from '@sveltejs/kit';
import { AdminRoutes } from '$lib/routes';
import { dbFailure, formFailure, parseForm, parseRecordId } from '$lib/server/admin/form';
import { clubTitleSchema } from '$lib/server/admin/schemas';
import {
	createClubTitle,
	deleteClubTitle,
	fetchAdminClubTitle,
	updateClubTitle
} from '$lib/server/db/admin';
import type { Actions, PageServerLoad } from './$types';

const nameTaken = { name: ['Det finnes allerede en tittel med dette navnet.'] };

export const load: PageServerLoad = async ({ params }) => {
	const id = parseRecordId(params.id);
	if (id === null) {
		return { title: null };
	}

	const title = await fetchAdminClubTitle(id);
	if (title.isErr()) {
		console.error(title.error);
		error(500, 'Kunne ikke laste tittelen.');
	}
	if (!title.value) {
		error(404, 'Fant ikke tittelen.');
	}

	return { title: title.value };
};

/** Creates the title (`id` null) or renames the existing one, then goes back to the list. */
async function save(id: number | null, request: Request) {
	const form = parseForm(await request.formData(), clubTitleSchema);
	if (form.isErr()) {
		return form.error;
	}

	const { data, values } = form.value;
	const saved = await (id === null ? createClubTitle(data) : updateClubTitle(id, data));
	if (saved.isErr()) {
		return dbFailure(values, saved.error, {
			club_titles_name_unique: nameTaken,
			club_titles_slug_unique: nameTaken
		});
	}

	redirect(303, AdminRoutes.TITLES);
}

export const actions: Actions = {
	/** `/admin/titles/new`. */
	create: async ({ params, request }) => {
		if (parseRecordId(params.id) !== null) {
			error(400, 'Tittelen finnes allerede.');
		}
		return save(null, request);
	},

	/** `/admin/titles/<id>`. */
	update: async ({ params, request }) => {
		const id = parseRecordId(params.id);
		if (id === null) {
			error(400, 'Tittelen er ikke lagret.');
		}
		return save(id, request);
	},

	delete: async ({ params }) => {
		const id = parseRecordId(params.id);
		if (id === null) {
			error(400, 'Tittelen er ikke lagret.');
		}

		const deleted = await deleteClubTitle(id);
		if (deleted.isErr()) {
			console.error(deleted.error);
			return formFailure({}, { form: ['Kunne ikke slette tittelen.'] }, 500);
		}

		redirect(303, AdminRoutes.TITLES);
	}
};
