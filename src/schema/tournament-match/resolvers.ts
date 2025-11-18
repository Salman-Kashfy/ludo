import Context from '../context';

export default {
    Query: {
        tournamentMatches(_: any, { tournamentUuid, roundNumber }: any, context: Context) {
            return context.tournamentMatch.getByTournamentUuid(tournamentUuid, roundNumber);
        },
        tournamentMatch(_: any, { matchUuid }: any, context: Context) {
            return context.tournamentMatch.getByUuid(matchUuid);
        },
        tournamentMatchById(_: any, { matchId }: any, context: Context) {
            return context.tournamentMatch.getById(matchId);
        },
    },
    Mutation: {
        startMatch(_: any, { matchUuid }: any, context: Context) {
            return context.tournamentMatch.startMatch(matchUuid);
        },
        declareMatchWinner(_: any, { input }: any, context: Context) {
            return context.tournamentMatch.declareWinner(input.matchUuid, input.winnerCustomerUuid);
        },
    },
};

