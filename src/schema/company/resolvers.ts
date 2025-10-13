import Context from '../context';

export default {
    Query: {
        company(root: any, {uuid}: any, context:Context) {
            return context.company.show(uuid);
        },
        companies(root: any, {paging, params}: any, context:Context) {
            return context.company.index(paging, params);
        }
    },
    Mutation: {
        createCompany(root: any, {input}:any, context:Context) {
            return context.company.save(input);
        },
        updateCompany(root: any, {input}: any, context: Context) {
            return context.company.save(input);
        },
        updateCompanyStatus(root: any, {input}: any, context: Context) {
            return context.company.updateCompanyStatus(input);
        },
    },
};
