import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider
} from 'firebase/auth';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app, db, auth, storage;
let firebaseInitError = null;

const validateFirebaseConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId'];
  const missing = required.filter(key => !firebaseConfig[key]);
  if (missing.length > 0) {
    const formatted = missing.map(k => `VITE_FIREBASE_${k.replace(/[A-Z]/g, l => `_${l}`).toUpperCase()}`).join(', ');
    return { ok: false, missing: formatted };
  }
  return { ok: true };
};

const initResult = validateFirebaseConfig();

if (initResult.ok) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log("Firebase initialized successfully in SpectraTrust frontend.");
  } catch (err) {
    firebaseInitError = err;
    console.error("Failed to initialize Firebase:", err);
  }
} else {
  // Diagnose WHY env vars are missing — most common cause: dev server started before .env existed.
  console.error(
    "%c[Firebase] Environment variables not detected by Vite.\n" +
    "Missing: " + initResult.missing + "\n" +
    "Loaded env (sanitized): " + JSON.stringify({
      VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? import.meta.env.VITE_FIREBASE_API_KEY.slice(0, 6) + '...' : '(empty)',
      VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '(empty)',
      VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '(empty)',
      VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL || '(empty)',
    }) + "\n" +
    "FIX: 1) Confirm frontend/.env exists with VITE_FIREBASE_* keys\n" +
    "     2) STOP and RESTART `npm run dev` (Vite reads .env ONLY at startup)\n" +
    "     3) If running `vite build`/`vite preview`, rebuild so env is baked in",
    "color: #ff6b6b; font-weight: bold;"
  );
  firebaseInitError = new Error(
    `Firebase Auth is not initialized. Please verify your Firebase environment variables. Missing: ${initResult.missing}. ` +
    `Make sure frontend/.env exists and contains valid VITE_FIREBASE_* values, then RESTART the dev server (Vite only reads .env on startup).`
  );
}

const ensureAuth = () => {
  if (!auth) {
    const msg = firebaseInitError
      ? firebaseInitError.message
      : "Firebase Auth is not initialized. Please verify your Firebase environment variables.";
    throw new Error(msg);
  }
  return auth;
};

class QueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.filters = [];
    this.orderField = null;
    this.orderDirection = 'asc';
    this.limitCount = null;
    this.isSingle = false;
  }

  select(fields = '*') {
    return this;
  }

  eq(field, value) {
    this.filters.push({ field, op: '==', value });
    return this;
  }

  neq(field, value) {
    this.filters.push({ field, op: '!=', value });
    return this;
  }

  lt(field, value) {
    this.filters.push({ field, op: '<', value });
    return this;
  }

  order(field, { ascending = true } = {}) {
    this.orderField = field;
    this.orderDirection = ascending ? 'asc' : 'desc';
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(resolve, reject) {
    try {
      if (!db) {
        throw new Error("Firestore is not initialized. Please verify your Firebase environment variables.");
      }
      const colRef = collection(db, this.tableName);
      let q = colRef;
      
      const queryConstraints = [];
      for (const f of this.filters) {
        queryConstraints.push(where(f.field, f.op, f.value));
      }
      if (this.orderField) {
        queryConstraints.push(orderBy(this.orderField, this.orderDirection));
      }
      if (this.limitCount) {
        queryConstraints.push(limit(this.limitCount));
      }
      
      if (queryConstraints.length > 0) {
        q = query(colRef, ...queryConstraints);
      }

      const snap = await getDocs(q);
      let data = [];
      snap.forEach(docSnap => {
        data.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (this.isSingle) {
        data = data.length > 0 ? data[0] : null;
      }
      resolve({ data, error: null });
    } catch (err) {
      console.error(`Error querying ${this.tableName}:`, err);
      resolve({ data: null, error: err });
    }
  }

  async insert(payload) {
    try {
      if (!db) {
        throw new Error("Firestore is not initialized. Please verify your Firebase environment variables.");
      }
      const colRef = collection(db, this.tableName);
      const isArray = Array.isArray(payload);
      const items = isArray ? payload : [payload];
      const results = [];

      for (const item of items) {
        const docId = item.id || doc(colRef).id;
        const record = { id: docId, created_at: new Date().toISOString(), ...item };
        await setDoc(doc(colRef, docId), record);
        results.push(record);
      }

      const returnedData = isArray ? results : results[0];
      
      return {
        select: () => ({
          single: () => Promise.resolve({ data: returnedData, error: null }),
          then: (resolve) => resolve({ data: returnedData, error: null })
        }),
        then: (resolve) => resolve({ data: returnedData, error: null })
      };
    } catch (err) {
      console.error(`Error inserting into ${this.tableName}:`, err);
      return {
        select: () => ({
          single: () => Promise.resolve({ data: null, error: err }),
          then: (resolve) => resolve({ data: null, error: err })
        }),
        then: (resolve) => resolve({ data: null, error: err })
      };
    }
  }

  async update(payload) {
    try {
      if (!db) {
        throw new Error("Firestore is not initialized. Please verify your Firebase environment variables.");
      }
      const colRef = collection(db, this.tableName);
      let q = colRef;
      const queryConstraints = [];
      for (const f of this.filters) {
        queryConstraints.push(where(f.field, f.op, f.value));
      }
      if (queryConstraints.length > 0) {
        q = query(colRef, ...queryConstraints);
      }
      const snap = await getDocs(q);
      
      const updatedDocs = [];
      for (const docSnap of snap.docs) {
        const docRef = doc(db, this.tableName, docSnap.id);
        const record = { ...payload, updated_at: new Date().toISOString() };
        await updateDoc(docRef, record);
        updatedDocs.push({ id: docSnap.id, ...docSnap.data(), ...record });
      }

      const returnedData = this.isSingle ? (updatedDocs.length > 0 ? updatedDocs[0] : null) : updatedDocs;
      return { data: returnedData, error: null };
    } catch (err) {
      console.error(`Error updating ${this.tableName}:`, err);
      return { data: null, error: err };
    }
  }

  async delete() {
    try {
      if (!db) {
        throw new Error("Firestore is not initialized. Please verify your Firebase environment variables.");
      }
      const colRef = collection(db, this.tableName);
      let q = colRef;
      const queryConstraints = [];
      for (const f of this.filters) {
        queryConstraints.push(where(f.field, f.op, f.value));
      }
      if (queryConstraints.length > 0) {
        q = query(colRef, ...queryConstraints);
      }
      const snap = await getDocs(q);

      const deletedDocs = [];
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(db, this.tableName, docSnap.id));
        deletedDocs.push({ id: docSnap.id, ...docSnap.data() });
      }

      const returnedData = this.isSingle ? (deletedDocs.length > 0 ? deletedDocs[0] : null) : deletedDocs;
      return { data: returnedData, error: null };
    } catch (err) {
      console.error(`Error deleting from ${this.tableName}:`, err);
      return { data: null, error: err };
    }
  }

  async upsert(payload, options = {}) {
    try {
      if (!db) {
        throw new Error("Firestore is not initialized. Please verify your Firebase environment variables.");
      }
      const colRef = collection(db, this.tableName);
      const onConflict = options.onConflict || 'id';
      const items = Array.isArray(payload) ? payload : [payload];
      const results = [];

      for (const item of items) {
        let docId = item.id;
        
        if (!docId && item[onConflict]) {
          const q = query(colRef, where(onConflict, '==', item[onConflict]));
          const snap = await getDocs(q);
          if (!snap.empty) {
            docId = snap.docs[0].id;
          }
        }
        
        if (!docId) {
          docId = doc(colRef).id;
        }

        const docRef = doc(db, this.tableName, docId);
        const record = { id: docId, created_at: new Date().toISOString(), ...item };
        await setDoc(docRef, record, { merge: true });
        results.push(record);
      }

      const returnedData = Array.isArray(payload) ? results : results[0];
      return { data: returnedData, error: null };
    } catch (err) {
      console.error(`Error upserting in ${this.tableName}:`, err);
      return { data: null, error: err };
    }
  }
}

const channels = {};

export const supabase = {
  from: (tableName) => new QueryBuilder(tableName),
  
  channel: (channelName) => {
    return {
      on: (eventType, filter, callback) => {
        if (!db) {
          console.warn("Firestore not initialized. Cannot listen to realtime channel:", channelName);
          return {
            subscribe: () => ({
              unsubscribe: () => {}
            })
          };
        }
        const table = filter.table;
        const colRef = collection(db, table);
        
        const unsubscribe = onSnapshot(colRef, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const payload = {
              eventType: change.type === 'added' ? 'INSERT' : change.type === 'modified' ? 'UPDATE' : 'DELETE',
              new: { id: change.doc.id, ...change.doc.data() },
              old: change.type === 'removed' ? { id: change.doc.id } : null
            };
            callback(payload);
          });
        });

        if (!channels[channelName]) {
          channels[channelName] = [];
        }
        channels[channelName].push(unsubscribe);

        return {
          subscribe: () => ({
            unsubscribe: () => {
              unsubscribe();
            }
          })
        };
      },
      subscribe: () => {
        return {
          unsubscribe: () => {
            if (channels[channelName]) {
              channels[channelName].forEach(unsub => unsub());
              delete channels[channelName];
            }
          }
        };
      }
    };
  },

  removeChannel: (channelObj) => {
    if (channelObj && typeof channelObj.unsubscribe === 'function') {
      channelObj.unsubscribe();
    }
  },

  auth: {
    signUp: async ({ email, password, options }) => {
      try {
        const authInstance = ensureAuth();
        const cred = await createUserWithEmailAndPassword(authInstance, email, password);
        const name = options?.data?.full_name || '';
        if (name) {
          await updateProfile(cred.user, { displayName: name });
        }
        const token = await cred.user.getIdToken();
        const session = {
          access_token: token,
          user: {
            id: cred.user.uid,
            email: cred.user.email,
            user_metadata: {
              full_name: name
            }
          }
        };
        return { data: { session, user: session.user }, error: null };
      } catch (err) {
        return { data: { session: null, user: null }, error: err };
      }
    },

    signInWithPassword: async ({ email, password }) => {
      try {
        const authInstance = ensureAuth();
        const cred = await signInWithEmailAndPassword(authInstance, email, password);
        const token = await cred.user.getIdToken();
        const session = {
          access_token: token,
          user: {
            id: cred.user.uid,
            email: cred.user.email,
            user_metadata: {
              full_name: cred.user.displayName || ''
            }
          }
        };
        return { data: { session, user: session.user }, error: null };
      } catch (err) {
        return { data: { session: null, user: null }, error: err };
      }
    },

    signInWithOAuth: async ({ provider, options } = {}) => {
      try {
        const authInstance = ensureAuth();
        let providerInstance;
        const providerName = (provider || 'google').toLowerCase();
        if (providerName === 'google') {
          providerInstance = new GoogleAuthProvider();
        } else {
          providerInstance = new OAuthProvider(providerName);
        }
        providerInstance.setCustomParameters({ prompt: 'select_account' });
        const cred = await signInWithPopup(authInstance, providerInstance);
        const token = await cred.user.getIdToken();
        const session = {
          access_token: token,
          user: {
            id: cred.user.uid,
            email: cred.user.email,
            user_metadata: {
              full_name: cred.user.displayName || ''
            }
          }
        };
        return { data: { session, user: session.user, redirectUrl: options?.redirectTo || null }, error: null };
      } catch (err) {
        return { data: { session: null, user: null, redirectUrl: null }, error: err };
      }
    },

    signOut: async () => {
      try {
        const authInstance = ensureAuth();
        await fbSignOut(authInstance);
        return { error: null };
      } catch (err) {
        return { error: err };
      }
    },

    updateUser: async ({ data }) => {
      try {
        const authInstance = ensureAuth();
        const user = authInstance.currentUser;
        if (!user) throw new Error('No user logged in');
        if (data?.full_name) {
          await updateProfile(user, { displayName: data.full_name });
        }
        return {
          data: {
            user: {
              id: user.uid,
              email: user.email,
              user_metadata: {
                full_name: user.displayName || ''
              }
            }
          },
          error: null
        };
      } catch (err) {
        return { data: { user: null }, error: err };
      }
    },

    getSession: async () => {
      try {
        if (!auth) {
          return { data: { session: null }, error: null };
        }
        const user = auth.currentUser;
        if (!user) return { data: { session: null }, error: null };
        const token = await user.getIdToken();
        const session = {
          access_token: token,
          user: {
            id: user.uid,
            email: user.email,
            user_metadata: {
              full_name: user.displayName || ''
            }
          }
        };
        return { data: { session }, error: null };
      } catch (err) {
        return { data: { session: null }, error: err };
      }
    },

    onAuthStateChange: (callback) => {
      if (!auth) {
        console.warn("Firebase Auth not initialized. Registering dummy AuthStateChange listener.");
        return {
          data: {
            subscription: {
              unsubscribe: () => {}
            }
          }
        };
      }
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await user.getIdToken();
          const session = {
            access_token: token,
            user: {
              id: user.uid,
              email: user.email,
              user_metadata: {
                full_name: user.displayName || ''
              }
            }
          };
          callback('SIGNED_IN', session);
        } else {
          callback('SIGNED_OUT', null);
        }
      });

      return {
        data: {
          subscription: {
            unsubscribe
          }
        }
      };
    }
  },

  storage: {
    from: (bucketName) => {
      return {
        upload: async (filePath, file) => {
          try {
            if (!storage) {
              throw new Error("Firebase Storage is not initialized. Please verify your Firebase environment variables.");
            }
            const fileRef = ref(storage, `${bucketName}/${filePath}`);
            await uploadBytes(fileRef, file);
            return { data: { path: filePath }, error: null };
          } catch (err) {
            return { data: null, error: err };
          }
        },
        getPublicUrl: (filePath) => {
          const bucket = firebaseConfig.storageBucket || 'oil-adulteration.firebasestorage.app';
          return { data: { publicUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(bucketName + '/' + filePath)}?alt=media` } };
        }
      };
    }
  }
};

export { auth, db, storage };
