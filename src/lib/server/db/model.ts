interface UserBase {
	email: string;
	firstName: string;
	lastName: string;
	roles: Array<string>;
	admin?: boolean;
}

export interface UserInvitationRecord extends UserBase {
	seed: string;
	expiresAt: string; //ISO format;
}

export interface UserRecord extends UserBase {
	uid: string;
	username: string;
}
