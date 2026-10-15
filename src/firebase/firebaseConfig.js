import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⚠️ IMPORTANTE: Completa las variables en tu archivo .env antes de iniciar.
// Ver .env para la lista de variables requeridas.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBPs2lOrcqX2p7XfOo1lpkSHSPqnH02KfU",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tienda-online-cf3c0.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tienda-online-cf3c0",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tienda-online-cf3c0.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "495457662078",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:495457662078:web:c4a6430dbad0455d84542f",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JYSLX7BYT4",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const auth = getAuth(app);
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
const storage = getStorage(app);

// Inicializar Analytics solo si es compatible
let analytics = null;

if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

const googleProvider = new GoogleAuthProvider();

// Exportar todos los servicios
export { app, auth, db, storage, analytics, googleProvider };