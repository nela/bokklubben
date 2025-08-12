import type { InferSelectModel } from 'drizzle-orm';
import type { authors, books, members } from './schema';

export type MemberDbDto = InferSelectModel<typeof members>;
export type BookDbDto = InferSelectModel<typeof books>;
export type AuthorDbTo = InferSelectModel<typeof authors>;
