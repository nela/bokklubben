/** Display labels for club titles. The database stores the keys. */
export enum ClubTitle {
	CTO = 'CTO',
	CFO = 'CFO',
	WHIP = 'Whip',
	BUREAUCRAT = 'Byråkraten',
	USURPER = 'Tittel raner',
	EXECUTIONER = 'Bøddel',
	PROBATE = 'Prospekt',
	HONORARY = 'Ærede Medlem',
	FOUNDING_FATHER = 'Founding Father'
}

export type ClubTitleKey = keyof typeof ClubTitle;

export type AppRole = 'admin' | 'regular';

export type MeetBookStatus = 'pitched' | 'elected' | 'read';

export interface PublicMember {
	firstName: string;
	lastName: string;
	nickname: string | null;
	memberSince: Date;
	memberUntil: Date | null;
	titles: Array<ClubTitleKey>;
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
			genre: string | null;
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
	genre: string | null;
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
