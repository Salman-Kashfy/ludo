import Context from '../context';

export default {
    Query: {
        category(root: any, {id}: any, context:Context) {
            return context.category.show(id);
        },
        categories(root: any, {paging, params}: any, context:Context) {
            return context.category.index(paging, params);
        }
    },
    Mutation: {
        createCategory(root: any, {input}:any, context:Context) {
            return context.category.save(input);
        },
        updateCategory(root: any, {input}: any, context: Context) {
            return context.category.save(input);
        },
    },
};
