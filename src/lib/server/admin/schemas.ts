import { z } from 'zod';
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
 * A meet and the book read at it. The book's fields are prefixed `book` in the form.
 *
 * `highlights` and `attendees` are only in the edit form ("Etter møtet"); when creating a meet
 * they are missing, which gives null and no attendees.
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
	})
	.transform(
		({
			bookTitle,
			bookAuthors,
			bookIsbn,
			bookPages,
			bookFirstPublished,
			bookGenres,
			bookOriginalLanguage,
			bookDescription,
			attendees,
			...meet
		}) => ({
			meet,
			attendees: [...new Set(attendees)],
			book: bookTitle
				? {
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
