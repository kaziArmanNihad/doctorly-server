const { initializeApp, cert, getApps } = require("firebase-admin/app");

// const serviceAccount = require("../../serviceAccountKey.json");

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : hasFirebaseConfig
    ? initializeApp({
        credential: cert({
          ...firebaseConfig,
          privateKey: firebaseConfig.privateKey.replace(/\\n/g, "\n"),
        }),
      })
    : null;

module.exports = firebaseApp;
