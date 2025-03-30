import { DbInternalError, type DbError } from '$lib/errors/db';
import { fromPromise, ok, ResultAsync, safeTry } from 'neverthrow';
import { db } from '../firebase/firebase.admin';
import { deleteDoc, doc } from 'firebase/firestore';


export function storeInvitation(record: UserInvitationRecord): ResultAsync<string, DbError> {
  return fromPromise(
    db.collection('invites').add(record),
    (e) => new DbInternalError({ cause: e })
  ).map((doc) => doc.id)
}

export function deleteInvitationById(id: string) {
  return fromPromise(
    db.collection('invites').where('id', '==', id).get(),
    (e) => new DbInternalError({ cause: e })
  ).map(
      (doc) => doc.forEach((d) => fromPromise(
        d.ref.delete(),
        (e) => new DbInternalError({ cause: e })
      )),
    )
}

export function deleteInvitationById2(id: string) {
  return safeTry(
    async function*() {
      const query = yield* fromPromise(
        db.collection('invites').where('id', '==', id).get(),
        (e) => new DbInternalError({ cause: e })
      )

      const doc = query.forEach((d) => d.ref.delete())
      const asdf = query.docs[0]
      asdf.ref.delete();

      return ok();
    }
  )
}
