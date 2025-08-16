import type { InferSelectModel } from 'drizzle-orm';
import type { authors, books, meets, members } from './schema';

export type MemberDbDto = InferSelectModel<typeof members>;
export type BookDbDto = InferSelectModel<typeof books>;
export type AuthorDbDto = InferSelectModel<typeof authors>;
export type MeedDbDto = InferSelectModel<typeof meets>;
