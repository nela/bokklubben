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

export type AppRole = 'admin' | 'regular';

export interface Member {
	firstname: string;
	lastname: string;
	username: string | null;
	email: string;
	memberSince: Date;
	memberTo?: Date | null;
	appRole: AppRole;
	titles: Array<ClubTitle>;
	imageUrl: string;
}

export interface PublicMember {
	firstname: string;
	lastname: string;
	username: string | null;
	memberSince: Date;
	memberTo?: Date | null;
	titles: Array<ClubTitle>;
	imageUrl: string;
}

export interface Author {
	name: string;
	description: string;
	awards: string | null;
	born: Date;
	died: Date | null;
	imageUrl: string;
	books: Array<{
		title: string;
		imageUrl: string;
		awards: string | null;
		genre: string;
	}>;
}

export interface Book {
	title: string;
	firstPublished: number;
	pages: number;
	awards: string | null;
	originalLanguage: string;
	genre: string;
	read: Date;
	goodreadsRating: number;
	description: string;
	authors: Array<string>;
	imageUrl: string;
}

export interface Meet {
	datetime: Date;
	location: string | null;
	host: {
		firstname: string;
		lastname: string;
	} | null; // firstname lastname
	address: string | null;
	notes: string | null;
	highlights: string | null;
	book: {
		title: string;
		authors: Array<string>;
	};
}
