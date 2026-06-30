import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  where, 
  onSnapshot,
  setDoc
} from 'firebase/firestore';

// Firebase Project Credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForSpectraTrustPlatform",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "spectratrust-platform.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "spectratrust-platform",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "spectratrust-platform.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:1234567890abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Supabase-compatible client layer wrapping Firebase SDK
export const supabase = {
  auth: {
    getSession: async () => {
      const user = auth.currentUser;
      if (!user) return { data: { session: null }, error: null };
      return {
        data: {
          session: {
            user: {
              id: user.uid,
              email: user.email,
              user_metadata: {
                name: user.displayName || 'Inspector',
                badgeId: 'FSSAI-9942',
                phone: user.phoneNumber || ''
              }
            }
          }
        },
        error: null
      };
    },
    onAuthStateChange: (callback) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const session = {
            user: {
              id: user.uid,
              email: user.email,
              user_metadata: {
                name: user.displayName || 'Inspector',
                badgeId: 'FSSAI-9942',
                phone: user.phoneNumber || ''
              }
            }
          };
          callback('SIGNED_IN', session);
        } else {
          callback('SIGNED_OUT', null);
        }
      });
      return { data: { subscription: { unsubscribe } } };
    },
    signInWithPassword: async ({ email, password }) => {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const user = credential.user;
        return {
          data: {
            user: {
              id: user.uid,
              email: user.email
            }
          },
          error: null
        };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    signUp: async ({ email, password, options }) => {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const user = credential.user;
        await updateProfile(user, {
          displayName: options?.data?.name || 'Inspector'
        });
        return {
          data: {
            user: {
              id: user.uid,
              email: user.email
            }
          },
          error: null
        };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    updateUser: async ({ data }) => {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, {
          displayName: data.name
        });
        return { data: { user }, error: null };
      }
      return { data: null, error: new Error("No user logged in") };
    },
    signOut: async () => {
      await fbSignOut(auth);
      return { error: null };
    }
  },
  
  from: (table) => {
    let sortField = null;
    let sortDir = 'desc';
    let limitVal = null;
    let filters = [];

    const builder = {
      select: (fields, options) => {
        return builder;
      },
      eq: (field, value) => {
        filters.push(where(field, '==', value));
        return builder;
      },
      order: (field, options) => {
        sortField = field;
        sortDir = options?.ascending ? 'asc' : 'desc';
        return builder;
      },
      limit: (val) => {
        limitVal = val;
        return builder;
      },
      single: async () => {
        try {
          const colRef = collection(db, table);
          let q = query(colRef, ...filters);
          if (sortField) {
            q = query(q, orderBy(sortField, sortDir));
          }
          if (limitVal) {
            q = query(q, limit(limitVal));
          }
          const snapshot = await getDocs(q);
          if (snapshot.empty) return { data: null, error: new Error("Not found") };
          const docSnap = snapshot.docs[0];
          return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      insert: async (records) => {
        try {
          const colRef = collection(db, table);
          const results = [];
          for (const record of records) {
            if (record.id) {
              await setDoc(doc(db, table, record.id), record);
              results.push(record);
            } else {
              const docRef = await addDoc(colRef, record);
              results.push({ id: docRef.id, ...record });
            }
          }
          return { data: results, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      update: async (updates) => {
        return {
          eq: (field, value) => {
            return {
              then: async (resolve) => {
                try {
                  const colRef = collection(db, table);
                  const q = query(colRef, where(field, '==', value));
                  const snapshot = await getDocs(q);
                  for (const document of snapshot.docs) {
                    await updateDoc(doc(db, table, document.id), updates);
                  }
                  resolve({ data: updates, error: null });
                } catch (err) {
                  resolve({ data: null, error: err });
                }
              }
            };
          }
        };
      },
      delete: () => {
        return {
          eq: (field, value) => {
            return {
              then: async (resolve) => {
                try {
                  const colRef = collection(db, table);
                  const q = query(colRef, where(field, '==', value));
                  const snapshot = await getDocs(q);
                  for (const document of snapshot.docs) {
                    await deleteDoc(doc(db, table, document.id));
                  }
                  resolve({ data: true, error: null });
                } catch (err) {
                  resolve({ data: null, error: err });
                }
              }
            };
          }
        };
      },
      then: async (resolve) => {
        try {
          const colRef = collection(db, table);
          let q = query(colRef, ...filters);
          if (sortField) {
            q = query(q, orderBy(sortField, sortDir));
          }
          if (limitVal) {
            q = query(q, limit(limitVal));
          }
          const snapshot = await getDocs(q);
          const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
          resolve({ data: list, error: null });
        } catch (err) {
          resolve({ data: null, error: err });
        }
      }
    };

    return builder;
  },

  channel: (channelName) => {
    return {
      on: (event, filterOptions, callback) => {
        const colRef = collection(db, filterOptions.table);
        const unsubscribe = onSnapshot(colRef, (snapshot) => {
          callback();
        });
        return { subscribe: () => {} };
      }
    };
  },
  removeChannel: (channel) => {}
};
