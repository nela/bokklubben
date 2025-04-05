import { DbInternalError, type DbError } from '$lib/errors/db';
import type { DocumentData, WithFieldValue } from 'firebase-admin/firestore';
import { fromPromise, ok, ResultAsync, safeTry } from 'neverthrow';
import { db } from '../firebase/firebase.admin';
import type { UserInvitationRecord, UserRecord } from './model';
import { unwrapSingleQueryResult } from './utils';

enum DbCollection {
	INVITATION = 'invitation',
	USER = 'user'
}

function storeRecord<T extends WithFieldValue<DocumentData>>(collection: DbCollection) {
	return function (record: T): ResultAsync<string, DbError> {
		return safeTry(async function* () {
			const result = yield* fromPromise(
				db.collection(collection).add(record),
				(e) => new DbInternalError({ cause: e })
			);

			return ok(result.id);
		});
	};
}

function deleteRecordById(collection: DbCollection) {
	return function (id: string) {
		return safeTry(async function* () {
			const result = yield* fromPromise(
				db.collection(collection).where('id', '==', id).get(),
				(e) => {
					console.log(e);
					return new DbInternalError({ cause: e });
				}
			);

			const doc = yield* unwrapSingleQueryResult(result.docs, id, collection);

			const deleteResult = yield* fromPromise(
				doc.ref.delete(),
				(e) => new DbInternalError({ cause: e })
			);
			return ok(deleteResult);
		});
	};
}

function fetchRecordByParamMatch<T>(collection: DbCollection) {
	return function (param: { key: string; value: unknown }): ResultAsync<T, DbError> {
		return safeTry(async function* () {
			const result = yield* fromPromise(
				db.collection(collection).where(param.key, '==', param.value).get(),
				(e) => new DbInternalError({ cause: e })
			);

			const doc = yield* unwrapSingleQueryResult(
				result.docs,
				`${param.key} ${param.value}`,
				collection
			);

			return ok(doc.data() as T);
		});
	};
}

export const storeInvitationRecord = storeRecord<UserInvitationRecord>(DbCollection.INVITATION);
export const deleteInvitationById = deleteRecordById(DbCollection.INVITATION);
export const fetchInvitationByParam = fetchRecordByParamMatch<UserInvitationRecord>(
	DbCollection.INVITATION
);
export const fetchRegisteredUserByParam = fetchRecordByParamMatch<UserRecord>(DbCollection.USER);
