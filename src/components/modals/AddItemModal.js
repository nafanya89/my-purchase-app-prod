import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Modal } from '../shared/Modal';

export const AddItemModal = ({ isOpen, onClose, newItemName, setNewItemName, handleAddItem }) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Створити новий товар">
        <form onSubmit={handleAddItem} className="flex flex-col gap-4">
            <input 
                type="text" 
                value={newItemName} 
                onChange={(e) => setNewItemName(e.target.value)} 
                placeholder="Назва товару" 
                className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg"
            />
            <button type="submit" className="bg-blue-600 text-white font-semibold p-3 rounded-lg">
                <PlusCircle size={20} className="inline-block mr-2"/> Створити товар
            </button>
        </form>
    </Modal>
);
