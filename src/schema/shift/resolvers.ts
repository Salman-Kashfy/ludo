import Context from '../context';

export default {
    Query: {
        shift(root: any, { uuid }: any, context: Context) {
            return context.shift.show(uuid);
        },
        shifts(root: any, { paging, params }: any, context: Context) {
            return context.shift.index(paging, params);
        }
    },
    Mutation: {
        createShift(root: any, { input }: any, context: Context) {
            return context.shift.save(input);
        },
        updateShift(root: any, { input }: any, context: Context) {
            return context.shift.save(input);
        },
        deleteShift(root: any, { uuid }: any, context: Context) {
            return context.shift.delete(uuid);
        }
    },
};
