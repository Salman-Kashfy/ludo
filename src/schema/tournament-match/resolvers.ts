import Context from '../context';

export default {
    Query: {
        tournamentMatches(_: any, { params }: any, context: Context) {
            return context.tournamentMatch.index(params);
        },
    },
    TournamentMatch: {
        table(match: any) {
            return match.table || null;
        },
        players(match: any) {
            return match.players || [];
        },
    },
    TournamentMatchPlayer: {
        customer(player: any) {
            return player.customer || null;
        },
        customerUuid(player: any) {
            return player.customerUuid || player.customer?.uuid || null;
        },
    },
};

