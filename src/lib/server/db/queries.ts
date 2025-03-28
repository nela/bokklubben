import { db } from '../firebase.admin';
import { DocumentReference } from 'firebase-admin/firestore';

export async function addInvite(record: any) {
	db.collection('invites').add(record);
}

export async function getInvite() {}
