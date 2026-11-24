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

/** A meet, and the book read at it. The book's fields are prefixed `book` in the form. */
export const meetSchema = z
	.object({
		startsAt: field.osloDateTime(),
		hostId: field.optionalInt(),
		location: field.optionalText(),
		address: field.optionalText(),
		notes: field.optionalText(),
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
			bookIsbn,
			bookPages,
			bookFirstPublished,
			bookGenres,
			bookOriginalLanguage,
			bookDescription,
			...meet
		}) => ({
			meet,
			book: bookTitle
				? {
						title: bookTitle,
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
