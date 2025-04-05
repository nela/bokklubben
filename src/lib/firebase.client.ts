import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';

function getFirebaseClient() {
	const firebaseConfig = import.meta.env.PROD
		? {
				apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
				authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
				projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
				storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
				messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
				appId: import.meta.env.VITE_FIREBASE_APP_ID,
				measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
			}
		: {
				projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
				apiKey: 'apiKey',
				authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
			};

	const app = initializeApp(firebaseConfig);
	const auth = getAuth(app);

	if (import.meta.env.DEV) {
		connectAuthEmulator(auth, 'http://localhost:9099');
	}

	// void setPersistence(auth );
	return auth;
}

export const auth: Auth = getFirebaseClient();
