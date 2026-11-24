/**
 * Placeholders an email template can contain, e.g. `Hei {fornavn}`. They're filled in with the
 * recipient's details when the email is sent.
 */
export const emailPlaceholders = {
	fornavn: 'Mottakerens fornavn',
	etternavn: 'Mottakerens etternavn',
	epost: 'Mottakerens e-postadresse, den de logger inn med'
} as const;

export type EmailPlaceholder = keyof typeof emailPlaceholders;
