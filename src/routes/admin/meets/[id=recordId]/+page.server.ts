import { error, redirect } from '@sveltejs/kit';
import { okAsync, ResultAsync } from 'neverthrow';
import { AdminRoutes } from '$lib/routes';
import { dbFailure, formFailure, parseForm, parseRecordId } from '$lib/server/admin/form';
import { authorSchema, meetSchema } from '$lib/server/admin/schemas';
import {
	createAuthor,
	deleteMeet,
	fetchAdminMeet,
	fetchAuthorNames,
	fetchGenres,
	fetchLanguages,
	fetchMemberOptions,
	saveMeet
} from '$lib/server/db/admin';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseRecordId(params.id);

	const result = await ResultAsync.combine([
		id === null ? okAsync(null) : fetchAdminMeet(id),
		fetchMemberOptions(),
		fetchGenres(),
		fetchLanguages(),
		fetchAuthorNames()
	]);
	if (result.isErr()) {
		console.error(result.error);
		error(500, 'Kunne ikke laste møtet.');
	}

	const [meet, members, genres, languages, authorNames] = result.value;
	if (id !== null && !meet) {
		error(404, 'Fant ikke møtet.');
	}

	return { meet, members, genres, languages, authorNames };
};

/** Creates the meet (`id` null) or updates the existing one, then goes back to the list. */
async function save(id: number | null, request: Request) {
	const form = parseForm(await request.formData(), meetSchema);
	if (form.isErr()) {
		return form.error;
	}

	const { data, values } = form.value;
	const saved = await saveMeet(id, data);
	if (saved.isErr()) {
		return dbFailure(values, saved.error, {
			books_slug_unique: { bookTitle: ['Det finnes allerede en bok med denne tittelen.'] },
			books_isbn_unique: { bookIsbn: ['Det finnes allerede en bok med dette ISBN-nummeret.'] }
		});
	}

	redirect(303, AdminRoutes.MEETS);
}

export const actions: Actions = {
	/** `/admin/meets/new`. */
	create: async ({ params, request }) => {
		if (parseRecordId(params.id) !== null) {
			error(400, 'Møtet finnes allerede.');
		}
		return save(null, request);
	},

	/** `/admin/meets/<id>`: updates the existing meet, including what happened at it. */
	update: async ({ params, request }) => {
		const id = parseRecordId(params.id);
		if (id === null) {
			error(400, 'Møtet er ikke lagret.');
		}
		return save(id, request);
	},

	/** From the "new author" panel. Saved right away, so it can be picked for the book. */
	createAuthor: async ({ request }) => {
		const form = parseForm(await request.formData(), authorSchema);
		if (form.isErr()) {
			return form.error;
		}

		const { data, values } = form.value;
		const created = await createAuthor(data);
		if (created.isErr()) {
			return dbFailure(values, created.error, {
				authors_slug_unique: { name: ['Det finnes allerede en forfatter med dette navnet.'] }
			});
		}

		return { author: created.value };
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
