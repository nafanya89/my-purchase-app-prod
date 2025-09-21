import React, { useState } from 'react';
import { PlusCircle, Copy, CheckSquare, Square, Trash2, ChevronLeft, ChevronRight, MessageCircle, Group } from 'lucide-react';

const SITE_COLORS = [
    'text-purple-700 dark:text-purple-400',
    'text-green-700 dark:text-green-400',
    'text-blue-700 dark:text-blue-400',
    'text-red-700 dark:text-red-400',
    'text-pink-700 dark:text-pink-400',
    'text-indigo-700 dark:text-indigo-400',
    'text-orange-700 dark:text-orange-400',
    'text-teal-700 dark:text-teal-400',
    'text-cyan-700 dark:text-cyan-400',
    'text-lime-700 dark:text-lime-400',
    'text-emerald-700 dark:text-emerald-400',
    'text-sky-700 dark:text-sky-400',
    'text-violet-700 dark:text-violet-400',
    'text-fuchsia-700 dark:text-fuchsia-400',
    'text-rose-700 dark:text-rose-400',
    'text-amber-700 dark:text-amber-400',
    'text-yellow-700 dark:text-yellow-400',
    'text-slate-700 dark:text-slate-400',
    'text-neutral-700 dark:text-neutral-400',
    'text-stone-700 dark:text-stone-400'
];

const getBaseUrl = (url) => {
    if (!url) return null;
    
    // Видаляємо протокол та www, якщо вони є
    const cleanUrl = url
        .replace(/^https?:\/\//, '') // видаляємо протокол
        .replace(/^www\./, '');      // видаляємо www.
    
    // Беремо все до першої крапки
    const baseDomain = cleanUrl.split('.')[0];
    return baseDomain || null;
};

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
    const [groupedRequests, setGroupedRequests] = useState({});
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

    const toggleGroupBySite = (requestId) => {
        setGroupedRequests(prev => ({
            ...prev,
            [requestId]: !prev[requestId]
        }));
    };

    const getGroupedItems = (items, requestId) => {
        if (!groupedRequests[requestId]) return items;

        // Групуємо товари за базовими URL
        const itemsByBase = items.reduce((acc, item) => {
            const baseUrl = getBaseUrl(item.link);
            if (!baseUrl) {
                if (!acc.noSite) acc.noSite = [];
                acc.noSite.push(item);
                return acc;
            }
            if (!acc[baseUrl]) acc[baseUrl] = [];
            acc[baseUrl].push(item);
            return acc;
        }, {});

        // Знаходимо групи з більше ніж одним товаром
        const groups = Object.entries(itemsByBase)
            .filter(([baseUrl, items]) => baseUrl !== 'noSite' && items.length > 1)
            .sort((a, b) => b[1].length - a[1].length);

        // Створюємо унікальний набір кольорів для цього списку
        const shuffledColors = [...SITE_COLORS]
            .sort(() => Math.random() - 0.5)
            .slice(0, groups.length);

        // Призначаємо кольори групам
        const baseColors = groups.reduce((acc, [baseUrl], index) => {
            acc[baseUrl] = shuffledColors[index];
            return acc;
        }, {});

        // Створюємо мапу для порядку груп
        const groupOrder = {};
        let orderIndex = 0;
        groups.forEach(([baseUrl]) => {
            groupOrder[baseUrl] = orderIndex++;
        });

        // Сортуємо всі товари
        const sortedItems = [...items].sort((a, b) => {
            const baseA = getBaseUrl(a.link);
            const baseB = getBaseUrl(b.link);
            
            // Якщо обидва товари мають групи
            if (baseA && baseB && baseColors[baseA] && baseColors[baseB]) {
                // Якщо товари з різних груп, сортуємо за порядком груп
                if (baseA !== baseB) {
                    return groupOrder[baseA] - groupOrder[baseB];
                }
                // Якщо з однієї групи, зберігаємо поточний порядок
                return 0;
            }
            
            // Якщо тільки перший товар має групу
            if (baseA && baseColors[baseA]) {
                return -1;
            }
            // Якщо тільки другий товар має групу
            if (baseB && baseColors[baseB]) {
                return 1;
            }
            // Якщо жоден товар не має групи, зберігаємо поточний порядок
            return 0;
        });

        return sortedItems.map(item => {
            const baseUrl = getBaseUrl(item.link);
            return {
                ...item,
                color: baseUrl ? baseColors[baseUrl] : null
            };
        });
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
                                    <div className="flex items-center gap-4 mt-2">
                                        <button 
                                            onClick={() => toggleComment(req.id)} 
                                            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
                                        >
                                            <MessageCircle size={16} />
                                            {expandedComments[req.id] ? 'Згорнути коментар' : 'Розгорнути коментар'}
                                        </button>
                                        <button 
                                            onClick={() => toggleGroupBySite(req.id)} 
                                            className={`${groupedRequests[req.id] ? 'text-green-600 dark:text-green-400' : 'text-gray-500'} hover:text-gray-700 flex items-center gap-1 text-sm`}
                                        >
                                            <Group size={16} />
                                            {groupedRequests[req.id] ? 'Скасувати групування' : 'Знайти однакові сайти'}
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
                                            {groupedRequests[req.id] && (
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Магазин</th>
                                            )}
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">К-сть</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" style={{ width: hiddenColumns.pricePerUnit ? '40px' : '150px', transition: 'width 500ms ease-in-out' }}>
                                                <div className="flex items-center gap-1">
                                                    <div className="overflow-hidden transition-all duration-500 ease-in-out" style={{ maxWidth: hiddenColumns.pricePerUnit ? '0' : '110px', opacity: hiddenColumns.pricePerUnit ? 0 : 1 }}>
                                                        <span className="whitespace-nowrap">Ціна за од.</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => toggleColumn('pricePerUnit')} 
                                                        className="hover:bg-gray-200 dark:hover:bg-slate-600 rounded p-1 transition-colors shrink-0"
                                                        title={hiddenColumns.pricePerUnit ? "Показати ціну за одиницю" : "Приховати ціну за одиницю"}
                                                    >
                                                        {hiddenColumns.pricePerUnit ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                                                    </button>
                                                </div>
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" style={{ width: '150px' }}>Загальна ціна</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" style={{ width: hiddenColumns.comment ? '40px' : '200px', transition: 'width 500ms ease-in-out' }}>
                                                <div className="flex items-center gap-1">
                                                    <div className="overflow-hidden transition-all duration-500 ease-in-out" style={{ maxWidth: hiddenColumns.comment ? '0' : '160px', opacity: hiddenColumns.comment ? 0 : 1 }}>
                                                        <span className="whitespace-nowrap">Коментар</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => toggleColumn('comment')} 
                                                        className="hover:bg-gray-200 dark:hover:bg-slate-600 rounded p-1 transition-colors shrink-0"
                                                        title={hiddenColumns.comment ? "Показати коментарі" : "Приховати коментарі"}
                                                    >
                                                        {hiddenColumns.comment ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                                                    </button>
                                                </div>
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" style={{ width: hiddenColumns.receipt ? '40px' : '200px', transition: 'width 500ms ease-in-out' }}>
                                                <div className="flex items-center gap-1">
                                                    <div className="overflow-hidden transition-all duration-500 ease-in-out" style={{ maxWidth: hiddenColumns.receipt ? '0' : '160px', opacity: hiddenColumns.receipt ? 0 : 1 }}>
                                                        <span className="whitespace-nowrap">Чек/Рахунок</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => toggleColumn('receipt')} 
                                                        className="hover:bg-gray-200 dark:hover:bg-slate-600 rounded p-1 transition-colors shrink-0"
                                                        title={hiddenColumns.receipt ? "Показати чеки/рахунки" : "Приховати чеки/рахунки"}
                                                    >
                                                        {hiddenColumns.receipt ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                                                    </button>
                                                </div>
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" style={{ width: hiddenColumns.paymentType ? '40px' : '150px', transition: 'width 500ms ease-in-out' }}>
                                                <div className="flex items-center gap-1">
                                                    <div className="overflow-hidden transition-all duration-500 ease-in-out" style={{ maxWidth: hiddenColumns.paymentType ? '0' : '110px', opacity: hiddenColumns.paymentType ? 0 : 1 }}>
                                                        <span className="whitespace-nowrap">Тип оплати</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => toggleColumn('paymentType')} 
                                                        className="hover:bg-gray-200 dark:hover:bg-slate-600 rounded p-1 transition-colors shrink-0"
                                                        title={hiddenColumns.paymentType ? "Показати типи оплати" : "Приховати типи оплати"}
                                                    >
                                                        {hiddenColumns.paymentType ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                                                    </button>
                                                </div>
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" style={{ width: hiddenColumns.purchaseStatus ? '40px' : '180px', transition: 'width 500ms ease-in-out' }}>
                                                <div className="flex items-center gap-1">
                                                    <div className="overflow-hidden transition-all duration-500 ease-in-out" style={{ maxWidth: hiddenColumns.purchaseStatus ? '0' : '140px', opacity: hiddenColumns.purchaseStatus ? 0 : 1 }}>
                                                        <span className="whitespace-nowrap">Статус покупки</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => toggleColumn('purchaseStatus')} 
                                                        className="hover:bg-gray-200 dark:hover:bg-slate-600 rounded p-1 transition-colors shrink-0"
                                                        title={hiddenColumns.purchaseStatus ? "Показати статуси покупки" : "Приховати статуси покупки"}
                                                    >
                                                        {hiddenColumns.purchaseStatus ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                                                    </button>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {getGroupedItems(req.items, req.id).map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2">
                                                    <button onClick={() => handleToggleItemOrdered(req.id, index, !item.ordered)}>
                                                        {item.ordered ? <CheckSquare className="text-green-500" /> : <Square className="text-slate-400" />}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-2 font-medium">
                                                    {item.link ? (
                                                        <a 
                                                            href={item.link} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className={`hover:underline ${item.color || 'text-blue-500'}`}
                                                        >
                                                            {item.name}
                                                        </a>
                                                    ) : (item.name)}
                                                </td>
                                                {groupedRequests[req.id] && (
                                                    <td className={`px-4 py-2 ${item.color || 'text-gray-500'}`}>
                                                        {getBaseUrl(item.link) || '-'}
                                                    </td>
                                                )}
                                                <td className="px-4 py-2">{item.quantity}</td>
                                                <td className="px-4 py-2" style={{ width: hiddenColumns.pricePerUnit ? '0' : '150px', transition: 'width 500ms ease-in-out', overflow: 'hidden' }}>
                                                    {(!hiddenColumns.pricePerUnit && (item.pricePerUnit?.toFixed(2) || '0.00'))}
                                                </td>
                                                <td className="px-4 py-2" style={{ width: '150px' }}>{(item.quantity * item.pricePerUnit).toFixed(2)}</td>
                                                <td className="px-4 py-2" style={{ width: hiddenColumns.comment ? '0' : '200px', transition: 'width 500ms ease-in-out', overflow: 'hidden' }}>
                                                    {!hiddenColumns.comment && item.comment}
                                                </td>
                                                <td className="px-4 py-2" style={{ width: hiddenColumns.receipt ? '0' : '200px', transition: 'width 500ms ease-in-out', overflow: 'hidden' }}>
                                                    {!hiddenColumns.receipt && (
                                                        <input 
                                                            type="url" 
                                                            defaultValue={item.receiptLink || ''} 
                                                            onBlur={(e) => handleItemUpdate(req.id, index, 'receiptLink', e.target.value)} 
                                                            placeholder="Посилання..." 
                                                            className="w-full p-1 bg-slate-100 dark:bg-slate-600 rounded-md text-sm" 
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-4 py-2" style={{ width: hiddenColumns.paymentType ? '0' : '150px', transition: 'width 500ms ease-in-out', overflow: 'hidden' }}>
                                                    {!hiddenColumns.paymentType && (
                                                        <select
                                                            value={item.paymentType || PAYMENT_TYPES.NONE}
                                                            onChange={(e) => handleItemUpdate(req.id, index, 'paymentType', e.target.value)}
                                                            className="w-full p-1 bg-slate-100 dark:bg-slate-600 rounded-md text-sm"
                                                        >
                                                            <option value={PAYMENT_TYPES.NONE}>-</option>
                                                            <option value={PAYMENT_TYPES.CASH}>{PAYMENT_TYPES.CASH}</option>
                                                            <option value={PAYMENT_TYPES.INVOICE}>{PAYMENT_TYPES.INVOICE}</option>
                                                        </select>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2" style={{ width: hiddenColumns.purchaseStatus ? '0' : '180px', transition: 'width 500ms ease-in-out', overflow: 'hidden' }}>
                                                    {!hiddenColumns.purchaseStatus && (
                                                        <select
                                                            value={item.purchaseStatus || PURCHASE_STATUSES.NOT_PURCHASED}
                                                            onChange={(e) => handleItemUpdate(req.id, index, 'purchaseStatus', e.target.value)}
                                                            className="w-full p-1 bg-slate-100 dark:bg-slate-600 rounded-md text-sm"
                                                        >
                                                            {Object.values(PURCHASE_STATUSES).map(status => (
                                                                <option key={status} value={status}>{status}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>
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