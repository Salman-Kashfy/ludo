import Context from '../context';

export default {
    Query: {
        customer(root: any, {id}: any, context:Context) {
            return context.customer.show(id);
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
        deleteCustomer(root: any, {id}: any, context: Context) {
            return context.customer.delete(id);
        },
    },
};
