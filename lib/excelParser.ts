import * as XLSX from 'xlsx';
import { InvoiceData, Product, Seller, Customer } from './types';

export const parseExcel = (data: ArrayBuffer): InvoiceData[] => {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Use default raw: true to get serial numbers for dates
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const invoicesMap = new Map<string, InvoiceData>();

    const parseNumber = (val: any): number => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            // Remove commas and other non-numeric chars except dot and minus
            const clean = val.replace(/[^0-9.-]/g, '');
            return Number(clean) || 0;
        }
        return 0;
    };

    jsonData.forEach((row: any) => {
        // Normalize keys (lowercase, trim) to handle variations
        const getVal = (keyPart: string, excludePart?: string) => {
            const key = Object.keys(row).find(k => {
                const lowerK = k.toLowerCase();
                if (!lowerK.includes(keyPart.toLowerCase())) return false;
                if (excludePart && lowerK.includes(excludePart.toLowerCase())) return false;
                return true;
            });
            return key ? row[key] : '';
        };

        const invoiceNo = String(getVal('invoice no') || '');
        if (!invoiceNo) return;

        if (!invoicesMap.has(invoiceNo)) {
            const seller: Seller = {
                name: getVal('seller name'),
                address: getVal('seller address'),
                pincode: String(getVal('seller pincode')),
                gstNo: String(getVal('seller gst no')),
            };

            const customer: Customer = {
                name: getVal('customer name') || getVal('name', 'seller'),
                address: getVal('customer address') || getVal('address', 'seller'),
                pincode: String(getVal('customer pincode') || getVal('pincode', 'seller')),
                gstNo: String(getVal('gst no if available') || getVal('customer gst') || ''),
                phone: String(getVal('phone') || getVal('mobile') || getVal('contact') || ''),
            };

            // Date parsing
            const rawDate = getVal('invoice date') || getVal('date');
            let formattedDate = '';

            if (rawDate) {
                if (typeof rawDate === 'number') {
                    // Excel serial date -> UTC components to preserve exact values
                    const dateObj = new Date(Math.round((rawDate - 25569) * 86400 * 1000));

                    const day = String(dateObj.getUTCDate()).padStart(2, '0');
                    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
                    const year = dateObj.getUTCFullYear();

                    let hours = dateObj.getUTCHours();
                    const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
                    const seconds = String(dateObj.getUTCSeconds()).padStart(2, '0');
                    const ampm = hours >= 12 ? 'PM' : 'AM';

                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'

                    formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
                } else {
                    // String date
                    formattedDate = String(rawDate);
                }
            }

            invoicesMap.set(invoiceNo, {
                invoiceNo,
                date: formattedDate,
                seller,
                customer,
                products: []
            });
        }

        const invoice = invoicesMap.get(invoiceNo)!;

        const rawGst = getVal('gst percent');
        let gstPercent = 0;
        if (typeof rawGst === 'string') {
            gstPercent = parseFloat(rawGst.replace('%', ''));
        } else {
            gstPercent = Number(rawGst) || 0;
        }
        // Heuristic: If GST is likely a decimal (e.g. 0.18), convert to percentage (18)
        // Unless it's a very small percentage like 0.1% which is rare in standard GST
        if (gstPercent > 0 && gstPercent < 1) {
            gstPercent = gstPercent * 100;
        }

        const product: Product = {
            details: getVal('product details'),
            hsnCode: String(getVal('hsn code')),
            qty: parseNumber(getVal('qty')),
            amount: parseNumber(getVal('product amount')),
            gstPercent: gstPercent,
        };

        invoice.products.push(product);
    });

    return Array.from(invoicesMap.values());
};
