import Context from '../context';

export default {
    Query: {
        tournament(_: any, { uuid }: any, context: Context) {
            return context.tournament.show(uuid);
        },
        tournaments(_: any, { paging, params }: any, context: Context) {
            return context.tournament.index(paging, params);
        },
    },
    Mutation: {
        saveTournament(_: any, { input }: any, context: Context) {
            return context.tournament.save(input);
        },
        deleteTournament(_: any, { uuid }: any, context: Context) {
            return context.tournament.delete(uuid);
        },
        startTournament(_: any, { tournamentUuid }: any, context: Context) {
            return context.tournament.startTournament(tournamentUuid);
        },
    },
};

