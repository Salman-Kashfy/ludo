import Context from '../context';

export default {
    Query: {
        playerRegistrationBill(_: any, { params }: any, context: Context) {
            return context.tournamentPlayer.playerRegistrationBill(params);
        }
    },
    Mutation: {
        playerRegistration(_: any, { input }: any, context: Context) {
            return context.tournamentPlayer.playerRegistration(input);
        },
    },
};

