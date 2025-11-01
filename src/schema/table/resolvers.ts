import Context from '../context';

export default {
    Query: {
        table(root: any, {uuid}: any, context:Context) {
            return context.table.show(uuid);
        },
        tables(root: any, {params}: any, context:Context) {
            return context.table.index(params);
        }
    },
    Mutation: {
        saveTable(root: any, {input}:any, context:Context) {
            return context.table.save(input);
        },
        deleteTable(root: any, {uuid}: any, context: Context) {
            return context.table.delete(uuid);
        },
    },
};
