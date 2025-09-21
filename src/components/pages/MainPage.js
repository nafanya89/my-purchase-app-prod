import React from 'react';
import { Trash2, Link, Store, PlusCircle } from 'lucide-react';

export const MainPage = ({ items, storeLinks, handleDeleteItem, handleAddStoreLink, handleStoreLinkChange, openAddItemModal }) => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Мої товари</h2>
            <button onClick={openAddItemModal} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"><PlusCircle size={20} /> Додати товар</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.length === 0 && <p className="text-slate-500 dark:text-slate-400 col-span-full">У вас ще немає жодного товару.</p>}
            {items.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md flex flex-col">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">{item.name}</h3>
                        <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full"><Trash2 size={18} /></button>
                    </div>
                    <div className="flex-grow space-y-2">
                        {item.stores?.map((store, index) => (
                            <div key={index} className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                                <div className="flex items-center gap-2"><Store size={16} className="text-slate-400"/><a href={store.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{store.name}</a></div>
                                <span className="font-semibold">{store.price.toFixed(2)} грн</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                        <p className="text-sm font-medium mb-2">Додати посилання:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input type="text" placeholder="Назва магазину" value={storeLinks[item.id]?.name || ''} onChange={e => handleStoreLinkChange(item.id, 'name', e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-600 rounded-md text-sm"/>
                            <input type="url" placeholder="URL" value={storeLinks[item.id]?.url || ''} onChange={e => handleStoreLinkChange(item.id, 'url', e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-600 rounded-md text-sm"/>
                            <input type="number" placeholder="Ціна" value={storeLinks[item.id]?.price || ''} onChange={e => handleStoreLinkChange(item.id, 'price', e.target.value)} className="p-2 bg-slate-100 dark:bg-slate-600 rounded-md text-sm"/>
                        </div>
                        <button onClick={() => handleAddStoreLink(item.id)} className="mt-2 w-full bg-slate-200 dark:bg-slate-600 text-sm font-semibold p-2 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500"><Link size={14} className="inline-block mr-1"/> Зберегти</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
