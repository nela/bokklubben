import * as db from '$lib/server/db/queries';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { err, fromPromise, ok, safeTry } from 'neverthrow';
import { AuthInternalError } from '$lib/errors/auth';
import type { Provider } from '@supabase/supabase-js';

const emailSchema = /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;

export const actions: Actions = {
	supabase: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			return fail(400, { status: false, message: "Bruker og logg inn nødvendig."})
		}

		if (emailSchema.test(email)) {
			return fail(400, { status: false, message: "Ugyldig epost." });
		}

		if (password.length < 8) {
			return fail(400, { status: false, message: "Passord må være minst 8 karakterer langt."});
		}

		const actionResult = safeTry(async function* () {
			const isAllowed = yield* db.verifyUserAllowed(email);

			if (!isAllowed.action) {
				return ok(undefined);
			}

			const authMethod =
				isAllowed.action === 'signin'
					? () => supabase.auth.signInWithPassword({ email, password })
					: () => supabase.auth.signUp({ email, password });

			return fromPromise(authMethod(), (e) => new AuthInternalError({ cause: e })).andThen(
				(res) => {
					return res.error
						? err(new AuthInternalError({ cause: `${res.error.cause} ${res.error.message}` }))
						: ok(res.data);
				}
			);
		});

		return actionResult.match(
			(res) =>
				res
					? redirect(303, '/')
					: fail(403, {
							success: false,
							message: 'Invited members only.'
						}),
			(error) => {
				console.error(error);
				return fail(500, {
					success: false,
					message: 'Failed to login.'
				});
			}
		);
	},
	provider: async ({ request, url, locals: { supabase } }) => {
		const provider = (await request.formData()).get('provider') as Provider;

		const actionResult = fromPromise(
			supabase.auth.signInWithOAuth({
				provider: provider,
				options: {
					redirectTo: `${url.origin}/auth/callback`
				}
			}),
			(e) => new AuthInternalError({ cause: e })
		).andThen((res) =>
			res.error
				? err(new AuthInternalError({ cause: `${res.error.cause} ${res.error.message}` }))
				: ok(res.data)
		);

		return actionResult.match(
			(data) => {
				console.log(data);
				return redirect(303, data.url);
			},
			(e) => {
				console.error(e);
				return fail(500, {
					success: false,
					message: 'Failed to login.'
				});
			}
		);
	}
};
