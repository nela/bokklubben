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

export interface AdminMeet {
	id: number;
	startsAt: Date;
	hostId: number | null;
	location: string | null;
	address: string | null;
	notes: string | null;
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
