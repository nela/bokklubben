import { DbEntityNotFoundError, DbTooManyRowsError } from "$lib/errors/db";
import { err, ok } from "neverthrow";

export function unwrapSingleQueryResult<T>(
  rows: Array<T>,
  id: string,
  entityType: string
) {
  if (rows.length === 0) {
    return err(new DbEntityNotFoundError(id, entityType))
  } else if (rows.length > 1) {
    return err(new DbTooManyRowsError(id, entityType));
  }

  return ok(rows[0]);
}
