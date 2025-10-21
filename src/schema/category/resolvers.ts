import Context from '../context';

export default {
    Query: {
        category(root: any, {id}: any, context:Context) {
            return context.category.show(id);
        },
        categories(root: any, {params}: any, context:Context) {
            return context.category.index(params);
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
