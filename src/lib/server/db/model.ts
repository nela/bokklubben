export interface UserInvitationRecord {
	email: string;
	firstName: string;
	lastName: string;
	seed: string;
	expiresAt: string; //ISO format;
	roles: Array<string>;
	admin?: boolean;
	handle?: string;
}

export interface UserRecord {
	uid: string;
	email: string;
	firstName: string;
	lastName: string;
	roles: Array<string>;
	admin?: boolean;
	handle?: string;
}
