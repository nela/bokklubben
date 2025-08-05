import type { LayoutServerLoad } from './$types';
import * as db from '$lib/server/db/queries';
import type { PublicMember } from '$lib/dto/dto';

export const load: LayoutServerLoad = async ({ locals: { member } }) => {
	const allMembers = await db.fetchMembers().match(
		(res) => res,
		(e) => {
			console.error(e);
			return [] as Array<PublicMember>;
		}
	);
	// books
	// meets
	return {
		allMembers,
		member
	};
};
