import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';

export const useFirebase = () => {
    const [auth, setAuth] = useState(null);
    const [db, setDb] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [publicFormConfig, setPublicFormConfig] = useState({ show: false, adminUid: null });

    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);
            
            setAuth(authInstance);
            setDb(dbInstance);

            // Check URL parameters for public form
            const params = new URLSearchParams(window.location.search);
            const formAdminId = params.get('admin');
            if (params.get('form') === 'public' && formAdminId) {
                setPublicFormConfig({ show: true, adminUid: formAdminId });
            }

            const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (e) {
            console.error("Firebase init error:", e);
            setError("Помилка ініціалізації.");
            setLoading(false);
        }
    }, []);

    return { auth, db, user, loading, error, publicFormConfig };
};