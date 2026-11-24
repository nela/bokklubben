import { fromDate, toCalendarDateTime } from '@internationalized/date';
import type { AdminFormState } from '$lib/dto/admin';

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

/** A date column (midnight UTC) as `<input type="date">` wants it: YYYY-MM-DD. */
export const dateInput = (date: Date | null | undefined) =>
	date ? date.toISOString().slice(0, 10) : '';

/** A timestamp as `<input type="datetime-local">` wants it, in Oslo time: YYYY-MM-DDTHH:mm. */
export const osloDateTimeInput = (date: Date | null | undefined) =>
	date ? toCalendarDateTime(fromDate(date, 'Europe/Oslo')).toString().slice(0, 16) : '';
