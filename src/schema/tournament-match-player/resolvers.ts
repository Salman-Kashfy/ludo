import Context from '../context';

export default {
    Query: {
        matchPlayers(_: any, { matchUuid }: any, context: Context) {
            return context.tournamentMatchPlayer.getByMatchUuid(matchUuid);
        },
    },
};

