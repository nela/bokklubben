import { redirect } from '@sveltejs/kit';
import { AdminRoutes } from '$lib/routes';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	redirect(307, AdminRoutes.MEETS);
};
