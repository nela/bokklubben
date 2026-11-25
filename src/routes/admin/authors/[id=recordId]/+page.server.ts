import { error, redirect } from '@sveltejs/kit';
import { AdminRoutes } from '$lib/routes';
import { dbFailure, formFailure, parseForm, parseRecordId } from '$lib/server/admin/form';
import { authorSchema } from '$lib/server/admin/schemas';
import { createAuthor, deleteAuthor, fetchAdminAuthor, updateAuthor } from '$lib/server/db/admin';
import type { Actions, PageServerLoad } from './$types';

const nameTaken = {
	authors_slug_unique: { name: ['Det finnes allerede en forfatter med dette navnet.'] }
};

export const load: PageServerLoad = async ({ params }) => {
	const id = parseRecordId(params.id);
	if (id === null) {
		return { author: null };
	}

	const author = await fetchAdminAuthor(id);
	if (author.isErr()) {
		console.error(author.error);
		error(500, 'Kunne ikke laste forfatteren.');
	}
	if (!author.value) {
		error(404, 'Fant ikke forfatteren.');
	}

	return { author: author.value };
};

/** Creates the author (`id` null) or updates the existing one, then goes back to the list. */
async function save(id: number | null, request: Request) {
	const form = parseForm(await request.formData(), authorSchema);
	if (form.isErr()) {
		return form.error;
	}

	const { data, values } = form.value;
	const saved = await (id === null ? createAuthor(data) : updateAuthor(id, data));
	if (saved.isErr()) {
		return dbFailure(values, saved.error, nameTaken);
	}

	redirect(303, AdminRoutes.AUTHORS);
}

export const actions: Actions = {
	/** `/admin/authors/new`. */
	create: async ({ params, request }) => {
		if (parseRecordId(params.id) !== null) {
			error(400, 'Forfatteren finnes allerede.');
		}
		return save(null, request);
	},

	/** `/admin/authors/<id>`. */
	update: async ({ params, request }) => {
		const id = parseRecordId(params.id);
		if (id === null) {
			error(400, 'Forfatteren er ikke lagret.');
		}
		return save(id, request);
	},

	delete: async ({ params }) => {
		const id = parseRecordId(params.id);
		if (id === null) {
			error(400, 'Forfatteren er ikke lagret.');
		}

		const deleted = await deleteAuthor(id);
		if (deleted.isErr()) {
			console.error(deleted.error);
			return formFailure({}, { form: ['Kunne ikke slette forfatteren.'] }, 500);
		}

		redirect(303, AdminRoutes.AUTHORS);
	}
};
