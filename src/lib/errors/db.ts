import { TaggedError } from "./tagged-error";

export class DbInternalError extends TaggedError<'DbError'> {
  constructor(options: ErrorOptions = {}) {
    super('Db Error', options);
  }
}

export type DbError = DbInternalError;









