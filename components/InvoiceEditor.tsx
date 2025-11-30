"use client";

import { useState, useEffect } from 'react';
import { InvoiceData, Product, Seller, Customer } from '../lib/types';
import { generateInvoicePDF } from '../lib/pdfGenerator';
import { ArrowLeft, Download, Plus, Trash2, RefreshCw } from 'lucide-react';

interface InvoiceEditorProps {
    initialData: InvoiceData;
    onBack: () => void;
}

export default function InvoiceEditor({ initialData, onBack }: InvoiceEditorProps) {
    const [data, setData] = useState<InvoiceData>(initialData);
    const [pdfUrl, setPdfUrl] = useState<string>('');

    // Update PDF preview whenever data changes
    useEffect(() => {
        const timer = setTimeout(() => {
            const doc = generateInvoicePDF(data);
            const pdfDataUri = doc.output('datauristring');
            setPdfUrl(pdfDataUri);
        }, 500); // Debounce to avoid lag

        return () => clearTimeout(timer);
    }, [data]);

    const handleSellerChange = (field: keyof Seller, value: string) => {
        setData(prev => ({ ...prev, seller: { ...prev.seller, [field]: value } }));
    };

    const handleCustomerChange = (field: keyof Customer, value: string) => {
        setData(prev => ({ ...prev, customer: { ...prev.customer, [field]: value } }));
    };

    const handleInvoiceChange = (field: keyof InvoiceData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleProductChange = (index: number, field: keyof Product, value: any) => {
        const newProducts = [...data.products];
        newProducts[index] = { ...newProducts[index], [field]: value };
        setData(prev => ({ ...prev, products: newProducts }));
    };

    const addProduct = () => {
        setData(prev => ({
            ...prev,
            products: [...prev.products, { details: '', hsnCode: '', qty: 1, amount: 0, gstPercent: 18 }]
        }));
    };

    const removeProduct = (index: number) => {
        setData(prev => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index)
        }));
    };

    const handleDownload = () => {
        const doc = generateInvoicePDF(data);
        doc.save(`Invoice_${data.invoiceNo}.pdf`);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
                <button onClick={onBack} className="flex items-center cursor-pointer gap-2 text-gray-600 hover:text-gray-900">
                    <ArrowLeft size={20} /> Back to List
                </button>
                <h2 className="font-bold text-xl text-gray-800">Editing Invoice #{data.invoiceNo}</h2>
                <button onClick={handleDownload} className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                    <Download size={18} /> Download PDF
                </button>
            </div>

            {/* Main Content - Split View */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Editor Form */}
                <div className="w-1/2 overflow-y-auto p-6 border-r border-gray-200 bg-white">
                    <div className="space-y-8">

                        {/* Seller Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Seller Details</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Seller Name</label>
                                    <input className="w-full border p-2 rounded text-sm text-black" value={data.seller.name} onChange={e => handleSellerChange('name', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Address</label>
                                    <textarea className="w-full border p-2 rounded text-sm text-black" rows={2} value={data.seller.address} onChange={e => handleSellerChange('address', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Pincode</label>
                                        <input className="w-full border p-2 rounded text-sm text-black" value={data.seller.pincode} onChange={e => handleSellerChange('pincode', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">GST No</label>
                                        <input className="w-full border p-2 rounded text-sm text-black" value={data.seller.gstNo} onChange={e => handleSellerChange('gstNo', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Customer Details</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Customer Name</label>
                                    <input className="w-full border p-2 rounded text-sm text-black" value={data.customer.name} onChange={e => handleCustomerChange('name', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Address</label>
                                    <textarea className="w-full border p-2 rounded text-sm text-black" rows={2} value={data.customer.address} onChange={e => handleCustomerChange('address', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Pincode</label>
                                        <input className="w-full border p-2 rounded text-sm text-black" value={data.customer.pincode} onChange={e => handleCustomerChange('pincode', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">GST No</label>
                                        <input className="w-full border p-2 rounded text-sm text-black" value={data.customer.gstNo} onChange={e => handleCustomerChange('gstNo', e.target.value)} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-medium text-gray-500">Phone (Optional)</label>
                                        <input className="w-full border p-2 rounded text-sm text-black" value={data.customer.phone || ''} onChange={e => handleCustomerChange('phone', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Meta */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Invoice Info</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Invoice No</label>
                                    <input className="w-full border p-2 rounded text-sm text-black" value={data.invoiceNo} onChange={e => handleInvoiceChange('invoiceNo', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Date</label>
                                    <input className="w-full border p-2 rounded text-sm text-black" value={data.date} onChange={e => handleInvoiceChange('date', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Products</h3>
                            {data.products.map((product, index) => (
                                <div key={index} className="border p-3 rounded bg-gray-50 relative group">
                                    <button onClick={() => removeProduct(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition">
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500">Details</label>
                                            <input className="w-full border p-1 rounded text-sm text-black" value={product.details} onChange={e => handleProductChange(index, 'details', e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500">HSN</label>
                                                <input className="w-full border p-1 rounded text-sm text-black" value={product.hsnCode} onChange={e => handleProductChange(index, 'hsnCode', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500">Qty</label>
                                                <input type="number" className="w-full border p-1 rounded text-sm text-black" value={product.qty} onChange={e => handleProductChange(index, 'qty', Number(e.target.value))} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500">Rate</label>
                                                <input type="number" className="w-full border p-1 rounded text-sm text-black" value={product.amount} onChange={e => handleProductChange(index, 'amount', Number(e.target.value))} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500">GST %</label>
                                                <input type="number" className="w-full border p-1 rounded text-sm text-black" value={product.gstPercent} onChange={e => handleProductChange(index, 'gstPercent', Number(e.target.value))} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={addProduct} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-blue-500 hover:text-blue-600 transition flex justify-center items-center gap-2">
                                <Plus size={18} /> Add Product
                            </button>
                        </div>

                    </div>
                </div>

                {/* Right: PDF Preview */}
                <div className="w-1/2 bg-gray-500 flex items-center justify-center p-4">
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full shadow-2xl rounded"
                            title="PDF Preview"
                        />
                    ) : (
                        <div className="text-white flex flex-col items-center">
                            <RefreshCw className="animate-spin mb-2" />
                            <p>Generating Preview...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
