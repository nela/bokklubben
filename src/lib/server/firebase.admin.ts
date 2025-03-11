import { SERVICE_ACCOUNT } from '$env/static/private';
import admin, { type ServiceAccount } from "firebase-admin";

function getFirebaseAdmin() {
  if (!admin.apps.length) {

    const config = import.meta.env.PROD ?
      {
        credential: admin.credential.cert(JSON.parse(SERVICE_ACCOUNT) as ServiceAccount)
      } : {
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
      }

    admin.initializeApp(config);
  }

  if (import.meta.env.DEV) {
    process.env['FIREBASE_AUTH_EMULATOR_HOST'] = 'localhost:9099';
  }

  return admin;
}

export const firebaseAdmin = getFirebaseAdmin();
