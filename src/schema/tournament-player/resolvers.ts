import Context from '../context';

export default {
    Query: {
        tournamentPlayers(_: any, { params }: any, context: Context) {
            return context.tournamentPlayer.index(params);
        },
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

