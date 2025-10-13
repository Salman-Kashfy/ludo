import { Invoice as InvoiceEntity, InvoiceStatus } from '../../database/entity/Invoice';
import Invoice from './model';
import Context from '../context';

export default {
    Query: {
        invoice: async (_: any, { uuid }:any, context: Context) => {
            return context.invoice.show(uuid);
        },
        invoices: async (_: any, { paging, params }: { paging: any, params: any }, context: Context) => {
            return context.invoice.index(paging, params);
        }
    },
    Mutation: {
        createInvoice: async (_: any, { input }: { input: any }, context: Context) => {
            return context.invoice.create(input);
        },
        updateInvoice: async (_: any, { input }: { input: any }, context: Context) => {
            return context.invoice.update(input);
        },
        updateInvoiceStatus: async (_: any, { input }: { input: any }, context: Context) => {
            return context.invoice.updateStatus(input);
        }
    }
};
