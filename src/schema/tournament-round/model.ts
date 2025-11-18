import BaseModel from '../baseModel';
import { TournamentRound as TournamentRoundEntity } from '../../database/entity/TournamentRound';
import Context from '../context';
import { GlobalError } from '../root/enum';
import { accessRulesByRoleHierarchy } from '../../shared/lib/DataRoleUtils';

export default class TournamentRound extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TournamentRoundEntity), context);
    }

    async getByTournamentUuid(tournamentUuid: string) {
        try {
            const tournament = await this.context.tournament.repository.findOne({
                where: { uuid: tournamentUuid },
                relations: ['company'],
            });

            if (!tournament) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
            }

            if (!(await accessRulesByRoleHierarchy(this.context, { companyId: tournament.companyId }))) {
                return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
            }

            const rounds = await this.repository.find({
                where: { tournamentId: tournament.id },
                relations: ['tournament'],
                order: { roundNumber: 'ASC' },
            });

            return {
                status: true,
                list: rounds,
                errors: null,
                errorMessage: null,
            };
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }

    async getByTournamentUuidAndRoundNumber(tournamentUuid: string, roundNumber: number) {
        try {
            const tournament = await this.context.tournament.repository.findOne({
                where: { uuid: tournamentUuid },
                relations: ['company'],
            });

            if (!tournament) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
            }

            if (!(await accessRulesByRoleHierarchy(this.context, { companyId: tournament.companyId }))) {
                return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
            }

            const round = await this.repository.findOne({
                where: {
                    tournamentId: tournament.id,
                    roundNumber: roundNumber,
                },
                relations: ['tournament'],
            });

            if (!round) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Round not found');
            }

            return this.successResponse(round);
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }
}

