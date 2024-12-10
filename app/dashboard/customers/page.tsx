import { fetchAllCustomers } from '@/app/lib/data';
import { CustomersTableType, FormattedCustomersTable } from '@/app/lib/definitions';
import CustomersTable from '@/app/ui/customers/table';
import { Metadata } from 'next';
import { custom } from 'zod';

export const metadata: Metadata = {
    title: 'Invoices',
};
export default async function Page() {
    const customers = await fetchAllCustomers();
    const formattedCustomers: FormattedCustomersTable[] = customers.map(customer => {
        return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            image_url: customer.image_url,
            total_invoices: Number(customer.total_invoices),
            total_pending: customer.total_pending,
            total_paid: customer.total_paid
        };
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <CustomersTable customers={formattedCustomers} />
            </div>
        </div>
    );
}