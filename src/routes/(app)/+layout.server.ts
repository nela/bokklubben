import { PublicRoute } from '$lib/utils/constants';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return redirect(303, PublicRoute.Login);
	}

	return {
		user: locals.user
	};
};
