import { z } from 'zod';
import { appRole, clubTitle } from '$lib/server/db/schema';
import { field } from './form';

/** ISBN-10 or ISBN-13; hyphens and spaces are dropped. */
const isbn = () =>
	field
		.optionalText()
		.transform((v) => v?.replace(/[-\s]/g, '') ?? null)
		.refine((v) => v === null || /^(\d{9}[\dX]|\d{13})$/i.test(v), 'Ugyldig ISBN');

/** Stored as smallint. */
const smallInt = (message: string) =>
	field.optionalInt().refine((v) => v === null || Math.abs(v) <= 32767, message);

const bookFields = {
	/** Set when an existing book (e.g. the elected one) is chosen instead of a new one. */
	bookId: field.optionalInt(),
	bookTitle: field.optionalText(),
	/** Author names, one hidden input each. Unknown names become new authors. */
	bookAuthors: field.array(z.string().trim().min(1)),
	bookIsbn: isbn(),
	bookPages: smallInt('Ugyldig antall sider').refine(
		(v) => v === null || v > 0,
		'Ugyldig antall sider'
	),
	bookFirstPublished: smallInt('Ugyldig årstall'),
	/** One hidden input per genre. */
	bookGenres: field.array(z.string().trim().min(1)),
	bookOriginalLanguage: field.optionalText(),
	bookDescription: field.optionalText()
};

export const authorSchema = z.object({
	name: field.text(),
	born: field.optionalDate(),
	died: field.optionalDate(),
	bio: field.optionalText(),
	awards: field.semicolonList()
});

export type AuthorInput = z.output<typeof authorSchema>;

/**
 * Pitch rows in the "Etter møtet" form. Each row sends one value per field, in row order, so the
 * nth title, author, pitcher and status belong together. Rows without a title are left out.
 */
const pitchFields = {
	pitchTitles: field.array(z.string().trim()),
	pitchAuthors: field.array(z.string().trim()),
	/** Member id, or empty for nobody. */
	pitchedBy: field.array(z.string()),
	pitchStatuses: field.array(z.enum(['pitched', 'elected']))
};

type PitchForm = { [K in keyof typeof pitchFields]: z.output<(typeof pitchFields)[K]> };

function checkPitches(form: PitchForm, ctx: z.RefinementCtx) {
	const { pitchTitles, pitchAuthors, pitchedBy, pitchStatuses } = form;
	const rows = pitchTitles.length;
	if ([pitchAuthors, pitchedBy, pitchStatuses].some((field) => field.length !== rows)) {
		ctx.addIssue({ code: 'custom', path: ['pitches'], message: 'Ugyldige pitch-rader' });
		return;
	}
	if (pitchTitles.some((title, i) => !title && (pitchAuthors[i] || pitchedBy[i]))) {
		ctx.addIssue({ code: 'custom', path: ['pitches'], message: 'Hver pitch trenger en tittel' });
	}
	if (pitchStatuses.filter((status, i) => status === 'elected' && pitchTitles[i]).length > 1) {
		ctx.addIssue({ code: 'custom', path: ['pitches'], message: 'Bare én bok kan være valgt' });
	}
}

const toPitches = ({ pitchTitles, pitchAuthors, pitchedBy, pitchStatuses }: PitchForm) =>
	pitchTitles.flatMap((title, i) =>
		title
			? [
					{
						title,
						author: pitchAuthors[i] || null,
						pitchedBy: pitchedBy[i] ? Number(pitchedBy[i]) : null,
						status: pitchStatuses[i]
					}
				]
			: []
	);

/**
 * A meet and the book read at it. The book's fields are prefixed `book` in the form.
 *
 * `highlights`, `attendees` and the pitches are only in the edit form ("Etter møtet"); when
 * creating a meet they are missing, which gives null and empty lists.
 */
export const meetSchema = z
	.object({
		startsAt: field.osloDateTime(),
		hostId: field.optionalInt(),
		location: field.optionalText(),
		address: field.optionalText(),
		notes: field.optionalText(),
		highlights: field.optionalText(),
		/** Member ids, one checkbox each. */
		attendees: field.array(z.coerce.number().int().positive()),
		...pitchFields,
		...bookFields
	})
	.superRefine((form, ctx) => {
		const hasBookDetails = Object.entries(form).some(
			([key, value]) =>
				key.startsWith('book') &&
				key !== 'bookTitle' &&
				(Array.isArray(value) ? value.length > 0 : value !== null)
		);
		if (hasBookDetails && !form.bookTitle) {
			ctx.addIssue({ code: 'custom', path: ['bookTitle'], message: 'Boken trenger en tittel' });
		}
		checkPitches(form, ctx);
	})
	.transform(
		({
			bookId,
			bookTitle,
			bookAuthors,
			bookIsbn,
			bookPages,
			bookFirstPublished,
			bookGenres,
			bookOriginalLanguage,
			bookDescription,
			attendees,
			pitchTitles,
			pitchAuthors,
			pitchedBy,
			pitchStatuses,
			...meet
		}) => ({
			meet,
			attendees: [...new Set(attendees)],
			pitches: toPitches({ pitchTitles, pitchAuthors, pitchedBy, pitchStatuses }),
			book: bookTitle
				? {
						id: bookId,
						title: bookTitle,
						authors: bookAuthors,
						isbn: bookIsbn,
						pages: bookPages,
						firstPublished: bookFirstPublished,
						genres: bookGenres,
						originalLanguage: bookOriginalLanguage,
						description: bookDescription
					}
				: null
		})
	);

export type MeetInput = z.output<typeof meetSchema>;
export type MeetBookInput = NonNullable<MeetInput['book']>;
export type MeetPitchInput = MeetInput['pitches'][number];

export const memberSchema = z
	.object({
		firstName: field.text(),
		lastName: field.text(),
		nickname: field.optionalText(),
		/** Stored lowercased, as logins compare it. */
		email: z.string().trim().toLowerCase().pipe(z.email('Ugyldig e-post')),
		role: z.enum(appRole.enumValues),
		/** One checkbox per title; the keys, not the display labels. */
		titles: field.array(z.enum(clubTitle.enumValues)),
		memberSince: field.date(),
		memberUntil: field.optionalDate(),
		/** A new profile photo; empty keeps the current one. */
		photo: field.optionalImage(),
		removePhoto: field.checkbox()
	})
	.refine((m) => m.memberUntil === null || m.memberUntil >= m.memberSince, {
		path: ['memberUntil'],
		message: 'Kan ikke være før «medlem siden»'
	});

export type MemberInput = z.output<typeof memberSchema>;
