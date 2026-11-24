import { TaggedError } from './tagged-error';

export class DbInternalError extends TaggedError<'DbInternalError'> {
	constructor(options: ErrorOptions = {}) {
		super('Db Error', options);
	}
}

export class DbEntityNotFoundError extends TaggedError<'DbEntityNotFoundError'> {
	readonly id: string;
	readonly entityType: string;

	constructor(id: string, entityType: string, options: ErrorOptions = {}) {
		super(`${entityType} not found: ${id}`, options);
		this.id = id;
		this.entityType = entityType;
	}
}

export class DbTooManyRowsError extends TaggedError<'DbTooManyRows'> {
	readonly id: string;
	readonly entityType: string;

	constructor(id: string, entityType: string, options: ErrorOptions = {}) {
		super(`Too many ${entityType}s found for ${id}`, options);
		this.id = id;
		this.entityType = entityType;
	}
}

/** A unique constraint was violated, e.g. a book with the same slug already exists. */
export class DbConflictError extends TaggedError<'DbConflictError'> {
	/** Name of the violated constraint, e.g. `books_slug_unique`. */
	readonly constraint: string | undefined;

	constructor(constraint: string | undefined, options: ErrorOptions = {}) {
		super(`Unique constraint violated: ${constraint ?? 'unknown'}`, options);
		this.constraint = constraint;
	}
}

export type DbError =
	| DbInternalError
	| DbEntityNotFoundError
	| DbTooManyRowsError
	| DbConflictError;

type PostgresError = { code: string; constraint_name?: string };

const isPostgresError = (e: unknown): e is PostgresError =>
	typeof e === 'object' && e !== null && 'code' in e && typeof e.code === 'string';

/** Drizzle wraps the driver's error in `cause`; a unique violation (23505) becomes a conflict. */
export function toDbError(e: unknown): DbError {
	const pgError = [e, e instanceof Error ? e.cause : undefined].find(isPostgresError);
	if (pgError?.code === '23505') {
		return new DbConflictError(pgError.constraint_name, { cause: e });
	}
	return new DbInternalError({ cause: e });
}
