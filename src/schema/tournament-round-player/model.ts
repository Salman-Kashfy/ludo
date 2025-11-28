import BaseModel from '../baseModel';
import { TournamentRoundPlayer as TournamentRoundPlayerEntity } from '../../database/entity/TournamentRoundPlayer';
import { TournamentRound as TournamentRoundEntity } from '../../database/entity/TournamentRound';
import Context from '../context';
import { GlobalError } from '../root/enum';
import { accessRulesByRoleHierarchy } from '../../shared/lib/DataRoleUtils';
import { TournamentRoundPlayerFilter, UpdateTournamentRoundWinnersInput } from './types';

export default class TournamentRoundPlayerModel extends BaseModel {
    repository: any;
    connection: any;
    context: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TournamentRoundPlayerEntity), context);
    }

    async index(params: TournamentRoundPlayerFilter) {
        try {
            const { tournamentRoundUuid, tournamentRoundId: paramTournamentRoundId, tableId, customerId, winnersOnly } = params;

            let tournamentRound: TournamentRoundEntity | null = null;
            let finalTournamentRoundId: number | undefined = paramTournamentRoundId;

            // If tournamentRoundUuid is provided, find the tournament round
            if (tournamentRoundUuid) {
                tournamentRound = await this.context.tournamentRound.repository.findOne({
                    where: { uuid: tournamentRoundUuid },
                    relations: ['tournament'],
                });

                if (!tournamentRound) {
                    return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament round not found');
                }

                // Check access permissions
                if (tournamentRound.tournament && !(await accessRulesByRoleHierarchy(this.context, { companyId: tournamentRound.tournament.companyId }))) {
                    return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
                }

                finalTournamentRoundId = tournamentRound.id;
            } else if (!paramTournamentRoundId) {
                return this.formatErrors([GlobalError.INVALID_INPUT], 'Either tournamentRoundUuid or tournamentRoundId is required');
            }

            // Build where clause
            const where: any = {};
            if (finalTournamentRoundId) {
                where.tournamentRoundId = finalTournamentRoundId;
            }
            if (tableId) {
                where.tableId = tableId;
            }
            if (customerId) {
                where.customerId = customerId;
            }
            if (winnersOnly) {
                where.isWinner = true;
            }

            const tournamentRoundPlayers = await this.repository.find({
                where,
                relations: ['customer', 'table', 'tournamentRound'],
            });

            return {
                status: true,
                list: tournamentRoundPlayers,
                errors: null,
                errorMessage: null,
            };
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }

    async getByTournamentRoundUuid(tournamentRoundUuid: string) {
        try {
            const tournamentRound = await this.context.tournamentRound.repository.findOne({
                where: { uuid: tournamentRoundUuid },
                relations: ['tournament'],
            });

            if (!tournamentRound) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament round not found');
            }

            if (tournamentRound.tournament && !(await accessRulesByRoleHierarchy(this.context, { companyId: tournamentRound.tournament.companyId }))) {
                return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
            }

            const players = await this.repository.find({
                where: { tournamentRoundId: tournamentRound.id },
                relations: ['customer', 'table'],
            });

            return this.successResponse(players);
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }

    async updateWinners(input: UpdateTournamentRoundWinnersInput) {
        try {
            const { tournamentRoundUuid, winnerCustomerIds } = input;
            const tournamentRound = await this.context.tournamentRound.repository.findOne({
                where: { uuid: tournamentRoundUuid },
                relations: ['tournament'],
            });

            if (!tournamentRound) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament round not found');
            }

            if (tournamentRound.tournament && !(await accessRulesByRoleHierarchy(this.context, { companyId: tournamentRound.tournament.companyId }))) {
                return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
            }

            if (!winnerCustomerIds || winnerCustomerIds.length === 0) {
                return this.formatErrors([GlobalError.INVALID_INPUT], 'Provide at least one winner');
            }

            // Reset all winners to false
            await this.repository
                .createQueryBuilder()
                .update(TournamentRoundPlayerEntity)
                .set({ isWinner: false })
                .where('tournament_round_id = :tournamentRoundId', {
                    tournamentRoundId: tournamentRound.id,
                })
                .execute();

            // Set winners to true
            await this.repository
                .createQueryBuilder()
                .update(TournamentRoundPlayerEntity)
                .set({ isWinner: true })
                .where('tournament_round_id = :tournamentRoundId AND customer_id IN (:...winnerIds)', {
                    tournamentRoundId: tournamentRound.id,
                    winnerIds: winnerCustomerIds,
                })
                .execute();

            const winners = await this.repository.find({
                where: { tournamentRoundId: tournamentRound.id, isWinner: true },
                relations: ['customer', 'table'],
            });

            return {
                status: true,
                list: winners,
                errors: null,
                errorMessage: null,
            };
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }
}

