import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, PlusCircle, Trash2 } from 'lucide-react';

export const HistoryPage = ({ shoppingLists, handleDeleteList, openAddListModal, newPaymentLink, handleNewPaymentLinkChange, handleAddPaymentLink, handleDeletePaymentLink }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const filteredLists = shoppingLists.filter(list => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        const nameMatch = list.name.toLowerCase().includes(term);
        const requesterMatch = list.requesterName && list.requesterName.toLowerCase().includes(term);
        const itemMatch = list.items.some(item => 
            (item.itemName && item.itemName.toLowerCase().includes(term)) ||
            (item.name && item.name.toLowerCase().includes(term)) ||
            (item.description && item.description.toLowerCase().includes(term)) ||
            (item.storeName && item.storeName.toLowerCase().includes(term))
        );
        return nameMatch || requesterMatch || itemMatch;
    });

    const paginatedLists = filteredLists.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredLists.length / ITEMS_PER_PAGE);
    const totalSumOfFilteredLists = filteredLists.reduce((acc, list) => acc + (list.totalCost || 0), 0);

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <div className="relative flex-grow min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" placeholder="Пошук по всіх полях..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full p-2 pl-10 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600"/>
                </div>
                <div className="flex items-center gap-4">
                    <div className="font-bold text-lg">Загальна сума: {totalSumOfFilteredLists.toFixed(2)} грн</div>
                    <button onClick={openAddListModal} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 flex-shrink-0"><PlusCircle size={20} /> Створити список</button>
                </div>
            </div>
            <div className="space-y-4">
                {paginatedLists.length === 0 && <p className="text-slate-500 dark:text-slate-400">Нічого не знайдено.</p>}
                {paginatedLists.map(list => (
                    <div key={list.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-lg">{list.name}</h3>
                                <p className="text-xs text-slate-500">{list.createdAt.toDate().toLocaleDateString()}{list.requesterName && ` (від: ${list.requesterName})`}</p>
                            </div>
                            <button onClick={() => handleDeleteList(list.id)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={18} /></button>
                        </div>
                        <div className="space-y-2">
                            {list.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                                    <div>
                                        <span>{item.itemName || item.name}</span>
                                        {item.storeName && <span className="text-slate-500"> ({item.storeName})</span>}
                                        {item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
                                    </div>
                                    {item.price !== undefined && <span className="font-semibold">{item.price.toFixed(2)} грн</span>}
                                </div>
                            ))}
                        </div>
                        {list.totalCost > 0 && <div className="mt-3 pt-3 border-t flex justify-end items-center font-bold"><span className="mr-2">Загальна вартість:</span><span>{list.totalCost.toFixed(2)} грн</span></div>}
                        
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                            <h4 className="text-sm font-semibold mb-2">Платіжки та чеки:</h4>
                            {list.paymentLinks?.length > 0 && (
                                <div className="space-y-1 mb-3">
                                    {list.paymentLinks.map((link, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm bg-slate-100 dark:bg-slate-700 p-1.5 rounded">
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{link.name}</a>
                                            <button onClick={() => handleDeletePaymentLink(list.id, link)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2 items-center">
                                <input type="text" placeholder="Назва (напр., Чек Сільпо)" value={newPaymentLink[list.id]?.name || ''} onChange={(e) => handleNewPaymentLinkChange(list.id, 'name', e.target.value)} className="flex-grow p-2 bg-slate-100 dark:bg-slate-600 rounded-md text-sm"/>
                                <input type="url" placeholder="Посилання на чек" value={newPaymentLink[list.id]?.url || ''} onChange={(e) => handleNewPaymentLinkChange(list.id, 'url', e.target.value)} className="flex-grow p-2 bg-slate-100 dark:bg-slate-600 rounded-md text-sm"/>
                                <button onClick={() => handleAddPaymentLink(list.id)} className="bg-slate-200 dark:bg-slate-500 p-2 rounded-md hover:bg-slate-300 dark:hover:bg-slate-400"><PlusCircle size={18} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center gap-4">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-md bg-slate-200 dark:bg-slate-700 disabled:opacity-50"><ChevronLeft size={20} /></button>
                    <span>Сторінка {currentPage} з {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-md bg-slate-200 dark:bg-slate-700 disabled:opacity-50"><ChevronRight size={20} /></button>
                </div>
            )}
        </div>
    );
};
