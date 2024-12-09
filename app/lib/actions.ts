'use server';

import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string()
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    try {

        await sql.query(`
            INSERT INTO invoices (customer_id, amount, status, date) 
            VALUES ($1, $2, $3, $4)`, [customerId, amountInCents, status, date]
        );
        revalidatePath('/dashboard/invoices');
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice'
        };
    }
    redirect('/dashboard/invoices'); // redirect throws an error, which should'nt be caugh above
}

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const amountInCents = amount * 100;

    try {
        await sql.query(`
            UPDATE invoices SET customer_id=$1, amount=$2, status=$3 
            WHERE id=$4`, [customerId, amountInCents, status, id]
        );
        revalidatePath('/dashboard/invoices');
    } catch (error) {
        return {
            message: 'Database Error: Failed to Update Invoice'
        };
    }
    redirect('/dashboard/invoices'); // redirect throws an error, which should'nt be caugh above
}

export async function deleteInvoice(id: string) {
    throw Error('Failed to Delete Invoice');

    // Unreachable block
    try {
        await sql.query(`DELETE FROM invoices WHERE id='${id}'`);
        revalidatePath('/dashboard/invoice');
        return { message: 'Deleted Invoice' };
    } catch (error) {
        return {
            message: 'Database Error: Failed to Delete Invoice'
        };
    }
}