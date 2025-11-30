import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceData } from './types';

export const generateInvoicePDF = (invoice: InvoiceData) => {
    const doc = new jsPDF();

    // Colors
    const PURPLE_DARK = [76, 29, 149] as [number, number, number]; // #4c1d95
    const PURPLE_LIGHT = [243, 232, 255] as [number, number, number]; // #f3e8ff
    const BLACK = [0, 0, 0] as [number, number, number];
    const WHITE = [255, 255, 255] as [number, number, number];

    // Helper to add text with color support
    const addText = (text: string, x: number, y: number, fontSize: number = 10, font: string = 'helvetica', fontStyle: string = 'normal', align: 'left' | 'center' | 'right' = 'left', color: [number, number, number] = BLACK) => {
        doc.setFont(font, fontStyle);
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(text, x, y, { align });
    };

    // --- Header (Seller Details) ---

    // Top colored bar
    doc.setFillColor(PURPLE_DARK[0], PURPLE_DARK[1], PURPLE_DARK[2]);
    doc.rect(0, 0, 210, 10, 'F');

    // Seller Name
    addText(invoice.seller.name.toUpperCase(), 15, 25, 20, 'helvetica', 'bold', 'left', PURPLE_DARK);

    // Seller Address & Info
    let yPos = 35;
    const sellerAddress = doc.splitTextToSize(invoice.seller.address, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.text(sellerAddress, 15, yPos);

    yPos += (sellerAddress.length * 5);
    addText(`Pincode: ${invoice.seller.pincode}`, 15, yPos, 10, 'helvetica', 'normal', 'left');
    yPos += 5;
    addText(`GSTIN: ${invoice.seller.gstNo}`, 15, yPos, 10, 'helvetica', 'bold', 'left');

    yPos += 10;

    // --- Title ---
    // Background for Title
    doc.setFillColor(PURPLE_LIGHT[0], PURPLE_LIGHT[1], PURPLE_LIGHT[2]);
    doc.rect(10, yPos, 190, 10, 'F');

    addText("TAX INVOICE", 105, yPos + 7, 14, 'helvetica', 'bold', 'center', PURPLE_DARK);
    yPos += 12;

    // --- Customer & Invoice Details ---
    const startY = yPos;

    // Left Column: Customer
    let leftY = startY + 7;
    addText("Customer Details:", 15, leftY, 11, 'helvetica', 'bold', 'left', PURPLE_DARK);
    leftY += 6;
    addText(`M/S: ${invoice.customer.name}`, 15, leftY, 10);
    leftY += 5;
    const splitAddress = doc.splitTextToSize(`Address: ${invoice.customer.address}, ${invoice.customer.pincode}`, 85);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.text(splitAddress, 15, leftY);
    leftY += (splitAddress.length * 5);

    // Conditional Customer Fields
    if (invoice.customer.gstNo && invoice.customer.gstNo !== 'N/A' && invoice.customer.gstNo.trim() !== '') {
        addText(`GSTIN: ${invoice.customer.gstNo}`, 15, leftY, 10);
        leftY += 5;
    }

    if (invoice.customer.phone && invoice.customer.phone.trim() !== '') {
        addText(`Phone: ${invoice.customer.phone}`, 15, leftY, 10);
        leftY += 5;
    }

    // Right Column: Invoice Details
    let rightY = startY + 7;
    addText(`Invoice No: ${invoice.invoiceNo}`, 110, rightY, 10, 'helvetica', 'bold');
    rightY += 6;
    addText(`Invoice Date: ${invoice.date}`, 110, rightY, 10);
    rightY += 6;

    // --- Product Table ---
    const tableStartY = Math.max(leftY, rightY) + 10;

    const tableBody = invoice.products.map((product, index) => {
        const taxableValue = product.qty * product.amount;
        const gstAmount = (taxableValue * product.gstPercent) / 100;
        const total = taxableValue + gstAmount;
        return [
            index + 1,
            product.details,
            product.hsnCode,
            product.qty,
            product.amount.toFixed(2),
            taxableValue.toFixed(2),
            `${product.gstPercent}%`,
            gstAmount.toFixed(2),
            total.toFixed(2)
        ];
    });

    // Calculate Totals
    const totalTaxable = invoice.products.reduce((sum, p) => sum + (p.qty * p.amount), 0);
    const totalGST = invoice.products.reduce((sum, p) => sum + ((p.qty * p.amount * p.gstPercent) / 100), 0);
    const grandTotal = totalTaxable + totalGST;

    autoTable(doc, {
        startY: tableStartY,
        head: [['Sr.', 'Product Details', 'HSN', 'Qty', 'Rate', 'Taxable', 'GST %', 'GST Amt', 'Total']],
        body: tableBody,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3, halign: 'center', lineColor: PURPLE_LIGHT, lineWidth: 0.1 },
        headStyles: { fillColor: PURPLE_DARK, textColor: WHITE, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { textColor: BLACK },
        alternateRowStyles: { fillColor: PURPLE_LIGHT }, // Light purple background for alternate rows
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 60, halign: 'left' },
            // Adjust others as needed
        },
        margin: { left: 10, right: 10 },
        tableWidth: 'auto',
        foot: [['', 'Total', '', '', '', totalTaxable.toFixed(2), '', totalGST.toFixed(2), grandTotal.toFixed(2)]],
        footStyles: { fillColor: PURPLE_LIGHT, textColor: PURPLE_DARK, fontStyle: 'bold', halign: 'center' }
    });

    // --- Footer ---
    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 20;

    // Signature
    addText("For " + invoice.seller.name, 190, finalY, 10, 'helvetica', 'bold', 'right', PURPLE_DARK);
    finalY += 15;
    addText("Authorised Signatory", 190, finalY, 10, 'helvetica', 'normal', 'right');

    // Thanks
    finalY += 15;
    doc.setFillColor(PURPLE_DARK[0], PURPLE_DARK[1], PURPLE_DARK[2]);
    doc.rect(0, finalY - 5, 210, 15, 'F'); // Bottom bar
    addText("Thanks for shopping with us!", 105, finalY + 2, 12, 'helvetica', 'italic', 'center', WHITE);

    return doc;
};
