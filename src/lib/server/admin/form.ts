import { fail, type ActionFailure } from '@sveltejs/kit';
import { err, ok, type Result } from 'neverthrow';
import { z } from 'zod';
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from '$lib/server/images';

/** Field name → messages shown under that field. */
export type FieldErrors = Partial<Record<string, Array<string>>>;

/** What was typed, sent back so a failed form keeps its values. */
export type FormValues = Record<string, string | Array<string>>;

export type FormFailure = ActionFailure<{ values: FormValues; errors: FieldErrors }>;

export interface ParsedForm<T> {
	data: T;
	values: FormValues;
}

export function formFailure(values: FormValues, errors: FieldErrors, status = 400): FormFailure {
	return fail(status, { values, errors });
}

/**
 * Parses submitted form data with a Zod schema. Use the `field` helpers below in the schema:
 * they turn the form's strings (and empty inputs) into the types the database expects.
 *
 *   const form = parseForm(await request.formData(), schema);
 *   if (form.isErr()) return form.error;
 */
export function parseForm<S extends z.ZodType>(
	formData: FormData,
	schema: S
): Result<ParsedForm<z.output<S>>, FormFailure> {
	const raw = toObject(formData);
	const values = textValues(raw);
	const result = schema.safeParse(raw, { error: z.locales.no().localeError });

	return result.success
		? ok({ data: result.data, values })
		: err(formFailure(values, z.flattenError(result.error).fieldErrors));
}

type RawValue = FormDataEntryValue | Array<FormDataEntryValue>;

/** A name sent more than once (a checkbox group) becomes an array. Empty file inputs are left out. */
function toObject(formData: FormData): Record<string, RawValue> {
	return Object.fromEntries(
		[...new Set(formData.keys())].flatMap((key) => {
			const values = formData.getAll(key).filter((v) => !(v instanceof File && v.size === 0));
			if (values.length === 0) return [];
			return [[key, values.length === 1 ? values[0] : values]];
		})
	);
}

function textValues(raw: Record<string, RawValue>): FormValues {
	const values: FormValues = {};
	for (const [key, value] of Object.entries(raw)) {
		if (Array.isArray(value)) {
			values[key] = value.filter((v) => typeof v === 'string');
		} else if (typeof value === 'string') {
			values[key] = value;
		}
	}
	return values;
}

const emptyToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

/** Schema building blocks for form fields. Optional fields become `null` when left empty. */
export const field = {
	text: () => z.string().trim().min(1, 'Må fylles ut'),

	optionalText: () =>
		z.preprocess(emptyToUndefined, z.string().trim().optional()).transform((v) => v ?? null),

	optionalInt: () =>
		z.preprocess(emptyToUndefined, z.coerce.number().int().optional()).transform((v) => v ?? null),

	optionalNumber: () =>
		z.preprocess(emptyToUndefined, z.coerce.number().optional()).transform((v) => v ?? null),

	/** `<input type="date">` (YYYY-MM-DD) → Date at midnight UTC, as Drizzle's date columns use. */
	date: () => z.iso.date().transform((v) => new Date(v)),

	optionalDate: () =>
		z
			.preprocess(emptyToUndefined, z.iso.date().optional())
			.transform((v) => (v ? new Date(v) : null)),

	/** "A, B , C" → ['A', 'B', 'C']. */
	commaList: () =>
		z
			.string()
			.optional()
			.transform((v) =>
				(v ?? '')
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean)
			),

	/** Checkbox group or repeated field: none checked → [], one → [value]. */
	array: <T extends z.ZodType>(item: T) =>
		z.preprocess((v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]), z.array(item)),

	/** A single checkbox: present → true. */
	checkbox: () => z.preprocess((v) => v !== undefined, z.boolean()),

	optionalFile: () => z.instanceof(File).optional(),

	/** An uploaded image that `uploadImage` accepts, or nothing. */
	optionalImage: () =>
		z
			.instanceof(File)
			.refine((f) => f.type in IMAGE_TYPES, 'Må være JPG, PNG, WebP, GIF eller AVIF')
			.refine((f) => f.size <= MAX_IMAGE_BYTES, 'Bildet kan være maks 4 MB')
			.optional()
};
