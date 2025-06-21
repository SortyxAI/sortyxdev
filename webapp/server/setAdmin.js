import admin from './firebase-admin.js';

async function setAdminClaim(uid) {
  if (!uid) {
    console.error('Error: UID is required. Usage: node setAdmin.js <user_uid>');
    process.exit(1);
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Success! Custom claim 'admin: true' set for user ${uid}.`);
    console.log('The user must log out and log back in for the changes to take effect.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting custom claim:', error);
    process.exit(1);
  }
}

const uid = process.argv[2];
setAdminClaim(uid); 