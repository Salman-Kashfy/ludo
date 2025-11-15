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

    async playerRegistration(input: { customerUuid: string, tournamentUuid: string, tableUuid: string }) {
        const { customerUuid, tournamentUuid, tableUuid } = input;

        try {
            // Validate customer exists
            const customer = await this.context.customer.repository.findOne({
                where: { uuid: customerUuid },
            });

            if (!customer) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Customer not found');
            }

            // Validate tournament exists
            const tournament = await this.context.tournament.repository.findOne({
                where: { uuid: tournamentUuid },
                relations: ['company'],
            });

            if (!tournament) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
            }

            // Check access permissions
            if (!(await accessRulesByRoleHierarchy(this.context, { companyId: tournament.companyId }))) {
                return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
            }

            // Check if customer is already registered
            const existingRegistration = await this.repository.findOne({
                where: {
                    tournamentId: tournament.id,
                    customerId: customer.id,
                },
            });

            if (existingRegistration) {
                return this.formatErrors([GlobalError.ALREADY_EXISTS], 'Player already registered');
            }

            // Check if tournament has reached player limit
            if (tournament.playerCount >= tournament.playerLimit) {
                return this.formatErrors([GlobalError.VALIDATION_ERROR], 'Tournament has reached maximum player limit');
            }

            // Validate table exists and belongs to tournament's category
            const table = await this.context.table.repository.findOne({
                where: { uuid: tableUuid },
                relations: ['category'],
            });

            if (!table) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Table not found');
            }

            if (table.categoryId !== tournament.categoryId) {
                return this.formatErrors([GlobalError.VALIDATION_ERROR], 'Table does not belong to tournament category');
            }

            // Check if table is already booked in this tournament
            const tableBooked = await this.repository.findOne({
                where: {
                    tournamentId: tournament.id,
                    tableId: table.id,
                },
            });

            if (tableBooked) {
                return this.formatErrors([GlobalError.ALREADY_EXISTS], 'Table is already booked for this tournament');
            }

            // Use transaction to ensure atomicity
            const result = await this.connection.manager.transaction(async (transactionalEntityManager: any) => {
                // Create TournamentPlayer record
                const tournamentPlayer = transactionalEntityManager.create(TournamentPlayerEntity, {
                    tournamentId: tournament.id,
                    customerId: customer.id,
                    tableId: table.id,
                });

                const savedTournamentPlayer = await transactionalEntityManager.save(tournamentPlayer);

                // Increment tournament playerCount
                tournament.playerCount = (tournament.playerCount || 0) + 1;
                tournament.lastUpdatedById = this.context.user.id;
                await transactionalEntityManager.save(tournament);

                return savedTournamentPlayer;
            });

            // Fetch the saved tournament player with relations
            const savedPlayer = await this.repository.findOne({
                where: { id: result.id },
                relations: ['customer', 'table'],
            });

            return this.successResponse(savedPlayer);
        } catch (error: any) {
            console.error('Player registration error:', error);
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }
}