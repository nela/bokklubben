import { del, put } from '@vercel/blob';
import { fromPromise, okAsync, type ResultAsync } from 'neverthrow';
import { env } from '$env/dynamic/private';
import { ImageStorageError } from '$lib/errors/image';

/**
 * The database stores image paths (`books/dune.jpg`), not URLs, so the hosts can change.
 * Absolute URLs are passed through, for images hosted elsewhere.
 */

const isAbsolute = (path: string) => /^https?:\/\//.test(path);

/** `public`: covers and author photos. `private`: profile photos. */
export type ImageStore = 'public' | 'private';

const stores = {
	public: { access: 'public', token: () => env.BLOB_PUBLIC_READ_WRITE_TOKEN },
	private: { access: 'private', token: () => env.BLOB_PRIVATE_READ_WRITE_TOKEN }
} as const;

/** Raster formats only: an SVG can carry scripts, and private images are served from our origin. */
export const IMAGE_TYPES: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif',
	'image/avif': 'avif'
};

/** Uploads go through a Vercel function, which accepts request bodies up to 4.5 MB. */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/**
 * Stores an image at `<path>-<random>.<ext>`, e.g. `uploadImage('public', 'books/dune', file)`,
 * and returns the path to save in the database. The random suffix gives a replaced image a new
 * URL, so the CDN and browsers never show the old one.
 */
export function uploadImage(
	store: ImageStore,
	path: string,
	file: File
): ResultAsync<string, ImageStorageError> {
	const { access, token } = stores[store];
	return fromPromise(
		put(`${path}.${IMAGE_TYPES[file.type] ?? 'bin'}`, file, {
			access,
			token: token(),
			contentType: file.type,
			addRandomSuffix: true
		}),
		(e) => new ImageStorageError({ cause: e })
	).map((blob) => blob.pathname);
}

/** Deletes a stored image. Does nothing for an empty path or an image hosted elsewhere. */
export function deleteImage(
	store: ImageStore,
	path: string | null
): ResultAsync<void, ImageStorageError> {
	if (!path || isAbsolute(path)) {
		return okAsync(undefined);
	}
	return fromPromise(
		del(path, { token: stores[store].token() }),
		(e) => new ImageStorageError({ cause: e })
	);
}

/** Book covers and author photos: straight from the public Blob store's CDN. */
export function publicImageUrl(path: string | null): string | null {
	if (!path) return null;
	if (isAbsolute(path)) return path;
	return `${env.BLOB_PUBLIC_URL}/${path}`;
}

/** Profile photos: from the private Blob store, through the app's /images route (behind login). */
export function privateImageUrl(path: string | null): string | null {
	if (!path) return null;
	if (isAbsolute(path)) return path;
	return `/images/${path}`;
}
