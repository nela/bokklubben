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
};

export interface PublicMember {
	firstname: string;
	lastname: string;
	username: string | null;
	memberSince: Date;
	memberTo?: Date | null;
	titles: Array<ClubTitle>;
	imageUrl: string;
};
