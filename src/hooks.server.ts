import { authHandle } from '$lib/server/hooks/authHandle';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(authHandle);
