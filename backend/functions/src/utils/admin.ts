import * as admin from 'firebase-admin';
import accountKey from '../../serviceAccountKey.json';

const serviceAccount = {
  type: accountKey.type,
  projectId: accountKey.project_id,
  privateKeyId: accountKey.private_key_id,
  privateKey: accountKey.private_key,
  clientEmail: accountKey.client_email,
  clientId: accountKey.client_id,
  authUri: accountKey.auth_uri,
  tokenUri: accountKey.token_uri,
  authProviderX509CertUrl: accountKey.auth_provider_x509_cert_url,
  clientC509CertUrl: accountKey.client_x509_cert_url
};

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db = admin.firestore();

export { db, admin };
