import { DbInternalError, type DbError } from '$lib/errors/db';
import type { DocumentData, WithFieldValue } from 'firebase-admin/firestore';
import { fromPromise, ok, ResultAsync, safeTry } from 'neverthrow';
import { db } from '../firebase/firebase.admin';
import { unwrapSingleQueryResult } from './utils';

enum DbCollection {
  INVITATIONS = 'invitations'
}

function storeRecord<T extends WithFieldValue<DocumentData>>(
  collection: DbCollection,
) {
  return function(record: T): ResultAsync<string, DbError> {
    return safeTry(
      async function* () {
        const result = yield* fromPromise(
          db.collection(collection).add(record),
          (e) => new DbInternalError({ cause: e })
        );

        return ok(result.id);
      }
    )
  }
}

function deleteRecordById(collection: DbCollection){
  return function(id: string) {
    return safeTry(
      async function* () {
        const result = yield* fromPromise(
          db.collection(collection).where('id', '==', id).get(),
          (e) => new DbInternalError({ cause: e })
        )

        const doc = yield* unwrapSingleQueryResult(result.docs, id, collection)

        const deleteResult = yield* fromPromise(
          doc.ref.delete(),
          (e) => new DbInternalError({ cause: e })
        );

        return ok(deleteResult);
      }
    )
  }
}

export const storeInvitationRecord = storeRecord<UserInvitationRecord>(DbCollection.INVITATIONS);
export const deleteInvitationById = deleteRecordById(DbCollection.INVITATIONS);
