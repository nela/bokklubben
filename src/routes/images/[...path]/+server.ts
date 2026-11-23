import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import { get } from '@vercel/blob';
import type { RequestHandler } from './$types';

/**
 * Serves images from the private Blob store. Behind login like every other route
 * (see guardHandle in hooks.server.ts), so profile photos aren't public.
 */
export const GET: RequestHandler = async ({ params, request }) => {
	const result = await get(params.path, {
		access: 'private',
		token: env.BLOB_PRIVATE_READ_WRITE_TOKEN,
		ifNoneMatch: request.headers.get('if-none-match') ?? undefined
	});

	if (!result) {
		error(404, 'Fant ikke bildet.');
	}

	// `private`: only the signed-in browser may cache it, never a shared/CDN cache.
	const headers = new Headers({
		etag: result.blob.etag,
		'cache-control': 'private, max-age=86400'
	});

	if (result.statusCode === 304) {
		return new Response(null, { status: 304, headers });
	}

	headers.set('content-type', result.blob.contentType);
	return new Response(result.stream, { headers });
};
