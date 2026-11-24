/** Rows for the admin pages. Unlike the site's DTOs, these include ids and every record. */

/** Field name → messages shown under that field. `form` holds errors for the form as a whole. */
export type FieldErrors = Partial<Record<string, Array<string>>>;

/** What was typed, sent back so a failed form keeps its values. */
export type FormValues = Record<string, string | Array<string>>;

/** What an admin form action returns when it fails (the page's `form` prop). */
export interface AdminFormState {
	values: FormValues;
	errors: FieldErrors;
}

/** For selects, e.g. choosing a meet's host. */
export interface MemberOption {
	id: number;
	name: string;
}

/** The book read at a meet, as edited in the meet form. */
export interface AdminMeetBook {
	id: number;
	title: string;
	isbn: string | null;
	pages: number | null;
	firstPublished: number | null;
	genres: Array<string>;
	originalLanguage: string | null;
	description: string | null;
	/** Author names. */
	authors: Array<string>;
}

/** A book pitched at a meet, as shown in the "Etter møtet" rows. */
export interface AdminMeetPitch {
	title: string;
	/** The book's first author, if any. */
	author: string | null;
	/** Member id. */
	pitchedBy: number | null;
	status: 'pitched' | 'elected';
}

export interface AdminMeet {
	id: number;
	startsAt: Date;
	hostId: number | null;
	location: string | null;
	address: string | null;
	notes: string | null;
	highlights: string | null;
	/** Ids of the members who attended. */
	attendeeIds: Array<number>;
	pitches: Array<AdminMeetPitch>;
	/** The book read at the meet, or null if it has none yet. */
	book: AdminMeetBook | null;
}

export interface AdminMeetListItem {
	id: number;
	startsAt: Date;
	location: string | null;
	/** Full name, or null if no host is set. */
	host: string | null;
	/** Titles of the books read at the meet. */
	books: Array<string>;
}

export interface AdminAuthorListItem {
	id: number;
	name: string;
	born: Date | null;
	died: Date | null;
	bookCount: number;
}
