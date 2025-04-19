interface UserBaseDto {
	email: string;
	firstName: string;
	lastName: string;
	admin?: boolean;
	roles?: Array<string>;
}

export type UserAdminInvitationDto = UserBaseDto;

export interface UserInvitationDto {
	email: string;
	username: string;
}

export interface UserRegistrationDto extends UserInvitationDto {
	uid: string;
	idToken: string;
}

export interface UserDto extends UserBaseDto {
	username: string;
	uid: string;
}
