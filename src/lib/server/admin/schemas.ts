import { z } from 'zod';
import { field } from './form';

export const meetSchema = z.object({
	startsAt: field.osloDateTime(),
	hostId: field.optionalInt(),
	location: field.optionalText(),
	address: field.optionalText(),
	notes: field.optionalText()
});

export type MeetInput = z.output<typeof meetSchema>;
