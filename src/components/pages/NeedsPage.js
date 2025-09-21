import React, { useState } from 'react';
import { PlusCircle, Copy, CheckSquare, Square, Trash2, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

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

export const NeedsPage = ({ 
    purchaseRequests, 
    handleStatusChange, 
    handleDeleteRequest, 
    handleCopyPublicUrl, 
    openAddRequestModal, 
    handleToggleItemOrdered, 
    handleItemUpdate 
}) => {
    const [activeTab, setActiveTab] = useState('нове');
    const [hiddenColumns, setHiddenColumns] = useState({
        pricePerUnit: false,
        comment: false,
        receipt: false,
        paymentType: false,
        purchaseStatus: false
    });
    const [expandedComments, setExpandedComments] = useState({});
    const statuses = ['нове', 'в прогресі', 'завершено'];

    const toggleColumn = (columnName) => {
        setHiddenColumns(prev => ({
            ...prev,
            [columnName]: !prev[columnName]
        }));
    };

    const toggleComment = (requestId) => {
        setExpandedComments(prev => ({
            ...prev,
            [requestId]: !prev[requestId]
        }));
    };
    const { totalSum, cashSum, invoiceSum } = purchaseRequests.reduce((acc, req) => {
        req.items.forEach(item => {
            const itemTotal = item.quantity * item.pricePerUnit;
            acc.totalSum += itemTotal;
            if (item.paymentType === PAYMENT_TYPES.CASH) {
                acc.cashSum += itemTotal;
            } else if (item.paymentType === PAYMENT_TYPES.INVOICE) {
                acc.invoiceSum += itemTotal;
            }
        });
        return acc;
    }, { totalSum: 0, cashSum: 0, invoiceSum: 0 });

    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-3xl font-bold">Потреби в закупці</h2>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="font-bold text-lg">Загальна сума: {totalSum.toFixed(2)} грн</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div>Сума готівка: {cashSum.toFixed(2)} грн</div>
                            <div>Сума рахунок: {invoiceSum.toFixed(2)} грн</div>
                        </div>
                    </div>
                    <button onClick={openAddRequestModal} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <PlusCircle size={20} /> Створити запит
                    </button>
                    <button onClick={handleCopyPublicUrl} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                        <Copy size={18} /> Копіювати URL
                    </button>
                </div>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {statuses.map(status => (
                        <button 
                            key={status} 
                            onClick={() => setActiveTab(status)} 
                            className={`${
                                activeTab === status 
                                    ? 'border-indigo-500 text-indigo-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                        >
                            {status}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="space-y-6">
                {purchaseRequests.filter(req => req.status === activeTab).map(req => {
                    const requestTotal = req.items.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
                    return (
                        <div key={req.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-xl pr-8">{req.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        від: <span className="font-medium">{req.requesterName}</span>, {req.createdAt.toDate().toLocaleString()}
                                    </p>
                                    <p className="font-bold text-md mt-2">Сума: {requestTotal.toFixed(2)} грн</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button 
                                            onClick={() => toggleComment(req.id)} 
                                            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
                                        >
                                            <MessageCircle size={16} />
                                            {expandedComments[req.id] ? 'Згорнути коментар' : 'Розгорнути коментар'}
                                        </button>
                                    </div>
                                    {expandedComments[req.id] && (
                                        <textarea
                                            value={req.comment || ''}
                                            onChange={(e) => handleItemUpdate(req.id, 'comment', e.target.value)}
                                            placeholder="Додати коментар до запиту..."
                                            className="w-full mt-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
                                            rows="2"
                                        />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleDeleteRequest(req.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-slate-700">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Замовлено</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Назва</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">К-сть</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                <div className="flex items-center gap-1">
                                                    Ціна за од.
                                                    <button onClick={() => toggleColumn('pricePerUnit')} className="hover:bg-gray-200 dark:hover:bg-slate-600 rounded p-1">
                                                        {hiddenColumns.pricePerUnit ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                                    </button>
                                                </div>
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Загальна ціна</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                <div className="flex items-center gap-1">
                                                    Коментар
                                                    <button onClick={() => toggleColumn('comment')} className="hover:bg-gray-200 dark:hover:bg-slate-600 rounded p-1">
                                                        {hiddenColumns.comment ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                                    </button>
                                                </div>
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                <div className="flex items-center gap-1">
                                                    Чек/Рахунок
                                                    <button onClick={() => toggleColumn('receipt')} className="hover:bg-gray-200 dark:hover:bg-slate-600 rounded p-1">
                                                        {hiddenColumns.receipt ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                                    </button>
                                                </div>
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                <div className="flex items-center gap-1">
                                                    Тип оплати
                                                    <button onClick={() => toggleColumn('paymentType')} className="hover:bg-gray-200 dark:hover:bg-slate-600 rounded p-1">
                                                        {hiddenColumns.paymentType ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                                    </button>
                                                </div>
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                <div className="flex items-center gap-1">
                                                    Статус покупки
                                                    <button onClick={() => toggleColumn('purchaseStatus')} className="hover:bg-gray-200 dark:hover:bg-slate-600 rounded p-1">
                                                        {hiddenColumns.purchaseStatus ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                                    </button>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {req.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2">
                                                    <button onClick={() => handleToggleItemOrdered(req.id, index, !item.ordered)}>
                                                        {item.ordered ? <CheckSquare className="text-green-500" /> : <Square className="text-slate-400" />}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-2 font-medium">
                                                    {item.link ? (
                                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                            {item.name}
                                                        </a>
                                                    ) : (item.name)}
                                                </td>
                                                <td className="px-4 py-2">{item.quantity}</td>
                                                {!hiddenColumns.pricePerUnit && <td className="px-4 py-2">{item.pricePerUnit?.toFixed(2) || '0.00'}</td>}
                                                <td className="px-4 py-2">{(item.quantity * item.pricePerUnit).toFixed(2)}</td>
                                                {!hiddenColumns.comment && <td className="px-4 py-2">{item.comment}</td>}
                                                {!hiddenColumns.receipt && (
                                                    <td className="px-4 py-2">
                                                        <input 
                                                            type="url" 
                                                            defaultValue={item.receiptLink || ''} 
                                                            onBlur={(e) => handleItemUpdate(req.id, index, 'receiptLink', e.target.value)} 
                                                            placeholder="Посилання..." 
                                                            className="w-full p-1 bg-slate-100 dark:bg-slate-600 rounded-md text-sm" 
                                                        />
                                                    </td>
                                                )}
                                                {!hiddenColumns.paymentType && (
                                                    <td className="px-4 py-2">
                                                        <select
                                                            value={item.paymentType || PAYMENT_TYPES.NONE}
                                                            onChange={(e) => handleItemUpdate(req.id, index, 'paymentType', e.target.value)}
                                                            className="w-full p-1 bg-slate-100 dark:bg-slate-600 rounded-md text-sm"
                                                        >
                                                            <option value={PAYMENT_TYPES.NONE}>-</option>
                                                            <option value={PAYMENT_TYPES.CASH}>{PAYMENT_TYPES.CASH}</option>
                                                            <option value={PAYMENT_TYPES.INVOICE}>{PAYMENT_TYPES.INVOICE}</option>
                                                        </select>
                                                    </td>
                                                )}
                                                {!hiddenColumns.purchaseStatus && (
                                                    <td className="px-4 py-2">
                                                        <select
                                                            value={item.purchaseStatus || PURCHASE_STATUSES.NOT_PURCHASED}
                                                            onChange={(e) => handleItemUpdate(req.id, index, 'purchaseStatus', e.target.value)}
                                                            className="w-full p-1 bg-slate-100 dark:bg-slate-600 rounded-md text-sm"
                                                        >
                                                            {Object.values(PURCHASE_STATUSES).map(status => (
                                                                <option key={status} value={status}>{status}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4">
                                <select 
                                    value={req.status} 
                                    onChange={(e) => handleStatusChange(req.id, e.target.value)} 
                                    className="w-full md:w-1/3 p-2 bg-slate-100 dark:bg-slate-700 rounded-md text-sm"
                                >
                                    <option value="нове">Нове</option>
                                    <option value="в прогресі">В прогресі</option>
                                    <option value="завершено">Завершено</option>
                                    {req.status === 'завершено' && <option value="в історію покупок">В історію покупок</option>}
                                </select>
                            </div>
                        </div>
                    );
                })}
                {purchaseRequests.filter(req => req.status === activeTab).length === 0 && (
                    <p className="text-sm text-slate-400">Немає запитів у цьому статусі</p>
                )}
            </div>
        </div>
    );
};