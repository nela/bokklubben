export enum ClubTitle {
	CTO = 'CTO',
	CFO = 'CFO',
	WHIP = 'Whip',
	BUREAUCRAT = 'Byråkraten',
	USURPER = 'USURPER',
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
}
