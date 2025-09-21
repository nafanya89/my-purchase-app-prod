import React, { useState } from 'react';
import { LogOut, BellDot, Package, History } from 'lucide-react';

import { Notification, ConfirmationDialog } from './components/shared/Notifications';
import { AuthScreen } from './components/auth/AuthScreen';
import { MainPage } from './components/pages/MainPage';
import { HistoryPage } from './components/pages/HistoryPage';
import { NeedsPage } from './components/pages/NeedsPage';
import { PublicRequestForm } from './components/pages/PublicRequestForm';
import { AddItemModal } from './components/modals/AddItemModal';
import { AddListModal } from './components/modals/AddListModal';
import { AddRequestModal } from './components/modals/AddRequestModal';

import { useFirebase } from './hooks/useFirebase';
import { useData } from './hooks/useData';
import { useHandlers } from './hooks/useHandlers';
import { importExcelFile } from './utils/excel';

export default function App() {
    // --- Firebase & Data State ---
    const { auth, db, user, loading, error: appError, publicFormConfig } = useFirebase();
    const { items, shoppingLists, purchaseRequests } = useData(db, user);
    
    // --- UI State ---
    const [currentView, setCurrentView] = useState('purchaseNeeds');
    const [notification, setNotification] = useState('');
    const [confirmation, setConfirmation] = useState({ isOpen: false });

    // --- Modals State ---
    const [isAddItemModalOpen, setAddItemModalOpen] = useState(false);
    const [isAddListModalOpen, setAddListModalOpen] = useState(false);
    const [isAddRequestModalOpen, setAddRequestModalOpen] = useState(false);

    // --- Forms State ---
    const [newItemName, setNewItemName] = useState('');
    const [listBuilder, setListBuilder] = useState({ name: '', items: [] });
    const [itemSelector, setItemSelector] = useState({ itemId: '', storeIndex: '' });
    const [newRequest, setNewRequest] = useState({ 
        title: '', 
        items: [{ 
            name: '', 
            quantity: 1, 
            pricePerUnit: 0, 
            link: '', 
            comment: '', 
            ordered: false,
            purchaseStatus: 'не куплено'
        }] 
    });

    // --- Handlers ---
    const {
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
    } = useHandlers(db, auth, user, setNotification, setConfirmation);
    
    const selectedItemForStoreDropdown = items.find(i => i.id === itemSelector.itemId);

    // --- Render ---
    if (publicFormConfig.show) return <PublicRequestForm db={db} adminUid={publicFormConfig.adminUid} />;
    if (loading) return <div className="flex items-center justify-center h-screen">Завантаження...</div>;
    if (appError) return <div className="flex items-center justify-center h-screen bg-red-100 text-red-700">{appError}</div>;
    if (!user) return <AuthScreen auth={auth} />;

    const renderCurrentView = () => {
        switch (currentView) {
            case 'main':
                return (
                    <MainPage 
                        items={items}
                        storeLinks={storeLinks}
                        handleDeleteItem={handleDeleteItem}
                        handleAddStoreLink={handleAddStoreLink}
                        handleStoreLinkChange={handleStoreLinkChange}
                        openAddItemModal={() => setAddItemModalOpen(true)}
                    />
                );
            case 'history':
                return (
                    <HistoryPage 
                        shoppingLists={shoppingLists}
                        handleDeleteList={handleDeleteList}
                        openAddListModal={() => setAddListModalOpen(true)}
                        newPaymentLink={newPaymentLink}
                        handleNewPaymentLinkChange={handleNewPaymentLinkChange}
                        handleAddPaymentLink={handleAddPaymentLink}
                        handleDeletePaymentLink={handleDeletePaymentLink}
                    />
                );
            default:
                return (
                    <NeedsPage 
                        purchaseRequests={purchaseRequests}
                        handleStatusChange={(reqId, status) => handleStatusChange(reqId, status, purchaseRequests)}
                        handleDeleteRequest={handleDeleteRequest}
                        handleCopyPublicUrl={handleCopyPublicUrl}
                        openAddRequestModal={() => setAddRequestModalOpen(true)}
                        handleToggleItemOrdered={(reqId, idx, state) => handleToggleItemOrdered(reqId, idx, state, purchaseRequests)}
                        handleItemUpdate={(reqId, idx, field, value) => handleItemUpdate(reqId, idx, field, value, purchaseRequests)}
                    />
                );
        }
    };

    return (
        <>
            {notification && <Notification message={notification} onClose={() => setNotification('')} />}
            <ConfirmationDialog 
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation({ isOpen: false })}
                onConfirm={confirmation.onConfirm}
                title={confirmation.title}
                message={confirmation.message}
            />
            
            <AddItemModal 
                isOpen={isAddItemModalOpen}
                onClose={() => setAddItemModalOpen(false)}
                newItemName={newItemName}
                setNewItemName={setNewItemName}
                handleAddItem={(e) => handleAddItem(e, newItemName, () => {
                    setNewItemName('');
                    setAddItemModalOpen(false);
                })}
            />

            <AddListModal 
                isOpen={isAddListModalOpen}
                onClose={() => setAddListModalOpen(false)}
                listBuilder={listBuilder}
                setListBuilder={setListBuilder}
                items={items}
                itemSelector={itemSelector}
                setItemSelector={setItemSelector}
                selectedItemForStoreDropdown={selectedItemForStoreDropdown}
                handleAddItemToListBuilder={() => {
                    if (!itemSelector.itemId || itemSelector.storeIndex === '') return;
                    const item = items.find(i => i.id === itemSelector.itemId);
                    const store = item.stores[itemSelector.storeIndex];
                    setListBuilder(p => ({
                        ...p,
                        items: [...p.items, {
                            itemId: item.id,
                            itemName: item.name,
                            storeName: store.name,
                            storeUrl: store.url,
                            price: store.price,
                            tempId: Math.random()
                        }]
                    }));
                    setItemSelector({ itemId: '', storeIndex: '' });
                }}
                handleCreateList={(e) => handleCreateList(e, listBuilder, () => {
                    setListBuilder({ name: '', items: [] });
                    setAddListModalOpen(false);
                })}
            />

            <AddRequestModal 
                isOpen={isAddRequestModalOpen}
                onClose={() => setAddRequestModalOpen(false)}
                newRequest={newRequest}
                setNewRequest={setNewRequest}
                handleNewRequestItemChange={(index, field, value) => {
                    const updatedItems = newRequest.items.map((item, i) => {
                        if (i === index) {
                            const updatedItem = { ...item, [field]: value };
                            if(field === 'quantity' || field === 'pricePerUnit') {
                                updatedItem[field] = parseFloat(value) || 0;
                            }
                            return updatedItem;
                        }
                        return item;
                    });
                    setNewRequest(p => ({ ...p, items: updatedItems }));
                }}
                handleCreateRequest={(e) => handleCreateRequest(e, newRequest, () => {
                    setNewRequest({
                        title: '',
                        items: [{ 
                            name: '', 
                            quantity: 1, 
                            pricePerUnit: 0, 
                            link: '', 
                            comment: '', 
                            ordered: false,
                            purchaseStatus: 'не куплено'
                        }]
                    });
                    setAddRequestModalOpen(false);
                })}
                addNewRequestItem={() => setNewRequest(p => ({
                    ...p,
                    items: [...p.items, { 
                        name: '', 
                        quantity: 1, 
                        pricePerUnit: 0, 
                        link: '', 
                        comment: '', 
                        ordered: false,
                        purchaseStatus: 'не куплено'
                    }]
                }))}
                removeNewRequestItem={(index) => setNewRequest(p => ({
                    ...p,
                    items: p.items.filter((_, i) => i !== index)
                }))}
                handleImportXLSX={(event) => {
                    const file = event.target.files[0];
                    if (!file) return;
                    
                    importExcelFile(
                        file,
                        (importedItems) => {
                            setNewRequest(prev => ({ ...prev, items: importedItems }));
                            setNotification('Дані з файлу імпортовано!');
                        },
                        (error) => setNotification(error)
                    );
                    
                    event.target.value = '';
                }}
            />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Менеджер Закупок</h1>
                            <button 
                                onClick={handleSignOut}
                                className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
                            >
                                <LogOut size={18} /> Вийти
                            </button>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Email: {user.email}</p>
                        <nav className="mt-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-6">
                                <button 
                                    onClick={() => setCurrentView('purchaseNeeds')}
                                    className={`flex items-center gap-2 px-3 py-3 font-semibold border-b-2 ${
                                        currentView === 'purchaseNeeds' 
                                            ? 'border-blue-500 text-blue-600' 
                                            : 'border-transparent text-slate-500'
                                    }`}
                                >
                                    <BellDot size={18}/> Потреби в закупці
                                </button>
                                <button 
                                    onClick={() => setCurrentView('main')}
                                    className={`flex items-center gap-2 px-3 py-3 font-semibold border-b-2 ${
                                        currentView === 'main'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-slate-500'
                                    }`}
                                >
                                    <Package size={18}/> Мої товари
                                </button>
                                <button 
                                    onClick={() => setCurrentView('history')}
                                    className={`flex items-center gap-2 px-3 py-3 font-semibold border-b-2 ${
                                        currentView === 'history'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-slate-500'
                                    }`}
                                >
                                    <History size={18}/> Історія закупок
                                </button>
                            </div>
                        </nav>
                    </header>

                    <main>{renderCurrentView()}</main>
                </div>
            </div>
        </>
    );
}