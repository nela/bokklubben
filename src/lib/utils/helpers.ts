import { today } from '@internationalized/date';
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

/**
 * Swaps each value for an existing one that only differs in case, and drops duplicates, so a
 * typed "science fiction" becomes the "Science Fiction" already in use.
 */
export const matchSpelling = (values: Array<string>, existing: Array<string>) => {
	const known = new Map(existing.map((e) => [e.toLowerCase(), e]));
	const result = new Map<string, string>();
	for (const value of values) {
		const key = value.toLowerCase();
		if (!result.has(key)) {
			result.set(key, known.get(key) ?? value);
		}
	}
	return [...result.values()];
};

/** "1920–2010", "f. 1950", "d. 1900", or null when neither date is known. */
export const getLifetime = (author: Pick<Author, 'born' | 'died'>) => {
	const bornYear = author.born?.getFullYear();
	const diedYear = author.died?.getFullYear();

	if (bornYear && diedYear) return `${bornYear}–${diedYear}`;
	if (bornYear) return `f. ${bornYear}`;
	if (diedYear) return `d. ${diedYear}`;
	return null;
};

/**
 * Whether a membership has ended: `memberUntil` (a date column, midnight UTC) is the last day as a
 * member, so it ends the day after, in Oslo.
 */
export const hasLeft = (memberUntil: Date | null, todayInOslo = today('Europe/Oslo').toString()) =>
	memberUntil !== null && memberUntil.toISOString().slice(0, 10) < todayInOslo;

/**
 * Splits prizes stored as "Name (1959)" into name and year, oldest first. Prizes without a year in
 * that form keep their order at the end.
 */
export const parseAwards = (awards: Array<string>) =>
	awards
		.map((award) => {
			const match = award.match(/^(.*?)\s*\((\d{4})\)\s*$/);
			return match ? { name: match[1], year: match[2] } : { name: award, year: null };
		})
		.toSorted((a, b) => (a.year ?? '9999').localeCompare(b.year ?? '9999'));

/** One line per prize, oldest first, with every year it was won: "Hugo Award (1985, 1990)". */
export const groupAwards = (awards: Array<string>) => {
	const years = new Map<string, Array<string>>();
	for (const { name, year } of parseAwards(awards)) {
		years.set(name, [...(years.get(name) ?? []), ...(year ? [year] : [])]);
	}
	return [...years].map(([name, y]) => (y.length > 0 ? `${name} (${y.join(', ')})` : name));
};
