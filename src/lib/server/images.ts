import { env } from '$env/dynamic/private';

/**
 * The database stores image paths (`books/dune.jpg`), not URLs, so the hosts can change.
 * Absolute URLs are passed through, for images hosted elsewhere.
 */

const isAbsolute = (path: string) => /^https?:\/\//.test(path);

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
