import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Get the absolute path to the credentials file
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccountPath = resolve(__dirname, 'firebase-admin-credentials.json');

try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
  console.error("Please ensure 'server/firebase-admin-credentials.json' exists and is a valid service account key.");
  // Exit gracefully if the SDK can't be initialized
  // process.exit(1); 
}

export default admin;

// Middleware to verify admin
export const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (decodedToken.admin === true) {
      req.user = decodedToken;
      return next();
    }
    return res.status(403).json({ error: 'Not an admin' });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};