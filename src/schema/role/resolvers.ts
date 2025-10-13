export default {
    Query: {
        roles(root: any, {}: any, context: any) {
            return context.role.index();
        }
    }
};
