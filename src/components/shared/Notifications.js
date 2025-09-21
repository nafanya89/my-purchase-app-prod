import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from './Modal';

export const Notification = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    return <div className="fixed bottom-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">{message}</div>;
};

export const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="flex items-start gap-4">
            <AlertCircle className="text-red-500 w-12 h-12" />
            <div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-slate-600 dark:text-slate-300 mt-2 mb-6">{message}</p>
            </div>
        </div>
        <div className="flex justify-end gap-4">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold">Скасувати</button>
            <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold">Так, видалити</button>
        </div>
    </Modal>
);