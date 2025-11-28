import Context from '../context';

export default {
    Query: {
        tournamentRounds(_: any, { params }: any, context: Context) {
            return context.tournamentRound.index(params);
        },
        tournamentAllRounds(_: any, { tournamentUuid }: any, context: Context) {
            return context.tournamentRound.getAllRounds(tournamentUuid);
        },
        tournamentRound(_: any, { tournamentUuid, round }: any, context: Context) {
            return context.tournamentRound.tournamentRound(tournamentUuid, round);
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
    TournamentRoundTable: {
        table(tableData: any) {
            return tableData.table || null;
        },
        players(tableData: any) {
            return tableData.players || [];
        },
    },
    TournamentRoundTablePlayer: {
        customer(player: any) {
            return player.customer || null;
        },
        customerUuid(player: any) {
            return player.customerUuid || player.customer?.uuid || null;
        },
    },
    TournamentRoundWinner: {
        customer(winner: any) {
            return winner.customer || null;
        },
        table(winner: any) {
            return winner.table || null;
        },
    },
};

