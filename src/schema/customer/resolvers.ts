import Context from '../context';

export default {
    Query: {
        customer(root: any, {uuid}: any, context:Context) {
            return context.customer.show(uuid);
        },
        customers(root: any, {paging, params}: any, context:Context) {
            return context.customer.index(paging, params);
        }
    },
    Mutation: {
        createCustomer(root: any, {input}:any, context:Context) {
            return context.customer.save(input);
        },
        updateCustomer(root: any, {input}: any, context: Context) {
            return context.customer.save(input);
        },
        deleteCustomer(root: any, {uuid}: any, context: Context) {
            return context.customer.delete(uuid);
        },
    },
    Customer: {
        fullName(customer: any) {
            return `${customer.firstName} ${customer.lastName}`.trim();
        },
        phone(customer: any) {
            if (customer.phoneCode && customer.phoneNumber) {
                return `${customer.phoneCode}${customer.phoneNumber}`;
            }
            return null;
        }
    },
};
