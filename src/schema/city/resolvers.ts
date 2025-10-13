import Context from '../context';

export default {
    Query: {
        cities(root: any, {countryId}: any, context: Context) {
            return context.city.getCities(countryId);
        },
    }
};
