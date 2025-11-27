import Context from '../context';

export default {
    Query: {
        tournamentRounds(_: any, { params }: any, context: Context) {
            return context.tournamentRound.list(params);
        },
    },
    Mutation: {
        startTournamentRound(_: any, { input }: any, context: Context) {
            return context.tournamentRound.startTournamentRound(input);
        },
        completeTournamentRound(_: any, { input }: any, context: Context) {
            return context.tournamentRound.completeTournamentRound(input);
        },
        startNextTournamentRound(_: any, { input }: any, context: Context) {
            return context.tournamentRound.startNextTournamentRound(input);
        },
    },
};

