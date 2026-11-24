/** Rows for the admin pages. Unlike the site's DTOs, these include ids and every record. */

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
