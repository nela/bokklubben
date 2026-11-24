import { error } from '@sveltejs/kit';
import { fetchAdminMeets } from '$lib/server/db/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const meets = await fetchAdminMeets();
	if (meets.isErr()) {
		console.error(meets.error);
		error(500, 'Kunne ikke laste møter.');
	}

	return { meets: meets.value };
};
