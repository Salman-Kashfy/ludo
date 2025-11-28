import { groupBy } from 'lodash';
import BaseModel from '../baseModel';
import { TournamentRoundPlayer as TournamentRoundPlayerEntity } from '../../database/entity/TournamentRoundPlayer';
import { TournamentRound } from '../../database/entity/TournamentRound';
import Context from '../context';
import { GlobalError } from '../root/enum';
import { accessRulesByRoleHierarchy } from '../../shared/lib/DataRoleUtils';
import { TournamentMatchFilterInput, TournamentMatchView } from './types';

export default class TournamentMatchModel extends BaseModel {
    private tournamentRoundRepository: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TournamentRoundPlayerEntity), context);
        this.tournamentRoundRepository = connection.getRepository(TournamentRound);
    }

    async index(params: TournamentMatchFilterInput) {
        try {
            const { tournamentUuid, round, tableUuid, tableId } = params;

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

            let resolvedTableId = tableId;
            if (tableUuid) {
                const table = await this.context.table.repository.findOne({
                    where: { uuid: tableUuid },
                });

                if (!table) {
                    return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Table not found');
                }
                resolvedTableId = table.id;
            }

            const roundWhere: any = { tournamentId: tournament.id };
            if (typeof round === 'number') {
                roundWhere.round = round;
            }

            const tournamentRounds = await this.tournamentRoundRepository.find({
                where: roundWhere,
                order: { round: 'ASC' },
            });

            if (!tournamentRounds.length) {
                return {
                    status: true,
                    list: [],
                    errors: null,
                    errorMessage: null,
                };
            }

            const matches: TournamentMatchView[] = [];

            for (const roundEntry of tournamentRounds) {
                const playerWhere: any = { tournamentRoundId: roundEntry.id };
                if (resolvedTableId) {
                    playerWhere.tableId = resolvedTableId;
                }

                const roundPlayers = await this.repository.find({
                    where: playerWhere,
                    relations: ['customer', 'table'],
                });

                if (!roundPlayers.length) {
                    continue;
                }

                const grouped = groupBy(roundPlayers, (player) => player.tableId ?? 'unassigned');

                Object.keys(grouped).forEach((key) => {
                    const group = grouped[key];
                    const sample = group[0];
                    matches.push({
                        tournamentRoundId: roundEntry.id,
                        tournamentRoundUuid: roundEntry.uuid,
                        round: roundEntry.round,
                        tableId: sample.tableId ?? null,
                        table: sample.table ?? null,
                        players: group.map((player) => ({
                            customerId: player.customerId,
                            customerUuid: player.customer?.uuid || '',
                            isWinner: player.isWinner,
                            customer: player.customer,
                        })),
                    });
                });
            }

            return {
                status: true,
                list: matches,
                errors: null,
                errorMessage: null,
            };
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }
}

