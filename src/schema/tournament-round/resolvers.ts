import Context from '../context';

export default {
    Query: {
        tournamentRounds(_: any, { tournamentUuid }: any, context: Context) {
            return context.tournamentRound.getByTournamentUuid(tournamentUuid);
        },
        tournamentRound(_: any, { tournamentUuid, roundNumber }: any, context: Context) {
            return context.tournamentRound.getByTournamentUuidAndRoundNumber(tournamentUuid, roundNumber);
        },
    },
};

