import Context from '../context';

export default {
    Query: {
        tournamentRoundPlayers(_: any, { params }: any, context: Context) {
            return context.tournamentRoundPlayer.index(params);
        },
    },
    Mutation: {
        updateTournamentRoundWinners(_: any, { input }: any, context: Context) {
            return context.tournamentRoundPlayer.updateWinners(input);
        },
    },
    TournamentRoundPlayer: {
        tournamentRound(player: any) {
            return player.tournamentRound || null;
        },
        customer(player: any) {
            return player.customer || null;
        },
        table(player: any) {
            return player.table || null;
        },
    },
};

