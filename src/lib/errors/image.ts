import { TaggedError } from './tagged-error';

export class ImageStorageError extends TaggedError<'ImageStorageError'> {
	constructor(options: ErrorOptions = {}) {
		super('Image storage error', options);
	}
}
