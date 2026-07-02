const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } = require('firebase/firestore');

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

let app, db;

if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully in backend.");
  } catch (err) {
    console.error("Failed to initialize Firebase in backend:", err);
  }
} else {
  console.warn("Firebase API key is missing. Firebase services will not be initialized in the backend.");
}

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
        throw new Error("Firestore is not initialized in the backend. Verify FIREBASE_API_KEY.");
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
        throw new Error("Firestore is not initialized in the backend. Verify FIREBASE_API_KEY.");
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
        throw new Error("Firestore is not initialized in the backend. Verify FIREBASE_API_KEY.");
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
        throw new Error("Firestore is not initialized in the backend. Verify FIREBASE_API_KEY.");
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
        throw new Error("Firestore is not initialized in the backend. Verify FIREBASE_API_KEY.");
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

const supabase = {
  from: (tableName) => new QueryBuilder(tableName),
  auth: {
    getUser: async (token) => {
      try {
        if (!token) return { data: { user: null }, error: new Error('Token required') };
        const parts = token.split('.');
        if (parts.length !== 3) return { data: { user: null }, error: new Error('Invalid token format') };
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return {
          data: {
            user: {
              id: payload.sub || payload.uid,
              email: payload.email,
              user_metadata: {
                name: payload.name || ''
              }
            }
          },
          error: null
        };
      } catch (err) {
        return { data: { user: null }, error: err };
      }
    }
  }
};

module.exports = supabase;
