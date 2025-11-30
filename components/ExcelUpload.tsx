"use client";

import { useState } from 'react';
import { parseExcel } from '../lib/excelParser';
import { InvoiceData } from '../lib/types';
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';

interface ExcelUploadProps {
    onDataParsed: (invoices: InvoiceData[]) => void;
}

export default function ExcelUpload({ onDataParsed }: ExcelUploadProps) {
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setFileName(file.name);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const invoices = parseExcel(arrayBuffer);
            onDataParsed(invoices);
        } catch (error) {
            console.error("Error parsing Excel:", error);
            alert("Failed to parse Excel file. Please ensure it matches the required format.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative">
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {loading ? (
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            ) : fileName ? (
                <>
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-lg font-medium text-gray-700">{fileName}</p>
                    <p className="text-sm text-gray-500 mt-2">File processed successfully!</p>
                </>
            ) : (
                <>
                    <FileSpreadsheet className="h-12 w-12 text-blue-500 mb-4" />
                    <p className="text-lg font-medium text-gray-700">Click to upload Excel file</p>
                    <p className="text-sm text-gray-500 mt-2">Supported formats: .xlsx, .xls</p>
                </>
            )}
        </div>
    );
}
