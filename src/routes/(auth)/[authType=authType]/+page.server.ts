import type { UserInvitationDto } from '$lib/dto/dto';
import { fetchInvitationByParam } from '$lib/server/db/queries';
import { redirect } from '@sveltejs/kit';
import { err } from 'neverthrow';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, params }) => {
	if (params.authType === 'signin') {
		return;
	}

	const seed = url.searchParams.get('s');

	if (!seed) {
		throw redirect(301, '/signin');
	}

	return fetchInvitationByParam({ key: 'seed', value: seed })
		.map((r) =>
			new Date().getTime() > new Date(r.expiresAt).getTime()
				? ({
						email: r.email,
						username: `${r.firstName} ${r.lastName}`
					} as UserInvitationDto)
				: err()
		)
		.match(
			(r) => ({ ...(r as UserInvitationDto) }),
			() => {
				throw redirect(301, '/signin');
			}
		);
};
