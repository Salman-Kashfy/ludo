import Context from '../context';

export default {
    Query: {
        countries(root: any, { paging, params }: any, context: Context) {
            return context.country.getAll(params);
        },
    }
};
