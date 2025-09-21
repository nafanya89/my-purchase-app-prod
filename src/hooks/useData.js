import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';

export const useData = (db, user) => {
    const [items, setItems] = useState([]);
    const [shoppingLists, setShoppingLists] = useState([]);
    const [purchaseRequests, setPurchaseRequests] = useState([]);

    useEffect(() => {
        if (!db || !user) {
            setItems([]);
            setShoppingLists([]);
            setPurchaseRequests([]);
            return;
        }

        const { uid } = user;
        const projectId = firebaseConfig.projectId;

        const unsubItems = onSnapshot(
            collection(db, `/artifacts/${projectId}/users/${uid}/items`), 
            (snap) => {
                const data = snap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
                setItems(data);
            }
        );

        const unsubLists = onSnapshot(
            collection(db, `/artifacts/${projectId}/users/${uid}/shoppingLists`), 
            (snap) => {
                const data = snap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
                setShoppingLists(data);
            }
        );

        const unsubRequests = onSnapshot(
            collection(db, `/artifacts/${projectId}/users/${uid}/purchaseRequests`), 
            (snap) => {
                const data = snap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
                setPurchaseRequests(data);
            }
        );

        return () => {
            unsubItems();
            unsubLists();
            unsubRequests();
        };
    }, [db, user]);

    return { items, shoppingLists, purchaseRequests };
};
