import { DbInternalError, type DbError } from '$lib/errors/db';
import type { DocumentData, DocumentReference, WithFieldValue } from 'firebase-admin/firestore';
import { fromPromise, ok, ResultAsync, safeTry } from 'neverthrow';
import { db } from '../firebase/firebase.admin';
import type { UserInvitationRecord, UserRecord } from './model';
import { unwrapSingleQueryResult } from './utils';

enum DbCollection {
	INVITATION = 'invitation',
	USER = 'user'
}

function storeRecord<T extends WithFieldValue<DocumentData>>(collection: DbCollection) {
	return (record: T) =>
		fromPromise(db.collection(collection).add(record), (e) => new DbInternalError({ cause: e }));
}

function deleteRecordByParam(collection: DbCollection) {
	return (param: { key: string; value: string }) =>
		safeTry(async function* () {
			const result = yield* fromPromise(
				db.collection(collection).where(param.key, '==', param.value).get(),
				(e) => new DbInternalError({ cause: e })
			);

			const doc = yield* unwrapSingleQueryResult(result.docs, param.value, collection);

			const deleteResult = yield* fromPromise(
				doc.ref.delete(),
				(e) => new DbInternalError({ cause: e })
			);
			return ok(deleteResult);
		});
}

function deleteRecordById(collection: DbCollection) {
	return (id: string) =>
		safeTry(async function* () {
			const result = yield* fromPromise(
				db.collection(collection).where('id', '==', id).get(),
				(e) => new DbInternalError({ cause: e })
			);

			const doc = yield* unwrapSingleQueryResult(result.docs, id, collection);

			const deleteResult = yield* fromPromise(
				doc.ref.delete(),
				(e) => new DbInternalError({ cause: e })
			);
			return ok(deleteResult);
		});
}

function fetchRecordByParamMatch<T>(collection: DbCollection) {
	return (param: { key: string; value: unknown }): ResultAsync<T, DbError> =>
		safeTry(async function* () {
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
}

export const deleteRecordByRef = (record: DocumentReference) =>
	fromPromise(record.delete(), (e) => new DbInternalError({ cause: e }));

export const storeInvitationRecord = storeRecord<UserInvitationRecord>(DbCollection.INVITATION);
export const deleteInvitationById = deleteRecordById(DbCollection.INVITATION);
export const fetchInvitationByParam = fetchRecordByParamMatch<UserInvitationRecord>(
	DbCollection.INVITATION
);
export const fetchRegisteredUserByParam = fetchRecordByParamMatch<UserRecord>(DbCollection.USER);
export const storeUserRecord = storeRecord<UserRecord>(DbCollection.USER);

export const deleteInvitationByParam = deleteRecordByParam(DbCollection.INVITATION);
