export const validators = {
	parseEmail: (email: string) => {
		const emailRegex =
			/^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i; // eslint-disable-line no-useless-escape

		return emailRegex.test(email);
	}
};

export function parseNonNullable<T extends object>(obj: T): NonNullable<T> {
	return (Object.entries(obj) as [keyof T, unknown][])
		.filter(([, value]) => value !== undefined || value !== null)
		.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as NonNullable<T>);
}

export function firstToUpperRestToLowerCase(name: string) {
	return name
		.split(' ')
		.map((s) => s[0].toUpperCase() + s.slice(1).toLowerCase())
		.join(' ');
}
