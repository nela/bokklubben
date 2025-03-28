import { TaggedError } from './tagged-error';

export class AuthenticationError extends TaggedError<'AuthError'> {
	constructor(options: ErrorOptions = {}) {
		super('Authentication error', options);
	}
}

export type AuthError = AuthenticationError;
