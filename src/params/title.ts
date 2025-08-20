import { ClubTitle } from '$lib/dto/dto';

export const match = (title: string) => {
	return Object.keys(ClubTitle).includes(title.toUpperCase() as ClubTitle);
};
