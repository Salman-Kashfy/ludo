import Context from '../context';

export default {
    Query: {
        tournamentPlayers(_: any, { tournamentUuid }: any, context: Context) {
            return context.tournamentPlayer.index(tournamentUuid);
        },
        playerRegistrationBill(_: any, { params }: any, context: Context) {
            return context.tournamentPlayer.playerRegistrationBill(params);
        },
    }
};

