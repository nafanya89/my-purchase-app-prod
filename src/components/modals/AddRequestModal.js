import React from 'react';
import { FileUp, Send, Trash2 } from 'lucide-react';
import { Modal } from '../shared/Modal';

const PURCHASE_STATUSES = {
    NOT_PURCHASED: 'не куплено',
    WAITING_INVOICE: 'очікування рахунок',
    WAITING_PAYMENT: 'очікування оплати',
    RECEIVED: 'отримано'
};

const PAYMENT_TYPES = {
    NONE: '',
    CASH: 'готівка',
    INVOICE: 'рахунок'
};

export const AddRequestModal = ({ 
    isOpen, 
    onClose, 
    newRequest, 
    setNewRequest,
    handleNewRequestItemChange,
    handleCreateRequest,
    addNewRequestItem,
    removeNewRequestItem,
    handleImportXLSX
}) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Створити запит на закупку">
        <form onSubmit={handleCreateRequest} className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <input 
                    type="text" 
                    value={newRequest.title} 
                    onChange={(e) => setNewRequest(p => ({...p, title: e.target.value}))} 
                    placeholder="Назва закупки" 
                    className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
                />
                <label className="ml-4 cursor-pointer bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors">
                    <FileUp size={20} className="inline-block mr-2"/> Імпорт
                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportXLSX} />
                </label>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold">Товари:</h3>
                {newRequest.items.map((item, index) => (
                    <div key={index} className="p-4 bg-slate-200 dark:bg-slate-700/50 rounded-lg space-y-3 relative">
                        {newRequest.items.length > 1 && (
                            <button 
                                type="button" 
                                onClick={() => removeNewRequestItem(index)} 
                                className="absolute top-2 right-2 text-red-500 p-1"
                            >
                                <Trash2 size={16}/>
                            </button>
                        )}
                        <input 
                            type="text" 
                            value={item.name} 
                            onChange={(e) => handleNewRequestItemChange(index, 'name', e.target.value)} 
                            placeholder={`Назва товару ${index + 1}`} 
                            className="w-full p-2 bg-white dark:bg-slate-600 rounded-lg"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input 
                                type="number" 
                                value={item.quantity} 
                                onChange={(e) => handleNewRequestItemChange(index, 'quantity', e.target.value)} 
                                placeholder="К-сть" 
                                className="w-full p-2 bg-white dark:bg-slate-600 rounded-lg"
                            />
                            <input 
                                type="number" 
                                value={item.pricePerUnit} 
                                onChange={(e) => handleNewRequestItemChange(index, 'pricePerUnit', e.target.value)} 
                                placeholder="Ціна за од." 
                                className="w-full p-2 bg-white dark:bg-slate-600 rounded-lg"
                            />
                        </div>
                        <input 
                            type="url" 
                            value={item.link} 
                            onChange={(e) => handleNewRequestItemChange(index, 'link', e.target.value)} 
                            placeholder="Посилання" 
                            className="w-full p-2 bg-white dark:bg-slate-600 rounded-lg"
                        />
                        <textarea 
                            value={item.comment} 
                            onChange={(e) => handleNewRequestItemChange(index, 'comment', e.target.value)} 
                            placeholder="Коментар" 
                            rows="2" 
                            className="w-full p-2 bg-white dark:bg-slate-600 rounded-lg"
                        />
                        <select
                            value={item.paymentType || PAYMENT_TYPES.NONE}
                            onChange={(e) => handleNewRequestItemChange(index, 'paymentType', e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-600 rounded-lg"
                        >
                            <option value={PAYMENT_TYPES.NONE}>-</option>
                            <option value={PAYMENT_TYPES.CASH}>{PAYMENT_TYPES.CASH}</option>
                            <option value={PAYMENT_TYPES.INVOICE}>{PAYMENT_TYPES.INVOICE}</option>
                        </select>
                        <select
                            value={item.purchaseStatus || PURCHASE_STATUSES.NOT_PURCHASED}
                            onChange={(e) => handleNewRequestItemChange(index, 'purchaseStatus', e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-600 rounded-lg"
                        >
                            {Object.values(PURCHASE_STATUSES).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                ))}
                <button 
                    type="button" 
                    onClick={addNewRequestItem} 
                    className="text-sm font-semibold text-blue-600 hover:underline"
                >
                    Додати товар
                </button>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold p-3 rounded-lg">
                <Send size={20} className="inline-block mr-2"/> Створити запит
            </button>
        </form>
    </Modal>
);