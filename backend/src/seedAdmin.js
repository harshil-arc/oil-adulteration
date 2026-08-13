/**
 * seedAdmin.js
 * One-time script to create the admin Firebase Auth account
 * and seed the Firestore 'users' collection with role: 'admin'.
 *
 * Run with:  node src/seedAdmin.js
 */

require('dotenv').config();
const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} = require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// ─── Admin credentials to seed ───────────────────────────────────────────────
const ADMIN_EMAIL    = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin@123';
const ADMIN_NAME     = 'System Administrator';
// ─────────────────────────────────────────────────────────────────────────────

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);

async function seedAdmin() {
  console.log('\n🔐  Admin Account Seeder');
  console.log('─'.repeat(45));
  console.log(`Email    : ${ADMIN_EMAIL}`);
  console.log(`Password : ${ADMIN_PASSWORD}`);
  console.log('─'.repeat(45));

  let uid = null;

  // Step 1: Try to create Firebase Auth account
  try {
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    uid = cred.user.uid;
    console.log(`\n✅  Firebase Auth account CREATED`);
    console.log(`    UID: ${uid}`);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      // Account already exists — just sign in to get the UID
      console.log('\n⚠️  Auth account already exists. Fetching UID via sign-in...');
      try {
        const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        uid = cred.user.uid;
        console.log(`    UID: ${uid}`);
      } catch (signInErr) {
        console.error('\n❌  Sign-in failed (password may be different in Firebase):', signInErr.message);
        console.log('\n    → Please reset the password in Firebase Console → Authentication');
        console.log('      and re-run this script.\n');
        process.exit(1);
      }
    } else {
      console.error('\n❌  Failed to create Auth account:', err.message);
      process.exit(1);
    }
  }

  // Step 2: Check if Firestore profile already exists
  const userDocRef = doc(db, 'users', uid);
  const existingDoc = await getDoc(userDocRef);

  if (existingDoc.exists()) {
    const data = existingDoc.data();
    if (data.role === 'admin') {
      console.log('\n✅  Firestore admin profile already exists. No changes needed.');
    } else {
      // Upgrade existing profile to admin
      await setDoc(userDocRef, {
        ...data,
        role: 'admin',
        verification_status: 'approved',
        updated_at: new Date().toISOString()
      }, { merge: true });
      console.log(`\n✅  Existing Firestore profile upgraded to role: admin`);
    }
  } else {
    // Step 3: Create fresh Firestore profile with admin role
    const adminProfile = {
      uid,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'admin',
      phone: null,
      verification_status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await setDoc(userDocRef, adminProfile);
    console.log('\n✅  Firestore admin profile CREATED in users collection');
  }

  console.log('\n─'.repeat(45));
  console.log('🎉  Admin seeding complete!\n');
  console.log('    Login at: /login → Select "Admin Login"');
  console.log(`    Email   : ${ADMIN_EMAIL}`);
  console.log(`    Password: ${ADMIN_PASSWORD}`);
  console.log('─'.repeat(45) + '\n');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('\n❌  Unexpected error:', err);
  process.exit(1);
});
