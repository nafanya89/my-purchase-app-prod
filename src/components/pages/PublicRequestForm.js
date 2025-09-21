import React, { useState, useEffect } from 'react';
import { Trash2, Download, FileUp, Send } from 'lucide-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { firebaseConfig } from '../../config/firebase';

export const PublicRequestForm = ({ db, adminUid }) => {
    const [title, setTitle] = useState('');
    const [requesterName, setRequesterName] = useState('');
    const [items, setItems] = useState([{ name: '', quantity: 1, pricePerUnit: 0, link: '', comment: '', ordered: false }]);
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setCaptcha({ num1: Math.floor(Math.random() * 10), num2: Math.floor(Math.random() * 10), answer: '' });
    }, []);

    const handleItemChange = (index, field, value) => {
        const updatedItems = items.map((item, i) => {
            if (i === index) {
                const updatedItem = { ...item, [field]: value };
                if(field === 'quantity' || field === 'pricePerUnit') {
                    updatedItem[field] = parseFloat(value) || 0;
                }
                return updatedItem;
            }
            return item;
        });
        setItems(updatedItems);
    };

    const handleAddItem = () => setItems([...items, { name: '', quantity: 1, pricePerUnit: 0, link: '', comment: '', ordered: false }]);
    const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));

    const handleDownloadTemplate = () => {
        const templateData = [{ 'Назва товару': '', 'Кількість': '', 'Ціна за одиницю': '', 'Посилання': '', 'Коментар': '' }];
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Шаблон");
        XLSX.writeFile(workbook, "Шаблон_запиту.xlsx");
    };

    const handleImportXLSX = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (typeof XLSX === 'undefined') { setError("Помилка: бібліотека для роботи з Excel не завантажена."); return; }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                const importedItems = json.map(row => ({
                    name: row['Назва товару'] || '',
                    quantity: parseFloat(row['Кількість']) || 1,
                    pricePerUnit: parseFloat(row['Ціна за одиницю']) || 0,
                    link: row['Посилання'] || '',
                    comment: row['Коментар'] || '',
                    ordered: false,
                }));

                if (importedItems.length > 0) {
                    setItems(importedItems);
                } else {
                    setError("Файл порожній або має неправильний формат.");
                }
            } catch (error) { console.error("Error parsing XLSX file:", error); setError("Не вдалося обробити файл."); }
        };
        reader.readAsArrayBuffer(file);
        event.target.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!title.trim() || !requesterName.trim()) { setError('Назва закупки та ваше ім\'я є обов\'язковими.'); return; }
        if (parseInt(captcha.answer, 10) !== captcha.num1 + captcha.num2) { setError('Неправильна відповідь на CAPTCHA.'); return; }
        const finalItems = items.filter(item => item.name.trim() !== '');
        if (finalItems.length === 0) { setError('Додайте хоча б один товар.'); return; }

        try {
            await addDoc(collection(db, `/artifacts/${firebaseConfig.projectId}/public/data/purchaseRequests`), {
                adminUid, title: title.trim(), requesterName: requesterName.trim(), items: finalItems, status: 'нове', createdAt: Timestamp.now(),
            });
            setSuccess(true);
        } catch (err) { console.error("Error submitting request:", err); setError('Не вдалося відправити запит.'); }
    };

    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 text-center bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-green-500">Запит успішно відправлено!</h1>
                <p className="mt-4 text-slate-600 dark:text-slate-300">Дякуємо! Ваш запит надіслано на розгляд.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-2xl p-8 space-y-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white">Створити запит на закупку</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Назва закупки (обов'язково)" className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"/>
                    <input type="text" value={requesterName} onChange={e => setRequesterName(e.target.value)} placeholder="Ваше ім'я (обов'язково)" className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"/>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Товари для закупки:</h3>
                        <div className="flex gap-2">
                            <button type="button" onClick={handleDownloadTemplate} className="text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1"><Download size={14}/> Скачати шаблон</button>
                            <label className="text-sm font-semibold text-teal-600 hover:text-teal-800 cursor-pointer flex items-center gap-1">
                                <FileUp size={14}/> Імпорт з Excel
                                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportXLSX} />
                            </label>
                        </div>
                    </div>
                    {items.map((item, index) => (
                        <div key={index} className="p-4 bg-slate-200 dark:bg-slate-700/50 rounded-lg space-y-3 relative">
                           {items.length > 1 && <button type="button" onClick={() => handleRemoveItem(index)} className="absolute top-2 right-2 text-red-500 p-1 rounded-full"><Trash2 size={16}/></button>}
                           <input type="text" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} placeholder={`Назва товару ${index + 1}`} className="w-full p-2 bg-white dark:bg-slate-600 rounded-lg"/>
                           <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Кількість</label>
                                    <input id={`quantity-${index}`} type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} placeholder="1" className="w-full p-2 bg-white dark:bg-slate-600 rounded-lg"/>
                                </div>
                                <div>
                                    <label htmlFor={`price-${index}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ціна за одиницю</label>
                                    <input id={`price-${index}`} type="number" value={item.pricePerUnit} onChange={(e) => handleItemChange(index, 'pricePerUnit', e.target.value)} placeholder="0.00" className="w-full p-2 bg-white dark:bg-slate-600 rounded-lg"/>
                                </div>
                            </div>
                            <input type="url" value={item.link} onChange={(e) => handleItemChange(index, 'link', e.target.value)} placeholder="Посилання" className="w-full p-2 bg-white dark:bg-slate-600 rounded-lg"/>
                            <textarea value={item.comment} onChange={(e) => handleItemChange(index, 'comment', e.target.value)} placeholder="Коментар" rows="2" className="w-full p-2 bg-white dark:bg-slate-600 rounded-lg"></textarea>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddItem} className="text-sm font-semibold text-blue-600 hover:underline">Додати ще один товар</button>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center gap-4">
                    <label htmlFor="captcha" className="font-semibold">{`Що буде ${captcha.num1} + ${captcha.num2}?`}</label>
                    <input id="captcha" type="number" value={captcha.answer} onChange={e => setCaptcha({...captcha, answer: e.target.value})} className="w-24 p-2 rounded-lg"/>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-blue-700"><Send size={20} className="inline-block mr-2"/> Відправити запит</button>
            </form>
        </div>
    );
};