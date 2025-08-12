import { ClubTitle } from "$lib/dto/dto"

const titles = Object.values(ClubTitle).map((t) =>
	t === ClubTitle.FOUNDING_FATHER ? `${t.toLowerCase()}s` : t.toLowerCase()
)
export const match = (title: string) => titles.includes(title);
