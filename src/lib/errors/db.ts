import { TaggedError } from "./tagged-error";

export class DbInternalError extends TaggedError<'DbError'> {
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
export type DbError = DbInternalError | DbEntityNotFoundError;









