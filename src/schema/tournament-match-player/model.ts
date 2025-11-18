import BaseModel from '../baseModel';
import { TournamentMatchPlayer as TournamentMatchPlayerEntity } from '../../database/entity/TournamentMatchPlayer';
import Context from '../context';
import { GlobalError } from '../root/enum';
import { accessRulesByRoleHierarchy } from '../../shared/lib/DataRoleUtils';

export default class TournamentMatchPlayer extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TournamentMatchPlayerEntity), context);
    }

    async getByMatchUuid(matchUuid: string) {
        try {
            const match = await this.context.tournamentMatch.repository.findOne({
                where: { uuid: matchUuid },
                relations: ['tournament'],
            });

            if (!match) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Match not found');
            }

            const tournament = await this.context.tournament.repository.findOne({
                where: { id: match.tournamentId },
                relations: ['company'],
            });

            if (!(await accessRulesByRoleHierarchy(this.context, { companyId: tournament!.companyId }))) {
                return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
            }

            const matchPlayers = await this.repository.find({
                where: { matchId: match.id },
                relations: ['match', 'tournamentPlayer'],
                order: { position: 'ASC' },
            });

            return {
                status: true,
                list: matchPlayers,
                errors: null,
                errorMessage: null,
            };
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }
}

