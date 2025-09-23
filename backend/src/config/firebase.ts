import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (!admin.apps.length) {
    // Helper: sanitize private key from various env formats
    const sanitizePrivateKey = (key?: string): string | undefined => {
      if (!key) return undefined;
      let k = key;
      // Strip surrounding quotes if present
      k = k.replace(/^"|"$/g, '');
      // Convert escaped newlines to real newlines
      k = k.replace(/\\n/g, '\n');
      // Normalize CRLF
      k = k.replace(/\r\n/g, '\n');
      return k;
    };

    // Support base64-encoded private key if provided
    const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
    const decodedBase64Key = base64Key ? Buffer.from(base64Key, 'base64').toString('utf8') : undefined;

    // Try JSON blob first if present
    let serviceAccount: any = undefined;
    const jsonBlob = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (jsonBlob) {
      try {
        const parsed = JSON.parse(jsonBlob);
        if (parsed && parsed.private_key) {
          parsed.private_key = sanitizePrivateKey(parsed.private_key);
        }
        serviceAccount = parsed;
      } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON. Falling back to field-based env.', e);
      }
    }

    // Fall back to field-by-field env vars
    if (!serviceAccount) {
      const sanitizedKey = sanitizePrivateKey(decodedBase64Key || process.env.FIREBASE_PRIVATE_KEY);
      serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID || 'your-project-id',
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || 'your-private-key-id',
        private_key: sanitizedKey || 'your-private-key',
        client_email: process.env.FIREBASE_CLIENT_EMAIL || 'your-client-email',
        client_id: process.env.FIREBASE_CLIENT_ID || 'your-client-id',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL || 'your-client-email'}`,
      };
    }

    // Warn if key still looks malformed
    if (!serviceAccount?.private_key?.includes('BEGIN PRIVATE KEY')) {
      console.warn('Firebase private key may be malformed. Check backend/.env formatting.');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id',
    });
  }
  
  return admin;
};

export default initializeFirebase;
