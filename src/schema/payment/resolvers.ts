import Context from '../context';

export default {
    Query: {
        payment(root: any, {id}: any, context:Context) {
            return context.payment.show(id);
        },
        payments(root: any, {paging, params}: any, context:Context) {
            return context.payment.index(paging, params);
        },
    },
    Mutation: {
        refundPayment(root: any, {input}: any, context: Context) {
            return context.payment.refund(input);
        },
    },
};
