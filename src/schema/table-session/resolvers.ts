import Context from '../context';

export default {
    Query: {
        tableSession(root: any, {id}: any, context:Context) {
            return context.tableSession.show(id);
        },
        tableSessions(root: any, {paging, params}: any, context:Context) {
            return context.tableSession.index(paging, params);
        },
        activeTableSessions(root: any, args: any, context:Context) {
            return context.tableSession.getActiveSessions();
        }
    },
    Mutation: {
        bookTableSession(root: any, {input}:any, context:Context) {
            return context.tableSession.bookSession(input);
        },
        startTableSession(root: any, {input}:any, context:Context) {
            return context.tableSession.startSession(input);
        },
        endTableSession(root: any, {input}: any, context: Context) {
            return context.tableSession.endSession(input);
        },
        cancelTableSession(root: any, {id}: any, context: Context) {
            return context.tableSession.cancelSession(id);
        },
    },
};
