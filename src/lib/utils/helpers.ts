import type { Author } from '$lib/dto/dto';

export const validators = {
	parseEmail: (email: string) => {
		const emailRegex =
			/^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i; // eslint-disable-line no-useless-escape

		return emailRegex.test(email);
	}
};

export function parseNonNullable<T extends object>(obj: T): NonNullable<T> {
	return (Object.entries(obj) as [keyof T, unknown][])
		.filter(([, value]) => value !== undefined || value !== null)
		.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as NonNullable<T>);
}

export const createSlug = (name: string) => {
	return (
		name
			.toLowerCase()
			// Manually replace characters that don't decompose well
			.replace(/å/g, 'a')
			.replace(/æ/g, 'ae')
			.replace(/ø/g, 'o')
			// Decompose accented characters into base characters and combining marks
			.normalize('NFD')
			// Remove the combining marks (diacritics)
			.replace(/[\u0300-\u036f]/g, '')
			// Replace whitespace with hyphens
			.replace(/\s+/g, '-')
			// Remove any remaining characters that are not alphanumeric or hyphens
			.replace(/[^\w-]+/g, '')
			// Replace multiple hyphens with a single one
			.replace(/--+/g, '-')
	);
};

export const getLifetime = (author: Author) => {
	const bornYear = new Date(author.born).getFullYear();
	const diedYear = author.died ? new Date(author.died).getFullYear() : null;
	return diedYear ? `${bornYear}–${diedYear}` : `f. ${bornYear}`;
};
