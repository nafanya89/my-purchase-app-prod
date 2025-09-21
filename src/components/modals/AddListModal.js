import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Modal } from '../shared/Modal';

export const AddListModal = ({ 
    isOpen, 
    onClose, 
    listBuilder, 
    setListBuilder,
    items,
    itemSelector,
    setItemSelector,
    selectedItemForStoreDropdown,
    handleAddItemToListBuilder,
    handleCreateList 
}) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Створити список покупок">
        <form onSubmit={handleCreateList} className="flex flex-col gap-6">
            <input 
                type="text" 
                value={listBuilder.name} 
                onChange={(e) => setListBuilder(p => ({...p, name: e.target.value}))} 
                placeholder="Назва списку" 
                className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
            />
            <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-semibold">Додати товар</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select 
                        value={itemSelector.itemId} 
                        onChange={e => setItemSelector({ itemId: e.target.value, storeIndex: '' })} 
                        className="w-full p-2 bg-slate-100 dark:bg-slate-600 rounded-md"
                    >
                        <option value="">-- Виберіть товар --</option>
                        {items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                    <select 
                        value={itemSelector.storeIndex} 
                        onChange={e => setItemSelector(p => ({...p, storeIndex: e.target.value}))} 
                        disabled={!selectedItemForStoreDropdown} 
                        className="w-full p-2 bg-slate-100 dark:bg-slate-600 rounded-md disabled:opacity-50"
                    >
                        <option value="">-- Виберіть магазин --</option>
                        {selectedItemForStoreDropdown?.stores.map((store, index) => (
                            <option key={index} value={index}>{store.name} - {store.price.toFixed(2)} грн</option>
                        ))}
                    </select>
                </div>
                <button 
                    type="button" 
                    onClick={handleAddItemToListBuilder} 
                    disabled={!itemSelector.itemId || itemSelector.storeIndex === ''} 
                    className="w-full bg-slate-200 dark:bg-slate-600 font-semibold p-2 rounded-md disabled:opacity-50"
                >
                    Додати в список
                </button>
            </div>
            {listBuilder.items.length > 0 && (
                <div className="space-y-2">
                    {listBuilder.items.map((item) => (
                        <div key={item.tempId} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md">
                            <span>{item.itemName} <span className="text-xs">({item.storeName})</span></span>
                            <div className="flex items-center gap-4">
                                <span className="font-semibold">{item.price.toFixed(2)} грн</span>
                                <button 
                                    type="button" 
                                    onClick={() => setListBuilder(p => ({...p, items: p.items.filter(i => i.tempId !== item.tempId)}))} 
                                    className="text-red-500"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="text-right font-bold pt-2 border-t">
                        Загальна вартість: {listBuilder.items.reduce((acc, item) => acc + item.price, 0).toFixed(2)} грн
                    </div>
                </div>
            )}
            <button type="submit" className="w-full bg-green-600 text-white font-bold p-3 rounded-lg">
                <PlusCircle size={20} className="inline-block mr-2"/> Створити список
            </button>
        </form>
    </Modal>
);
