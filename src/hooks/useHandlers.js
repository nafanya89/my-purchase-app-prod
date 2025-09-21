import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { collection, addDoc, doc, deleteDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';

export const useHandlers = (db, auth, user, setNotification, setConfirmation) => {
    const [storeLinks, setStoreLinks] = useState({});
    const [newPaymentLink, setNewPaymentLink] = useState({});

    const showConfirmationDialog = (title, message, onConfirm) => 
        setConfirmation({ isOpen: true, title, message, onConfirm });

    const handleSignOut = () => auth && signOut(auth);

    // --- My Items Handlers ---
    const handleAddItem = async (e, newItemName, closeModal) => {
        e.preventDefault();
        if (!newItemName.trim() || !db || !user) return;
        try {
            await addDoc(
                collection(db, `/artifacts/${firebaseConfig.projectId}/users/${user.uid}/items`), 
                { name: newItemName.trim(), stores: [], createdAt: Timestamp.now() }
            );
            closeModal();
            setNotification('Товар успішно додано!');
        } catch (err) {
            console.error("Error:", err);
            setNotification("Не вдалося додати товар.");
        }
    };

    const handleDeleteItem = (itemId) => showConfirmationDialog(
        'Підтвердити видалення',
        'Видалити цей товар?',
        async () => {
            try {
                await deleteDoc(
                    doc(db, `/artifacts/${firebaseConfig.projectId}/users/${user.uid}/items/${itemId}`)
                );
                setNotification('Товар видалено.');
                setConfirmation({ isOpen: false });
            } catch (err) {
                console.error("Error:", err);
                setNotification("Не вдалося видалити товар.");
            }
        }
    );

    const handleAddStoreLink = async (itemId) => {
        const linkData = storeLinks[itemId];
        if (!linkData || !linkData.name || !linkData.url || !linkData.price) {
            setNotification("Заповніть усі поля.");
            return;
        }
        try {
            await updateDoc(
                doc(db, `/artifacts/${firebaseConfig.projectId}/users/${user.uid}/items/${itemId}`),
                { 
                    stores: arrayUnion({
                        name: linkData.name.trim(),
                        url: linkData.url.trim(),
                        price: parseFloat(linkData.price)
                    })
                }
            );
            setStoreLinks(p => ({ ...p, [itemId]: { name: '', url: '', price: '' } }));
        } catch (err) {
            console.error("Error:", err);
            setNotification("Не вдалося додати посилання.");
        }
    };

    const handleStoreLinkChange = (itemId, field, value) => 
        setStoreLinks(p => ({ ...p, [itemId]: { ...(p[itemId] || {}), [field]: value } }));

    // --- History Handlers ---
    const handleCreateList = async (e, listBuilder, closeModal) => {
        e.preventDefault();
        if (!listBuilder.name.trim() || listBuilder.items.length === 0) {
            setNotification("Введіть назву та додайте товари.");
            return;
        }
        try {
            await addDoc(
                collection(db, `/artifacts/${firebaseConfig.projectId}/users/${user.uid}/shoppingLists`),
                {
                    name: listBuilder.name.trim(),
                    items: listBuilder.items,
                    createdAt: Timestamp.now(),
                    totalCost: listBuilder.items.reduce((acc, item) => acc + item.price, 0),
                    paymentLinks: []
                }
            );
            closeModal();
            setNotification('Список створено!');
        } catch (err) {
            console.error("Error:", err);
            setNotification("Не вдалося створити список.");
        }
    };

    const handleDeleteList = (listId) => showConfirmationDialog(
        'Підтвердити видалення',
        'Видалити цей список?',
        async () => {
            try {
                await deleteDoc(
                    doc(db, `/artifacts/${firebaseConfig.projectId}/users/${user.uid}/shoppingLists/${listId}`)
                );
                setNotification('Список видалено.');
                setConfirmation({ isOpen: false });
            } catch (err) {
                console.error("Error:", err);
                setNotification("Не вдалося видалити список.");
            }
        }
    );

    const handleNewPaymentLinkChange = (listId, field, value) => 
        setNewPaymentLink(p => ({ ...p, [listId]: { ...(p[listId] || {}), [field]: value } }));

    const handleAddPaymentLink = async (listId) => {
        const linkData = newPaymentLink[listId];
        if (!linkData || !linkData.name || !linkData.url) {
            setNotification("Заповніть назву та посилання.");
            return;
        }
        try {
            await updateDoc(
                doc(db, `/artifacts/${firebaseConfig.projectId}/users/${user.uid}/shoppingLists/${listId}`),
                { paymentLinks: arrayUnion({ name: linkData.name.trim(), url: linkData.url.trim() }) }
            );
            setNewPaymentLink(p => ({ ...p, [listId]: { name: '', url: '' }}));
        } catch (err) {
            console.error("Error adding payment link:", err);
            setNotification("Не вдалося додати посилання.");
        }
    };

    const handleDeletePaymentLink = async (listId, linkToDelete, shoppingLists) => {
        const list = shoppingLists.find(l => l.id === listId);
        if (!list) return;
        const updatedLinks = list.paymentLinks.filter(
            link => link.url !== linkToDelete.url || link.name !== linkToDelete.name
        );
        try {
            await updateDoc(
                doc(db, `/artifacts/${firebaseConfig.projectId}/users/${user.uid}/shoppingLists/${listId}`),
                { paymentLinks: updatedLinks }
            );
        } catch(err) {
            console.error("Error deleting payment link:", err);
            setNotification("Не вдалося видалити посилання.");
        }
    };

    // --- Needs Handlers ---
    const handleMoveRequestToHistory = async (requestId, purchaseRequests) => {
        const requestToMove = purchaseRequests.find(req => req.id === requestId);
        if (!requestToMove) return;
        const newList = {
            name: requestToMove.title,
            requesterName: requestToMove.requesterName,
            createdAt: Timestamp.now(),
            totalCost: requestToMove.items.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0),
            items: requestToMove.items.map(item => ({ ...item, itemName: item.name })),
            paymentLinks: []
        };
        try {
            await addDoc(
                collection(db, `/artifacts/${firebaseConfig.projectId}/users/${user.uid}/shoppingLists`),
                newList
            );
            await deleteDoc(
                doc(db, `/artifacts/${firebaseConfig.projectId}/public/data/purchaseRequests/${requestId}`)
            );
            setNotification('Запит переміщено в історію.');
        } catch (err) {
            console.error("Error moving request:", err);
            setNotification("Не вдалося перемістити запит.");
        }
    };

    const handleStatusChange = async (reqId, status, purchaseRequests) => {
        if (status === 'в історію покупок') {
            handleMoveRequestToHistory(reqId, purchaseRequests);
        } else {
            try {
                await updateDoc(
                    doc(db, `/artifacts/${firebaseConfig.projectId}/public/data/purchaseRequests/${reqId}`),
                    { status }
                );
                setNotification('Статус оновлено!');
            } catch (err) {
                console.error("Error updating status:", err);
                setNotification("Не вдалося оновити статус.");
            }
        }
    };

    const handleToggleItemOrdered = async (reqId, itemIndex, newOrderedState, purchaseRequests) => {
        const request = purchaseRequests.find(r => r.id === reqId);
        if (!request) return;
        const updatedItems = request.items.map((item, index) => 
            index === itemIndex ? { ...item, ordered: newOrderedState } : item
        );
        try {
            await updateDoc(
                doc(db, `/artifacts/${firebaseConfig.projectId}/public/data/purchaseRequests/${reqId}`),
                { items: updatedItems }
            );
        } catch (err) {
            console.error("Error toggling item status:", err);
            setNotification("Не вдалося змінити статус товару.");
        }
    };

    const handleDeleteRequest = (reqId) => showConfirmationDialog(
        'Підтвердити видалення',
        'Видалити цей запит?',
        async () => {
            try {
                await deleteDoc(
                    doc(db, `/artifacts/${firebaseConfig.projectId}/public/data/purchaseRequests/${reqId}`)
                );
                setNotification('Запит видалено.');
                setConfirmation({ isOpen: false });
            } catch (err) {
                console.error("Error:", err);
                setNotification("Не вдалося видалити запит.");
            }
        }
    );

    const handleCopyPublicUrl = () => {
        const url = `${window.location.origin}${window.location.pathname}?form=public&admin=${user.uid}`;
        navigator.clipboard.writeText(url)
            .then(() => setNotification('URL скопійовано!'))
            .catch(() => setNotification('Не вдалося скопіювати URL.'));
    };

    const handleCreateRequest = async (e, newRequest, closeModal) => {
        e.preventDefault();
        if (!newRequest.title.trim()) {
            setNotification("Назва закупки є обов'язковою.");
            return;
        }
        const finalItems = newRequest.items.filter(item => item.name.trim() !== '');
        if (finalItems.length === 0) {
            setNotification('Додайте хоча б один товар.');
            return;
        }
        try {
            await addDoc(
                collection(db, `/artifacts/${firebaseConfig.projectId}/public/data/purchaseRequests`),
                {
                    adminUid: user.uid,
                    title: newRequest.title.trim(),
                    requesterName: user.email,
                    items: finalItems,
                    status: 'нове',
                    createdAt: Timestamp.now()
                }
            );
            closeModal();
            setNotification('Запит створено!');
        } catch (err) {
            console.error("Error:", err);
            setNotification('Не вдалося створити запит.');
        }
    };

    const handleItemUpdate = async (reqId, itemIndex, field, value, purchaseRequests) => {
        const request = purchaseRequests.find(r => r.id === reqId);
        if (!request) return;
        const updatedItems = request.items.map((item, index) => 
            index === itemIndex ? { ...item, [field]: value } : item
        );
        try {
            await updateDoc(
                doc(db, `/artifacts/${firebaseConfig.projectId}/public/data/purchaseRequests/${reqId}`),
                { items: updatedItems }
            );
        } catch (err) {
            console.error("Error updating item:", err);
            setNotification("Не вдалося оновити поле товару.");
        }
    };

    return {
        storeLinks,
        newPaymentLink,
        handleSignOut,
        handleAddItem,
        handleDeleteItem,
        handleAddStoreLink,
        handleStoreLinkChange,
        handleCreateList,
        handleDeleteList,
        handleNewPaymentLinkChange,
        handleAddPaymentLink,
        handleDeletePaymentLink,
        handleStatusChange,
        handleToggleItemOrdered,
        handleDeleteRequest,
        handleCopyPublicUrl,
        handleCreateRequest,
        handleItemUpdate
    };
};
