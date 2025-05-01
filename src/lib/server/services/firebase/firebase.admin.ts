import admin, { type ServiceAccount } from 'firebase-admin';

function getFirebaseAdmin(): typeof admin {
	if (!admin.apps.length) {
		const serviceAccount = JSON.parse(
			import.meta.env.VITE_FIREBASE_SERVICE_ACCOUNT
		) as ServiceAccount;
		const config = import.meta.env.PROD
			? {
					credential: admin.credential.cert(serviceAccount)
				}
			: {
					projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
				};

		admin.initializeApp(config);
	}

	if (import.meta.env.DEV) {
		process.env['FIREBASE_AUTH_EMULATOR_HOST'] = 'localhost:9099';
		process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';
	}

	return admin;
}

export const firebaseAdmin = getFirebaseAdmin();
export const db = firebaseAdmin.app().firestore();
