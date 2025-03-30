interface UserInvitationRecord {
	email: string;
	firstName: string;
	lastName: string;
  seed: string;
  expiresAt: string; //ISO format;
	roles?: Array<string>;
	admin?: boolean;
	handle?: string;
}
