import { TaggedError } from './tagged-error';

export class AuthInternalError extends TaggedError<'AuthError'> {
	constructor(options: ErrorOptions = {}) {
		super('Authentication error', options);
	}
}

export type AuthError = AuthInternalError;
