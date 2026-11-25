/** A club title, e.g. «Byråkraten». Titles are added and renamed in the admin. */
export interface ClubTitleRef {
	name: string;
	/** For the title's page, /members/titles/<slug>. */
	slug: string;
}

export type AppRole = 'admin' | 'regular';

export type MeetBookStatus = 'pitched' | 'elected' | 'read';

export interface PublicMember {
	firstName: string;
	lastName: string;
	nickname: string | null;
	memberSince: Date;
	memberUntil: Date | null;
	/** By name. */
	titles: Array<ClubTitleRef>;
	imageUrl: string | null;
}

/** The signed-in member. */
export interface Member extends PublicMember {
	id: number;
	email: string;
	role: AppRole;
}

export interface AuthorRef {
	slug: string;
	name: string;
}

export interface BookRef {
	slug: string;
	title: string;
}

export interface Author extends AuthorRef {
	bio: string | null;
	awards: Array<string>;
	born: Date | null;
	died: Date | null;
	imageUrl: string | null;
	books: Array<
		BookRef & {
			imageUrl: string | null;
			awards: Array<string>;
			genres: Array<string>;
		}
	>;
}

/** A book the club has read, or will read at an upcoming meet. */
export interface Book extends BookRef {
	isbn: string | null;
	description: string | null;
	firstPublished: number | null;
	pages: number | null;
	originalLanguage: string | null;
	genres: Array<string>;
	rating: number | null;
	awards: Array<string>;
	imageUrl: string | null;
	authors: Array<AuthorRef>;
	/** Date of the meet where the book was discussed. */
	readAt: Date;
}

export interface Meet {
	startsAt: Date;
	location: string | null;
	address: string | null;
	notes: string | null;
	highlights: string | null;
	host: { firstName: string; lastName: string } | null;
	/** Books discussed at this meet. */
	books: Array<BookRef & { authors: Array<AuthorRef> }>;
}
