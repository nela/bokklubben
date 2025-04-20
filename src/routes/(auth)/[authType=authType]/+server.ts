import type { UserRegistrationDto } from '$lib/dto/dto';
import { AuthUserNotFoundError } from '$lib/errors/auth';
import {
	createSessionCookie,
	setSessionCookie,
	signupUser,
	verifyIdToken
} from '$lib/server/services/auth';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { okAsync } from 'neverthrow';

const TOKEN_EXPIRATION = 3600;

export const POST: RequestHandler = async ({ request, params, cookies }) => {
	const body = await request.json().catch(() => null);
	if (!body || typeof body.idToken !== 'string' || body.idToken.length === 0) {
		return json({ status: 400 });
	}

	const idToken = body.idToken as string;

	return okAsync()
		.andThen(() =>
			params.authType === 'signin'
				? verifyIdToken(idToken)
				: signupUser(body as UserRegistrationDto)
		)
		.andThen(() => createSessionCookie(idToken, TOKEN_EXPIRATION * 1000))
		.match(
			(token) => {
				setSessionCookie(cookies, token, TOKEN_EXPIRATION);
				return json({ message: 'Signin successful.' }, { status: 200 });
			},
			(e) => {
				if (e instanceof AuthUserNotFoundError) {
					return json({ status: 401 });
				}

				throw error(500, `Failed to ${params.authType}. Please try again later.`);
			}
		);
};
