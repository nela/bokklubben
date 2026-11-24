/** An admin record: `new`, or the id of an existing one. */
export function match(id: string) {
	return /^(new|[0-9]+)$/.test(id);
}
