/** Rows for the admin pages. Unlike the site's DTOs, these include ids and every record. */

import type { AppRole, ClubTitleKey } from './dto';

/** Field name → messages shown under that field. `form` holds errors for the form as a whole. */
export type FieldErrors = Partial<Record<string, Array<string>>>;

/** What was typed, sent back so a failed form keeps its values. */
export type FormValues = Record<string, string | Array<string>>;

/** What an admin form action returns when it fails (the page's `form` prop). */
export interface AdminFormState {
	values: FormValues;
	errors: FieldErrors;
}

export interface AdminMemberListItem {
	id: number;
	firstName: string;
	lastName: string;
	nickname: string | null;
	email: string;
	role: AppRole;
	titles: Array<ClubTitleKey>;
	memberSince: Date;
	memberUntil: Date | null;
	/** Has logged in at least once (has a user). Invited members who haven't are false. */
	signedUp: boolean;
	/** The membership has ended. */
	former: boolean;
}

/** A member, as edited in the member form. */
export interface AdminMember {
	id: number;
	firstName: string;
	lastName: string;
	nickname: string | null;
	email: string;
	role: AppRole;
	titles: Array<ClubTitleKey>;
	memberSince: Date;
	memberUntil: Date | null;
	signedUp: boolean;
	/** The profile photo, through /images (see privateImageUrl). */
	imageUrl: string | null;
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

/** A book elected at a meet but not read yet: the likely book for the next meet. */
export interface AdminElectedBook extends AdminMeetBook {
	/** When the meet that elected it started. */
	electedAt: Date;
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

/** An email template written in the admin; see $lib/email-placeholders for what it can contain. */
export interface AdminEmailTemplate {
	id: number;
	name: string;
	subject: string;
	body: string;
	updatedAt: Date;
}

/** What sending from the "Send e-post" panel returns. */
export interface SendEmailResult {
	/** Names of the members it was sent to. */
	sent: Array<string>;
	/** Names of the members it couldn't be sent to. */
	failed: Array<string>;
	savedTemplate: { id: number; name: string } | null;
}
