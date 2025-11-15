import BaseModel from '../baseModel';
import { TournamentPlayer as TournamentPlayerEntity } from '../../database/entity/TournamentPlayer';
import Context from '../context';
import { GlobalError } from '../root/enum';
import { accessRulesByRoleHierarchy } from '../../shared/lib/DataRoleUtils';
import { Status } from '../../database/entity/root/enums';

export default class TournamentPlayer extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TournamentPlayerEntity), context);
    }

    async index(tournamentUuid: string) {
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

            const tournamentPlayers = await this.repository.find({
                where: { tournamentId: tournament.id },
                relations: ['customer', 'table'],
            });

            return {
                status: true,
                list: tournamentPlayers,
                errors: null,
                errorMessage: null,
            };
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }

    async playerRegistrationBill(params: { customerUuid: string, tournamentUuid: string }) {
        const { customerUuid, tournamentUuid } = params;

        try {
            const customer = await this.context.customer.repository.findOne({
                where: { uuid: customerUuid },
            });

            if (!customer) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Customer not found');
            }

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

            const existingRegistration = await this.repository.findOne({
                where: {
                    tournamentId: tournament.id,
                    customerId: customer.id,
                },
            });

            if(existingRegistration) {
                return this.formatErrors([GlobalError.ALREADY_EXISTS], 'Player already registered.');
            }

            return this.successResponse(tournament);
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }
}