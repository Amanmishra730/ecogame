"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// Initialize Firebase Admin SDK
const initializeFirebase = () => {
    if (!firebase_admin_1.default.apps.length) {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
            : {
                type: "service_account",
                project_id: process.env.FIREBASE_PROJECT_ID || "your-project-id",
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "your-private-key-id",
                private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "your-private-key",
                client_email: process.env.FIREBASE_CLIENT_EMAIL || "your-client-email",
                client_id: process.env.FIREBASE_CLIENT_ID || "your-client-id",
                auth_uri: "https://accounts.google.com/o/oauth2/auth",
                token_uri: "https://oauth2.googleapis.com/token",
                auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
                client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL || "your-client-email"}`
            };
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id"
        });
    }
    return firebase_admin_1.default;
};
exports.default = initializeFirebase;
//# sourceMappingURL=firebase.js.map