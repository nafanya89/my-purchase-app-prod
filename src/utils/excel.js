import * as XLSX from 'xlsx';

export const importExcelFile = (file, onSuccess, onError) => {
    if (!file) return;
    if (typeof XLSX === 'undefined') {
        onError("Бібліотека для експорту не завантажена.");
        return;
    }

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
                ordered: false
            }));

            if (importedItems.length > 0) {
                onSuccess(importedItems);
            } else {
                onError("Файл порожній або має неправильний формат.");
            }
        } catch (error) {
            console.error("Error parsing XLSX file:", error);
            onError("Не вдалося обробити файл.");
        }
    };
    reader.readAsArrayBuffer(file);
};