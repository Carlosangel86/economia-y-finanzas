// =====================================================================
// FIREBASE CLOUD ECOSYSTEM SERVICE (firebase-service.js)
// SDK v9+ Modular (Firebase App, Firebase Auth, Cloud Firestore)
// Project: asesor-financiero-83679
// =====================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    query, 
    where,
    orderBy, 
    limit, 
    serverTimestamp,
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// --- 1. CONFIGURACIÓN EXACTA DE FIREBASE ---
export const firebaseConfig = {
  apiKey: "AIzaSyCXTHJXjAyj5DVyOQUVBih7uMNQzcvdZKc",
  authDomain: "asesor-financiero-83679.firebaseapp.com",
  projectId: "asesor-financiero-83679",
  storageBucket: "asesor-financiero-83679.firebasestorage.app",
  messagingSenderId: "810248667164",
  appId: "1:810248667164:web:cbdf354358607efa8a1fd9"
};

// --- 2. INICIALIZACIÓN DEL CLIENTE MODULAR ---
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Diccionario de equivalencias de usuario demo a correo
export const DEMO_USER_EMAILS = {
    'admin_demo': 'admin@cfocopilot.com',
    'supervisor_demo': 'supervisor@cfocopilot.com',
    'caja_demo': 'cajero@cfocopilot.com',
    'finanzas_demo': 'analista@cfocopilot.com',
    'almacen_demo': 'almacen@cfocopilot.com'
};

export const DEMO_USER_NAMES = {
    'admin_demo': 'Administrador General',
    'supervisor_demo': 'Supervisor de Turno',
    'caja_demo': 'Cajero Punto de Venta',
    'finanzas_demo': 'Analista Financiero',
    'almacen_demo': 'Encargado de Almacén'
};

export const DEMO_USER_ROLES = {
    'admin_demo': 'admin',
    'supervisor_demo': 'supervisor',
    'caja_demo': 'cajero',
    'finanzas_demo': 'analista',
    'almacen_demo': 'almacen'
};

// =====================================================================
// SERVICIOS MODULARES ASÍNCRONOS DE FIRESTORE Y AUTH
// =====================================================================

// --- A. SERVICIO DE AUTENTICACIÓN (Firebase Auth) ---
export const AuthService = {
    async login(identifier, password) {
        let email = identifier.trim();
        if (!email.includes('@')) {
            email = DEMO_USER_EMAILS[email.toLowerCase()] || `${email.toLowerCase()}@cfocopilot.com`;
        }
        
        // Política de contraseñas de Firebase Auth (mínimo 6 caracteres)
        const effectivePassword = password === '1234' ? '123456' : password;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, effectivePassword);
            return userCredential.user;
        } catch (error) {
            // Si es un usuario demo reconocido y aún no existe en Auth, auto-aprovisionarlo
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
                const usernameKey = Object.keys(DEMO_USER_EMAILS).find(k => DEMO_USER_EMAILS[k].toLowerCase() === email.toLowerCase());
                if (usernameKey) {
                    try {
                        const newCred = await createUserWithEmailAndPassword(auth, email, effectivePassword);
                        await updateProfile(newCred.user, { displayName: DEMO_USER_NAMES[usernameKey] });
                        
                        // Registrar en colección 'users'
                        await UsersService.saveUser({
                            id: newCred.user.uid,
                            uid: newCred.user.uid,
                            username: usernameKey,
                            name: DEMO_USER_NAMES[usernameKey],
                            email: email,
                            role: DEMO_USER_ROLES[usernameKey] || 'cajero',
                            active: true,
                            created: new Date().toISOString()
                        });
                        return newCred.user;
                    } catch (createErr) {
                        console.warn('[Firebase Auth Auto-provisioning Error]', createErr);
                    }
                }
            }
            throw error;
        }
    },

    async register(email, password, displayName) {
        const cleanEmail = email.trim().toLowerCase();
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        if (displayName) {
            try {
                await updateProfile(userCredential.user, { displayName });
            } catch (pErr) {
                console.warn('[Profile update error]', pErr);
            }
        }
        return userCredential.user;
    },

    async logout() {
        return await signOut(auth);
    },

    onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, callback);
    },

    getCurrentUser() {
        return auth.currentUser;
    }
};

// --- B. SERVICIO DE USUARIOS (Colección 'users') ---
export const UsersService = {
    async getAll() {
        try {
            const snap = await getDocs(collection(db, 'users'));
            const list = [];
            snap.forEach(docSnap => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });
            return list;
        } catch (e) {
            console.error('[Firestore Users.getAll Error]', e);
            return [];
        }
    },

    async getById(id) {
        try {
            const docRef = doc(db, 'users', id);
            const snap = await getDoc(docRef);
            return snap.exists() ? { id: snap.id, ...snap.data() } : null;
        } catch (e) {
            console.error('[Firestore Users.getById Error]', e);
            return null;
        }
    },

    async saveUser(userData) {
        try {
            const docId = userData.id || userData.uid || ('usr_' + Date.now());
            const docRef = doc(db, 'users', docId);
            await setDoc(docRef, { ...userData, id: docId, updatedAt: serverTimestamp() }, { merge: true });
            return docId;
        } catch (e) {
            console.error('[Firestore Users.saveUser Error]', e);
            throw e;
        }
    },

    async updateRole(id, role) {
        try {
            const docRef = doc(db, 'users', id);
            await updateDoc(docRef, { role, updatedAt: serverTimestamp() });
            return true;
        } catch (e) {
            console.error('[Firestore Users.updateRole Error]', e);
            throw e;
        }
    },

    async toggleActive(id, active) {
        try {
            const docRef = doc(db, 'users', id);
            await updateDoc(docRef, { active, updatedAt: serverTimestamp() });
            return true;
        } catch (e) {
            console.error('[Firestore Users.toggleActive Error]', e);
            throw e;
        }
    },

    async resetPassword(id, newPassword) {
        try {
            const docRef = doc(db, 'users', id);
            await updateDoc(docRef, { password: newPassword, updatedAt: serverTimestamp() });
            return true;
        } catch (e) {
            console.error('[Firestore Users.resetPassword Error]', e);
            throw e;
        }
    },

    async seedIfEmpty(defaultUsers) {
        try {
            const existing = await this.getAll();
            if (existing.length === 0 && Array.isArray(defaultUsers) && defaultUsers.length > 0) {
                console.log(`[Firestore] Sembrando ${defaultUsers.length} usuarios por defecto en colección "users"...`);
                const batch = writeBatch(db);
                defaultUsers.forEach(u => {
                    const docRef = doc(db, 'users', u.id || u.username);
                    const email = u.email || DEMO_USER_EMAILS[u.username] || `${u.username}@cfocopilot.com`;
                    batch.set(docRef, { ...u, email, seededAt: serverTimestamp() });
                });
                await batch.commit();
                console.log('[Firestore] ✓ Usuarios sembrados exitosamente.');
                return await this.getAll();
            }
            return existing;
        } catch (e) {
            console.error('[Firestore Users.seedIfEmpty Error]', e);
            return defaultUsers || [];
        }
    },

    subscribe(callback) {
        return onSnapshot(collection(db, 'users'), (snapshot) => {
            const list = [];
            snapshot.forEach(docSnap => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });
            callback(list);
        });
    }
};

// --- C. SERVICIO DE PRODUCTOS (Colección 'products') ---
export const ProductsService = {
    async syncImages(catalogWithImages) {
        try {
            const batch = writeBatch(db);
            catalogWithImages.forEach(p => {
                if (p.image) {
                    const docRef = doc(db, 'products', p.id);
                    batch.set(docRef, { image: p.image }, { merge: true });
                }
            });
            await batch.commit();
            console.log('[Firestore] Imágenes sincronizadas con éxito en la colección products.');
        } catch (e) {
            console.error('[Firestore syncImages Error]', e);
        }
    },

    async getAll() {
        try {
            const snap = await getDocs(collection(db, 'products'));
            const list = [];
            snap.forEach(docSnap => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });
            return list;
        } catch (e) {
            console.error('[Firestore Products.getAll Error]', e);
            return [];
        }
    },

    async save(product) {
        try {
            const id = product.id || ('ref_' + Date.now());
            const docRef = doc(db, 'products', id);
            await setDoc(docRef, { ...product, id, updatedAt: serverTimestamp() }, { merge: true });
            return id;
        } catch (e) {
            console.error('[Firestore Products.save Error]', e);
            throw e;
        }
    },

    async updateStock(id, newStock) {
        try {
            const docRef = doc(db, 'products', id);
            await updateDoc(docRef, { stock: newStock, updatedAt: serverTimestamp() });
            return true;
        } catch (e) {
            console.error('[Firestore Products.updateStock Error]', e);
            throw e;
        }
    },

    async delete(id) {
        try {
            const docRef = doc(db, 'products', id);
            await deleteDoc(docRef);
            return true;
        } catch (e) {
            console.error('[Firestore Products.delete Error]', e);
            throw e;
        }
    },

    async seedIfEmpty(catalog100) {
        try {
            const existing = await this.getAll();
            if (existing.length === 0 && Array.isArray(catalog100) && catalog100.length > 0) {
                console.log(`[Firestore] Sembrando ${catalog100.length} refacciones en colección "products"...`);
                const chunkSize = 250;
                for (let i = 0; i < catalog100.length; i += chunkSize) {
                    const chunk = catalog100.slice(i, i + chunkSize);
                    const batch = writeBatch(db);
                    chunk.forEach(p => {
                        const docRef = doc(db, 'products', p.id);
                        batch.set(docRef, { ...p, seededAt: serverTimestamp() });
                    });
                    await batch.commit();
                }
                console.log(`[Firestore] ✓ Catálogo de ${catalog100.length} refacciones sembrado con éxito.`);
                return await this.getAll();
            }
            return existing;
        } catch (e) {
            console.error('[Firestore Products.seedIfEmpty Error]', e);
            return catalog100 || [];
        }
    },

    subscribe(callback) {
        return onSnapshot(collection(db, 'products'), (snapshot) => {
            const list = [];
            snapshot.forEach(docSnap => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });
            callback(list);
        });
    }
};

// --- D. SERVICIO DE VENTAS (Colección 'sales') ---
export const SalesService = {
    async getAll(limitCount = 300) {
        try {
            const q = query(collection(db, 'sales'), orderBy('date', 'desc'), limit(limitCount));
            const snap = await getDocs(q);
            const list = [];
            snap.forEach(docSnap => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });
            return list;
        } catch (e) {
            try {
                const snap = await getDocs(collection(db, 'sales'));
                const list = [];
                snap.forEach(docSnap => {
                    list.push({ id: docSnap.id, ...docSnap.data() });
                });
                list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
                return list;
            } catch (fallbackErr) {
                console.error('[Firestore Sales.getAll Error]', fallbackErr);
                return [];
            }
        }
    },

    async create(saleData) {
        try {
            const id = saleData.id || ('sale_' + Date.now());
            const docRef = doc(db, 'sales', id);
            await setDoc(docRef, {
                ...saleData,
                id,
                createdAt: serverTimestamp()
            });
            return id;
        } catch (e) {
            console.error('[Firestore Sales.create Error]', e);
            throw e;
        }
    },

    async cancel(saleId, reason = '', cancelledBy = '') {
        try {
            const docRef = doc(db, 'sales', saleId);
            await updateDoc(docRef, {
                status: 'cancelled',
                cancelReason: reason,
                cancelledBy: cancelledBy,
                cancelledAt: serverTimestamp()
            });
            return true;
        } catch (e) {
            console.error('[Firestore Sales.cancel Error]', e);
            throw e;
        }
    },

    subscribe(callback) {
        return onSnapshot(collection(db, 'sales'), (snapshot) => {
            const list = [];
            snapshot.forEach(docSnap => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });
            list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            callback(list);
        });
    }
};

// --- E. SERVICIO DE ESTADÍSTICAS Y OPERACIÓN (Colección 'stats') ---
export const StatsService = {
    async getOverview() {
        try {
            const docRef = doc(db, 'stats', 'overview');
            const snap = await getDoc(docRef);
            return snap.exists() ? snap.data() : null;
        } catch (e) {
            console.error('[Firestore Stats.getOverview Error]', e);
            return null;
        }
    },

    async saveOverview(data) {
        try {
            const docRef = doc(db, 'stats', 'overview');
            await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
            return true;
        } catch (e) {
            console.error('[Firestore Stats.saveOverview Error]', e);
            return false;
        }
    },

    async getCurrentShift() {
        try {
            const docRef = doc(db, 'stats', 'current_shift');
            const snap = await getDoc(docRef);
            return snap.exists() ? snap.data() : null;
        } catch (e) {
            console.error('[Firestore Stats.getCurrentShift Error]', e);
            return null;
        }
    },

    async saveCurrentShift(shift) {
        try {
            const docRef = doc(db, 'stats', 'current_shift');
            if (shift) {
                await setDoc(docRef, { ...shift, updatedAt: serverTimestamp() });
            } else {
                await setDoc(docRef, { status: 'closed', updatedAt: serverTimestamp() });
            }
            return true;
        } catch (e) {
            console.error('[Firestore Stats.saveCurrentShift Error]', e);
            return false;
        }
    },

    async getShiftsHistory() {
        try {
            const docRef = doc(db, 'stats', 'shifts_history');
            const snap = await getDoc(docRef);
            if (snap.exists() && Array.isArray(snap.data().shifts)) {
                return snap.data().shifts;
            }
            return [];
        } catch (e) {
            console.error('[Firestore Stats.getShiftsHistory Error]', e);
            return [];
        }
    },

    async saveShiftsHistory(history) {
        try {
            const docRef = doc(db, 'stats', 'shifts_history');
            await setDoc(docRef, { shifts: history, updatedAt: serverTimestamp() }, { merge: true });
            return true;
        } catch (e) {
            console.error('[Firestore Stats.saveShiftsHistory Error]', e);
            return false;
        }
    },

    async getActivityLog() {
        try {
            const docRef = doc(db, 'stats', 'activity_log');
            const snap = await getDoc(docRef);
            if (snap.exists() && Array.isArray(snap.data().entries)) {
                return snap.data().entries;
            }
            return [];
        } catch (e) {
            console.error('[Firestore Stats.getActivityLog Error]', e);
            return [];
        }
    },

    async saveActivityLog(entries) {
        try {
            const docRef = doc(db, 'stats', 'activity_log');
            await setDoc(docRef, { entries, updatedAt: serverTimestamp() }, { merge: true });
            return true;
        } catch (e) {
            console.error('[Firestore Stats.saveActivityLog Error]', e);
            return false;
        }
    },

    async getCancelRequests() {
        try {
            const docRef = doc(db, 'stats', 'cancel_requests');
            const snap = await getDoc(docRef);
            if (snap.exists() && Array.isArray(snap.data().requests)) {
                return snap.data().requests;
            }
            return [];
        } catch (e) {
            console.error('[Firestore Stats.getCancelRequests Error]', e);
            return [];
        }
    },

    async saveCancelRequests(requests) {
        try {
            const docRef = doc(db, 'stats', 'cancel_requests');
            await setDoc(docRef, { requests, updatedAt: serverTimestamp() }, { merge: true });
            return true;
        } catch (e) {
            console.error('[Firestore Stats.saveCancelRequests Error]', e);
            return false;
        }
    },

    async getExpenses() {
        try {
            const docRef = doc(db, 'stats', 'expenses');
            const snap = await getDoc(docRef);
            if (snap.exists() && Array.isArray(snap.data().items)) {
                return snap.data().items;
            }
            return [];
        } catch (e) {
            console.error('[Firestore Stats.getExpenses Error]', e);
            return [];
        }
    },

    async saveExpenses(expensesList) {
        try {
            const docRef = doc(db, 'stats', 'expenses');
            await setDoc(docRef, { items: expensesList, updatedAt: serverTimestamp() }, { merge: true });
            return true;
        } catch (e) {
            console.error('[Firestore Stats.saveExpenses Error]', e);
            return false;
        }
    }
};

// =====================================================================
// EXPOSICIÓN GLOBAL PARA INTEGRACIÓN CON EL CÓDIGO EXISTENTE
// =====================================================================
window.FirebaseService = {
    app,
    auth,
    db,
    config: firebaseConfig,
    authModule: AuthService,
    users: UsersService,
    products: ProductsService,
    sales: SalesService,
    stats: StatsService,
    isInitialized: true
};

// Despachar evento para notificar al resto de la aplicación
window.dispatchEvent(new CustomEvent('firebase-initialized', { detail: window.FirebaseService }));
console.log('✓ Firebase SDK v9+ Modular inicializado con éxito en CFO Copilot (Proyecto: asesor-financiero-83679).');
