"use client";

import { useState, useEffect } from 'react';
import ExcelUpload from '../components/ExcelUpload';
import InvoiceEditor from '../components/InvoiceEditor';
import { generateInvoicePDF } from '../lib/pdfGenerator';
import { InvoiceData, Session } from '../lib/types';
import { FileText, ArrowRight, Download, LogOut, Trash2, Upload, LayoutDashboard, Plus, History, Clock, Edit2, Check } from 'lucide-react';

interface DashboardProps {
    onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState<number | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Editing state
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingNameValue, setEditingNameValue] = useState("");

    // Load sessions from localStorage on mount
    useEffect(() => {
        const savedSessions = localStorage.getItem('tax-invoice-sessions');
        if (savedSessions) {
            try {
                const parsed = JSON.parse(savedSessions);
                setSessions(parsed);
                // Automatically select the most recent session if available
                if (parsed.length > 0) {
                    setActiveSessionId(parsed[0].id);
                }
            } catch (e) {
                console.error("Failed to load sessions", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save sessions to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('tax-invoice-sessions', JSON.stringify(sessions));
        }
    }, [sessions, isLoaded]);

    const handleExcelParsed = (invoices: InvoiceData[]) => {
        const newSession: Session = {
            id: crypto.randomUUID(),
            name: `Upload ${new Date().toLocaleString()}`,
            createdAt: Date.now(),
            invoices: invoices
        };

        // Add new session to the top of the list
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
    };

    const handleSelectInvoice = (index: number) => {
        setSelectedInvoiceIndex(index);
    };

    const handleBackToList = () => {
        setSelectedInvoiceIndex(null);
    };

    const createNewSession = () => {
        setActiveSessionId(null); // Null means showing the upload screen
        setSelectedInvoiceIndex(null);
    };

    const deleteSession = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        if (confirm("Delete this session history?")) {
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (activeSessionId === sessionId) {
                setActiveSessionId(null);
            }
        }
    };

    const activeSession = sessions.find(s => s.id === activeSessionId);

    const startEditingName = () => {
        if (activeSession) {
            setEditingNameValue(activeSession.name);
            setIsEditingName(true);
        }
    };

    const saveSessionName = () => {
        if (activeSession && editingNameValue.trim()) {
            const trimmedName = editingNameValue.trim();
            let uniqueName = trimmedName;
            let counter = 1;

            // Get all other session names to check for duplicates
            const otherSessionNames = sessions
                .filter(s => s.id !== activeSession.id)
                .map(s => s.name);

            // If name exists, append counter until unique
            while (otherSessionNames.includes(uniqueName)) {
                uniqueName = `${trimmedName} (${counter})`;
                counter++;
            }

            setSessions(prev => prev.map(s =>
                s.id === activeSession.id ? { ...s, name: uniqueName } : s
            ));
            setIsEditingName(false);
            setEditingNameValue(uniqueName);
        }
    };

    const downloadAll = () => {
        if (!activeSession) return;
        activeSession.invoices.forEach((invoice, index) => {
            setTimeout(() => {
                const doc = generateInvoicePDF(invoice);
                doc.save(`Invoice_${invoice.invoiceNo}.pdf`);
            }, index * 500);
        });
    };

    // Render Editor if an invoice is selected
    if (selectedInvoiceIndex !== null && activeSession) {
        return (
            <div className="flex h-screen overflow-hidden bg-gray-50">
                <aside className="w-16 bg-gray-900 text-white flex flex-col items-center py-6 gap-6 flex-shrink-0">
                    <button onClick={handleBackToList} className="p-2 hover:bg-gray-800 rounded-lg" title="Back to Dashboard">
                        <LayoutDashboard size={24} />
                    </button>
                </aside>
                <div className="flex-grow h-full overflow-auto">
                    <InvoiceEditor
                        initialData={activeSession.invoices[selectedInvoiceIndex]}
                        onBack={handleBackToList}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-gray-100">
                    <button
                        onClick={createNewSession}
                        className="w-full bg-black text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-sm font-medium cursor-pointer"
                    >
                        <Plus size={18} />
                        New Upload
                    </button>
                </div>

                <nav className="flex-grow overflow-y-auto p-4 space-y-2">
                    <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <History size={12} />
                        History
                    </div>

                    {sessions.length === 0 ? (
                        <div className="text-sm text-gray-400 text-center py-4 italic">
                            No history yet
                        </div>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => {
                                    setActiveSessionId(session.id);
                                    setSelectedInvoiceIndex(null);
                                }}
                                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition border ${activeSessionId === session.id
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'hover:bg-gray-50 border-transparent text-gray-700'
                                    }`}
                            >
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-medium truncate text-sm">{session.name}</span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={10} />
                                        {new Date(session.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => deleteSession(e, session.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition"
                                    title="Delete Session"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </nav>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center cursor-pointer gap-3 px-4 py-3 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow overflow-auto p-8">
                <div className="max-w-6xl mx-auto">
                    {!activeSession ? (
                        // Upload View
                        <div className="flex flex-col items-center justify-center h-full py-20">
                            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-blue-400 transition shadow-sm max-w-2xl w-full">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Upload size={32} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Excel File</h3>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                    Start a new session by uploading your invoice data.
                                </p>
                                <div className="max-w-md mx-auto">
                                    <ExcelUpload onDataParsed={handleExcelParsed} />
                                </div>
                                <div className="mt-8 text-sm text-gray-400">
                                    Supports .xlsx and .xls files
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Invoice List View
                        <>
                            <header className="mb-8 flex justify-between items-center">
                                <div className="flex-grow">
                                    {isEditingName ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editingNameValue}
                                                onChange={(e) => setEditingNameValue(e.target.value)}
                                                className="text-3xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent px-1 py-1 w-full max-w-md"
                                                autoFocus
                                                onBlur={saveSessionName}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveSessionName();
                                                    if (e.key === 'Escape') {
                                                        setIsEditingName(false);
                                                        setEditingNameValue(activeSession.name);
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={saveSessionName}
                                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                            >
                                                <Check size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 group">
                                            <h1 className="text-3xl font-bold text-gray-900">{activeSession.name}</h1>
                                            <button
                                                onClick={startEditingName}
                                                className="text-gray-400 hover:text-blue-600 opacity-0 cursor-pointer group-hover:opacity-100 transition p-1"
                                                title="Rename Session"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                    <p className="text-gray-500 mt-1">{activeSession.invoices.length} Invoices Generated</p>
                                </div>
                                <button
                                    onClick={downloadAll}
                                    className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 flex items-center gap-2 transition shadow-sm font-medium cursor-pointer"
                                >
                                    <Download size={18} /> Download All
                                </button>
                            </header>

                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {activeSession.invoices.map((invoice, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleSelectInvoice(idx)}
                                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-blue-300 cursor-pointer transition group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition">
                                            <ArrowRight className="text-blue-600" />
                                        </div>

                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">#{invoice.invoiceNo}</h3>
                                                <p className="text-sm text-gray-500">{invoice.date}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="text-sm">
                                                <span className="text-gray-400">Customer:</span>
                                                <div className="font-medium text-gray-700 truncate">{invoice.customer.name}</div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                {invoice.products.length} Items
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const doc = generateInvoicePDF(invoice);
                                                    doc.save(`Invoice_${invoice.invoiceNo}.pdf`);
                                                }}
                                                className="flex items-center cursor-pointer gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg transition  z-10"
                                                title="Download PDF"
                                            >
                                                <Download size={16} />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
