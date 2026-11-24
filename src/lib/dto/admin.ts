/** Rows for the admin pages. Unlike the site's DTOs, these include ids and every record. */

export interface AdminAuthorListItem {
	id: number;
	name: string;
	born: Date | null;
	died: Date | null;
	bookCount: number;
}
