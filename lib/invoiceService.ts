import { supabase } from './supabaseClient';
import { InvoiceData } from './types';

export const saveInvoiceStats = async (invoices: InvoiceData[], userId: string) => {
    const records = invoices.map(inv => {
        // Calculate total amount including GST
        // Assuming product.amount is rate per unit as per types.ts
        const totalAmount = inv.products.reduce((sum, p) => {
            const taxable = p.qty * p.amount;
            const tax = taxable * (p.gstPercent / 100);
            return sum + taxable + tax;
        }, 0);

        return {
            invoice_no: inv.invoiceNo,
            amount: parseFloat(totalAmount.toFixed(2)), // Round to 2 decimal places
            customer_name: inv.customer.name,
            created_at: new Date().toISOString(),
            user_id: userId,
        };
    });

    const { error } = await supabase
        .from('invoices')
        .insert(records);

    if (error) {
        console.error('Error saving invoice stats:', error);
        // We don't throw here to avoid blocking the UI if stats fail, 
        // but we log it.
    }
};
