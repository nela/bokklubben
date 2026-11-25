import { fail, redirect, type Actions } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { fromPromise } from 'neverthrow';
import { auth } from '$lib/server/auth';
import { validators } from '$lib/utils/helpers';
import type { PageServerLoad } from './$types';

/**
 * "Glemt passord". Without `?token`: ask for the email and send a link. The link goes through
 * Better Auth's /api/auth/reset-password/<token>, which comes back here with `?token=…` (or
 * `?error=INVALID_TOKEN` if it has expired): then choose the new password.
 */
export const load: PageServerLoad = ({ url }) => ({
	token: url.searchParams.get('token'),
	expired: url.searchParams.get('error') === 'INVALID_TOKEN'
});

export const actions: Actions = {
	request: async ({ request }) => {
		const email = String((await request.formData()).get('email') ?? '')
			.trim()
			.toLowerCase();
		if (!validators.parseEmail(email)) {
			return fail(400, { requested: false, email, message: 'Ugyldig e-post.' });
		}

		// Answers the same whether or not the email belongs to a member, so it can't be used to
		// find out who is one.
		const result = await fromPromise(
			auth.api.requestPasswordReset({
				body: { email, redirectTo: '/auth/reset' },
				headers: request.headers
			}),
			(e) => e
		);
		if (result.isErr()) {
			console.error(result.error);
		}

		return { requested: true, email };
	},

	reset: async ({ request }) => {
		const formData = await request.formData();
		const token = String(formData.get('token') ?? '');
		const password = String(formData.get('password') ?? '');
		const confirm = String(formData.get('confirm') ?? '');

		if (password.length < 8) {
			return fail(400, { message: 'Passordet må være minst 8 tegn langt.' });
		}
		if (password !== confirm) {
			return fail(400, { message: 'Passordene er ikke like.' });
		}

		const result = await fromPromise(
			auth.api.resetPassword({ body: { newPassword: password, token } }),
			(e) => e
		);
		if (result.isErr()) {
			if (result.error instanceof APIError && result.error.status === 'BAD_REQUEST') {
				return fail(400, { message: 'Lenken er utløpt eller allerede brukt. Be om en ny.' });
			}
			console.error(result.error);
			return fail(500, { message: 'Kunne ikke endre passordet. Prøv igjen.' });
		}

		redirect(303, '/auth?reset=done');
	}
};
