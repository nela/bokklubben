import { TaggedError } from './tagged-error';

export class AuthInternalError extends TaggedError<'AuthInternalError'> {
	constructor(options: ErrorOptions = {}) {
		super('Authentication error', options);
	}
}

export class AuthUserNotFoundError extends TaggedError<'AuthUserNotFoundError '> {
	constructor(options: ErrorOptions = {}) {
		super('Authenticaiton user not found', options);
	}
}

export type AuthError = AuthInternalError | AuthUserNotFoundError;
