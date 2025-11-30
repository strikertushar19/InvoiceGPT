export interface Product {
    details: string;
    hsnCode: string;
    qty: number;
    amount: number; // Rate per unit
    gstPercent: number;
}

export interface Seller {
    name: string;
    address: string;
    pincode: string;
    gstNo: string;
}

export interface Customer {
    name: string;
    address: string;
    pincode: string;
    gstNo: string;
    phone?: string;
}

export interface InvoiceData {
    invoiceNo: string;
    date: string;
    time?: string;
    seller: Seller;
    customer: Customer;
    products: Product[];
}

export interface Session {
    id: string;
    name: string;
    createdAt: number;
    invoices: InvoiceData[];
}
