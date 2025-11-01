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
        createTable(root: any, {input}:any, context:Context) {
            return context.table.save(input);
        },
        updateTable(root: any, {input}: any, context: Context) {
            return context.table.save(input);
        },
        updateTableStatus(root: any, {input}: any, context: Context) {
            return context.table.updateTableStatus(input);
        },
    },
};
