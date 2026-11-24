import { error } from '@sveltejs/kit';
import { fetchAdminMembers } from '$lib/server/db/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const members = await fetchAdminMembers();
	if (members.isErr()) {
		console.error(members.error);
		error(500, 'Kunne ikke laste medlemmer.');
	}

	return { members: members.value };
};
