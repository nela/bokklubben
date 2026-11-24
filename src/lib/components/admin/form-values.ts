import { fromDate, toCalendarDateTime } from '@internationalized/date';
import type { AdminFormState } from '$lib/dto/admin';

/** The page's `form` when it holds a failed form (values and errors), otherwise null. */
export const failedForm = (form: unknown): AdminFormState | null =>
	form && typeof form === 'object' && 'errors' in form && form.errors
		? (form as AdminFormState)
		: null;

/**
 * The value a form field shows: what was typed if the last save failed, otherwise the saved value.
 */
export function fieldValue(
	form: AdminFormState | null | undefined,
	name: string,
	saved: string
): string {
	const typed = form?.values[name];
	return typeof typed === 'string' ? typed : saved;
}

/**
 * Like `fieldValue`, for a field sent once per value (tags, checkboxes). After a failed save a
 * missing field means none were chosen.
 */
export function fieldValues(
	form: AdminFormState | null | undefined,
	name: string,
	saved: Array<string>
): Array<string> {
	if (!form) {
		return saved;
	}
	const typed = form.values[name];
	return typed === undefined ? [] : Array.isArray(typed) ? typed : [typed];
}

/** A date column (midnight UTC) as `<input type="date">` wants it: YYYY-MM-DD. */
export const dateInput = (date: Date | null | undefined) =>
	date ? date.toISOString().slice(0, 10) : '';

/** A timestamp as `<input type="datetime-local">` wants it, in Oslo time: YYYY-MM-DDTHH:mm. */
export const osloDateTimeInput = (date: Date | null | undefined) =>
	date ? toCalendarDateTime(fromDate(date, 'Europe/Oslo')).toString().slice(0, 16) : '';
