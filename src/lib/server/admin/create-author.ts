import { createAuthor } from '$lib/server/db/admin';
import { dbFailure, parseForm } from './form';
import { authorSchema } from './schemas';

/**
 * The `createAuthor` action behind the "Ny forfatter" panel ($lib/components/admin/new-author-sheet),
 * on every page that has the book fields. Saves the author right away, so it can be picked.
 */
export async function createAuthorFromForm(request: Request) {
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
}
