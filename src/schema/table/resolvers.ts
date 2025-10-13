import Context from '../context';

export default {
    Query: {
        table(root: any, {id}: any, context:Context) {
            return context.table.show(id);
        },
        tables(root: any, {paging, params}: any, context:Context) {
            return context.table.index(paging, params);
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
