import type { InferSelectModel } from 'drizzle-orm';
import type { members } from './schema';

export type MemberDbDto = InferSelectModel<typeof members>;
