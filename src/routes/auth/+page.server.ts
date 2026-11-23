import { fail, redirect, type Actions } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { fromPromise } from 'neverthrow';
import { AuthInternalError } from '$lib/errors/auth';
import { auth } from '$lib/server/auth';
import { fetchMemberByEmail } from '$lib/server/db/queries';
import { validators } from '$lib/utils/helpers';

const providers = ['google', 'microsoft', 'github'] as const;
type Provider = (typeof providers)[number];

const isProvider = (value: unknown): value is Provider =>
	providers.includes(value as Provider);

export const actions: Actions = {
	password: async ({ request }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim();
		const password = String(formData.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { success: false, message: 'Epost og passord er påkrevd.' });
		}
		if (!validators.parseEmail(email)) {
			return fail(400, { success: false, message: 'Ugyldig epost.' });
		}
		if (password.length < 8) {
			return fail(400, { success: false, message: 'Passord må være minst 8 tegn langt.' });
		}

		const member = await fetchMemberByEmail(email);
		if (member.isErr()) {
			console.error(member.error);
			return fail(500, { success: false, message: 'Innlogging feilet.' });
		}
		if (!member.value) {
			return fail(403, { success: false, message: 'Kun for inviterte medlemmer.' });
		}

		// First password login for an invited member creates the account.
		const { firstName, lastName, userId } = member.value;
		const result = await fromPromise(
			userId
				? auth.api.signInEmail({ body: { email, password }, headers: request.headers })
				: auth.api.signUpEmail({
						body: { email, password, name: `${firstName} ${lastName}` },
						headers: request.headers
					}),
			(e) => e
		);

		if (result.isErr()) {
			const e = result.error;
			if (e instanceof APIError && e.status === 'UNAUTHORIZED') {
				return fail(401, { success: false, message: 'Feil epost eller passord.' });
			}
			console.error(new AuthInternalError({ cause: e }));
			return fail(500, { success: false, message: 'Innlogging feilet.' });
		}

		redirect(303, '/');
	},

	provider: async ({ request }) => {
		const provider = (await request.formData()).get('provider');
		if (!isProvider(provider)) {
			return fail(400, { success: false, message: 'Ukjent innloggingsmetode.' });
		}

		const result = await fromPromise(
			auth.api.signInSocial({
				body: { provider, callbackURL: '/', errorCallbackURL: '/auth?error=oauth_failed' },
				headers: request.headers
			}),
			(e) => new AuthInternalError({ cause: e })
		);

		if (result.isErr() || !result.value.url) {
			console.error(result.isErr() ? result.error : 'No redirect URL from provider sign-in');
			return fail(500, { success: false, message: 'Innlogging feilet.' });
		}

		redirect(303, result.value.url);
	}
};
