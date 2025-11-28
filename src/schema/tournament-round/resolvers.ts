import Context from '../context';

export default {
    Query: {
        tournamentRounds(_: any, { params }: any, context: Context) {
            return context.tournamentRound.index(params);
        },
    },
    Mutation: {
        startTournament(_: any, { input }: any, context: Context) {
            return context.tournamentRound.startTournament(input);
        },
        completeTournamentRound(_: any, { input }: any, context: Context) {
            return context.tournamentRound.completeTournamentRound(input);
        },
        startNextTournamentRound(_: any, { input }: any, context: Context) {
            return context.tournamentRound.startNextTournamentRound(input);
        },
    },
    TournamentRoundTransition: {
        uuid(parent: any) {
            return parent.round?.uuid ?? null;
        },
        status(parent: any) {
            return parent.tournament?.status ?? null;
        },
        currentRound(parent: any) {
            return parent.tournament?.currentRound ?? null;
        },
        startedAt(parent: any) {
            return parent.round?.startedAt ?? parent.tournament?.startedAt ?? null;
        },
    },
};

