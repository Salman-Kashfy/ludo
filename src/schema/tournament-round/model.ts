import BaseModel from '../baseModel';
import Context from '../context';
import { GlobalError } from '../root/enum';
import { accessRulesByRoleHierarchy } from '../../shared/lib/DataRoleUtils';
import { Tournament } from '../../database/entity/Tournament';
import { Table } from '../../database/entity/Table';
import { TournamentPlayer } from '../../database/entity/TournamentPlayer';
import { TournamentRound as TournamentRoundEntity } from '../../database/entity/TournamentRound';
import { TournamentRoundPlayer as TournamentRoundPlayerEntity } from '../../database/entity/TournamentRoundPlayer';
import { TournamentStatus } from '../tournament/types';
import { TournamentRoundFilterInput, TournamentRoundStatus } from './types';
import { TableStatus } from '../table/types';

type StartTournamentInput = {
    tournamentUuid: string;
    randomize?: boolean;
};

type CompleteTournamentRoundInput = {
    tournamentUuid: string;
    round?: number;
    winnerCustomerIds: number[];
};

type StartNextTournamentRoundInput = {
    tournamentUuid: string;
    randomize?: boolean;
};

type RoundView = {
    id: number;
    tournamentId: number;
    customerId: number;
    tableId?: number | null;
    round: number;
    isWinner: boolean;
    createdAt: Date;
    customer?: any;
    table?: Table | null;
};

type AssignmentResult = {
    round: number;
    tableId: number;
    table: Table;
    playerIds: number[];
    entries: RoundView[];
};

type AssignmentGenerationResult =
    | {
          assignments: AssignmentResult[];
          round: TournamentRoundEntity;
      }
    | ReturnType<TournamentRoundModel['formatErrors']>;

export default class TournamentRoundModel extends BaseModel {
    private tournamentRoundRepository: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TournamentPlayer), context);
        this.tournamentRoundRepository = connection.getRepository(TournamentRoundEntity);
    }

    async getAllRounds(tournamentUuid: string) {
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

            const rounds = await this.tournamentRoundRepository.find({
                where: { tournamentId: tournament.id },
                order: { round: 'ASC' },
                relations: ['tournament'],
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

    async index(params:TournamentRoundFilterInput) {
        const { tournamentUuid, round } = params;
        const tournament = await this.context.tournament.repository.findOne({
            where: { uuid: tournamentUuid }
        });

        if (!tournament) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
        }

        if (!(await accessRulesByRoleHierarchy(this.context, { companyId: tournament.companyId }))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }

        const rows = await this.context.tournamentRoundPlayer.repository.find({
            relations: ['customer', 'table'],
            where: { tournamentId: tournament.id, round }
        });

        let tournamentRounds:any = []
        if (rows.length) {
            const obj:any = {}
            for (const row of rows) {
                if (!obj[row.tableId]) {
                    obj[row.tableId] = {
                        tableId: row.tableId,
                        table: row.table,
                        customers: []
                    }
                }
                obj[row.tableId].customers.push({
                    uuid: row.customer.uuid,
                    phone: row.customer.phone,
                    isWinner: row.isWinner
                });
            }
            tournamentRounds.push(obj);
        }

        return { list: tournamentRounds }
    }

    async tournamentRound(tournamentUuid: string, round: number) {
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

            // Get the tournament round
            const tournamentRound = await this.tournamentRoundRepository.findOne({
                where: { tournamentId: tournament.id, round },
                relations: ['tournament'],
            });

            if (!tournamentRound) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament round not found');
            }

            // Get all players for this round, grouped by table
            let roundPlayers = await this.context.tournamentRoundPlayer.repository.find({
                where: { tournamentRoundId: tournamentRound.id },
                relations: ['customer', 'table', 'tournamentRound'],
                order: { tableId: 'ASC' },
            });

            // If no TournamentRoundPlayer records exist, create them from TournamentPlayer records
            if (!roundPlayers.length) {
                const tournamentPlayers = await this.repository.find({
                    where: { 
                        tournamentId: tournament.id, 
                        currentRound: round 
                    },
                    relations: ['customer', 'table'],
                });

                if (tournamentPlayers.length > 0) {
                    // Create TournamentRoundPlayer records from TournamentPlayer data
                    const roundPlayerRepository = this.connection.getRepository(TournamentRoundPlayerEntity);
                    const newRoundPlayers = tournamentPlayers.map((player: TournamentPlayer) => {
                        return roundPlayerRepository.create({
                            tournamentRoundId: tournamentRound.id,
                            customerId: player.customerId,
                            tableId: player.tableId,
                            isWinner: player.isWinner,
                        });
                    });
                    await roundPlayerRepository.save(newRoundPlayers);

                    // Reload with relations
                    roundPlayers = await this.context.tournamentRoundPlayer.repository.find({
                        where: { tournamentRoundId: tournamentRound.id },
                        relations: ['customer', 'table', 'tournamentRound'],
                        order: { tableId: 'ASC' },
                    });
                }
            }

            // Group players by table
            const tablesData: any = {};
            roundPlayers.forEach((player: any) => {
                const tableKey = player.tableId || 'unassigned';
                if (!tablesData[tableKey]) {
                    tablesData[tableKey] = {
                        tableId: player.tableId,
                        table: player.table,
                        players: [],
                    };
                }
                tablesData[tableKey].players.push({
                    id: player.id,
                    customerId: player.customerId,
                    customerUuid: player.customer?.uuid,
                    isWinner: player.isWinner,
                    customer: player.customer,
                });
            });

            return {
                status: true,
                data: {
                    round: tournamentRound,
                    tables: Object.values(tablesData),
                },
                errors: null,
                errorMessage: null,
            };
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }

    async startTournament(input: StartTournamentInput) {
        const { tournamentUuid, randomize } = input;
        const { data, errors, errorMessage } = await this.startTournamentValidate(tournamentUuid);
        if (errors.length > 0) {
            return this.formatErrors(errors, errorMessage);
        }

        const { tournament } = data;
        const players = await this.context.tournamentPlayer.repository.find({
            where: { tournamentId: tournament.id },
            relations: ['customer']
        });

        if (!players.length) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'No registered players for this tournament');
        }

        const assignmentResult = await this.generateRoundAssignments({
            tournament,
            round: 1,
            players,
            randomize,
        });
        if ('errors' in assignmentResult) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'No players available for this round');
        }

        tournament.status = TournamentStatus.ACTIVE;
        tournament.currentRound = 1;
        tournament.startedAt = new Date();
        await this.context.tournament.repository.save(tournament);

        return this.successResponse({ tournament, round: assignmentResult.round })
    }

    private async startTournamentValidate(tournamentUuid: string) {
        let errors: any = [], errorMessage:any = null, data: any = {};
        data.tournament = await this.context.tournament.repository.findOne({
            where: { uuid: tournamentUuid }
        });
        if (!data.tournament) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
        }

        if (data.tournament.status !== TournamentStatus.UPCOMING) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'Tournament already started');
        }

        if (!this.hasStartTimeArrived(data.tournament)) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'Tournament start time not reached yet');
        }
        
        if (!(await accessRulesByRoleHierarchy(this.context, { companyId: data.tournament.companyId }))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }

        return { data, errors, errorMessage }
    }

    async completeTournamentRound(input: CompleteTournamentRoundInput) {
        const { tournamentUuid, round, winnerCustomerIds } = input;
        const tournament = await this.context.tournament.repository.findOne({
            where: { uuid: tournamentUuid }
        });
        if (!tournament) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
        }

        if (tournament.status !== TournamentStatus.ACTIVE) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'Tournament is not active');
        }

        if (!(await accessRulesByRoleHierarchy(this.context, { companyId: tournament.companyId }))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }

        const targetRound = round ?? tournament.currentRound;
        if (!targetRound) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'No active round to complete');
        }

        if (!winnerCustomerIds || winnerCustomerIds.length === 0) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'Provide at least one winner');
        }

        const roundEntryCount = await this.repository.count({
            where: { tournamentId: tournament.id, currentRound: targetRound },
        });
        if (!roundEntryCount) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Round entries not found');
        }

        await this.repository
            .createQueryBuilder()
            .update(TournamentPlayer)
            .set({ isWinner: false })
            .where('tournament_id = :tournamentId AND current_round = :round', {
                tournamentId: tournament.id,
                round: targetRound,
            })
            .execute();

        await this.repository
            .createQueryBuilder()
            .update(TournamentPlayer)
            .set({ isWinner: true })
            .where('tournament_id = :tournamentId AND current_round = :round AND customer_id IN (:...winnerIds)', {
                tournamentId: tournament.id,
                round: targetRound,
                winnerIds: winnerCustomerIds,
            })
            .execute();

        const winners = await this.repository.find({
            where: { tournamentId: tournament.id, currentRound: targetRound, isWinner: true },
            relations: ['customer', 'table'],
        });
        const winnerViews = winners.map((entry: TournamentPlayer) => this.toRoundView(entry));
        if (!winnerViews.length) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'No matching winners found for provided customers');
        }

        if (targetRound === tournament.totalRounds || winnerViews.length === 1) {
            tournament.status = TournamentStatus.COMPLETED;
            tournament.completedAt = new Date();
            await this.context.tournament.repository.save(tournament);
        }

        // Also update TournamentRoundPlayer records
        const roundEntity = await this.tournamentRoundRepository.findOne({
            where: { tournamentId: tournament.id, round: targetRound }
        });
        
        if (roundEntity) {
            const roundPlayerRepository = this.connection.getRepository(TournamentRoundPlayerEntity);
            // Reset all winners for this round
            await roundPlayerRepository.update(
                { tournamentRoundId: roundEntity.id },
                { isWinner: false }
            );
            // Set winners using In operator
            await roundPlayerRepository
                .createQueryBuilder()
                .update(TournamentRoundPlayerEntity)
                .set({ isWinner: true })
                .where('tournament_round_id = :roundId AND customer_id IN (:...winnerIds)', {
                    roundId: roundEntity.id,
                    winnerIds: winnerCustomerIds,
                })
                .execute();
        }

        return this.successResponse({ tournament, winners: winnerViews })
    }

    private async startNextTournamentRoundValidate(tournamentUuid: string) {
        let errors: any = [], errorMessage:any = null, data: any = {};
        data.tournament = await this.context.tournament.repository.findOne({
            where: { uuid: tournamentUuid }
        });
        if (!data.tournament) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
        }

        if (data.tournament.status !== TournamentStatus.ACTIVE) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'Tournament is not running');
        }

        if (!(await accessRulesByRoleHierarchy(this.context, { companyId: data.tournament.companyId }))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }

        data.winners = await this.repository.find({
            where: { tournamentId: data.tournament.id, currentRound: data.tournament.currentRound, isWinner: true },
            relations: ['customer'],
        });

        if (!data.winners.length) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Set winners before starting next round');
        }

        return { data, errors, errorMessage }
    }

    async startNextTournamentRound(input: StartNextTournamentRoundInput) {
        const { tournamentUuid, randomize } = input;
        const { data, errors, errorMessage } = await this.startNextTournamentRoundValidate(tournamentUuid);
        if (errors.length > 0) {
            return this.formatErrors(errors, errorMessage);
        }

        const { tournament, winners } = data;
        const nextRound = tournament.currentRound + 1;
        const assignmentResult = await this.generateRoundAssignments({ tournament, round: nextRound, players: winners, randomize });
        if ('errors' in assignmentResult) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'No players available for this round');
        }

        return this.successResponse({ tournament, round: assignmentResult.round })
    }

    private async generateRoundAssignments({
        tournament,
        round,
        players,
        randomize,
    }: {
        tournament: Tournament;
        round: number;
        players: TournamentPlayer[];
        randomize?: boolean;
    }): Promise<AssignmentGenerationResult> {

        const tables: Table[] = await this.context.table.repository.find({
            where: { companyId: tournament.companyId, status: TableStatus.ACTIVE }
        });

        if (!tables.length) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'No tables available for this tournament');
        }

        const groupSize = tournament.groupSize || 4;
        const expectedTables = Math.ceil(((tournament.playerLimit || players.length) || 0) / groupSize) || 1;
        if (tables.length < expectedTables) {
            return this.formatErrors(
                [GlobalError.VALIDATION_ERROR],
                `Not enough tables. Required ${expectedTables}, available ${tables.length}`,
            );
        }

        const shuffled = [...players];
        if (randomize) {
            this.shuffle(shuffled);
        }

        const activeTables = tables.slice(0, expectedTables);
        const updatedPlayers: TournamentPlayer[] = [];
        const assignments: AssignmentResult[] = [];

        activeTables.forEach((table, index) => {
            const start = index * groupSize;
            const group = shuffled.slice(start, start + groupSize);
            if (!group.length) {
                return;
            }

            const playerRounds: RoundView[] = [];
            const playerIds: number[] = [];

            group.forEach((player: TournamentPlayer) => {
                player.currentRound = round;
                player.isWinner = false;
                player.tableId = table.id;
                player.table = table;
                updatedPlayers.push(player);
                playerIds.push(player.customerId);
                playerRounds.push(this.toRoundView(player));
            });

            assignments.push({
                round,
                tableId: table.id,
                table,
                playerIds,
                entries: playerRounds,
            });
        });

        await this.repository.save(updatedPlayers);

        const roundRepository = this.connection.getRepository(TournamentRoundEntity);
        let roundEntity = await roundRepository.findOne({
            where: { tournamentId: tournament.id, round }
        });
        if (!roundEntity) {
            roundEntity = roundRepository.create({
                tournamentId: tournament.id,
                round,
                playerCount: updatedPlayers.length,
                tableCount: activeTables.length,
                status: TournamentRoundStatus.ACTIVE,
                startedAt: new Date()
            });
        } else {
            roundEntity.playerCount = updatedPlayers.length;
            roundEntity.tableCount = activeTables.length;
            roundEntity.status = TournamentRoundStatus.ACTIVE;
            roundEntity.startedAt = new Date();
        }
        await roundRepository.save(roundEntity);

        // Create TournamentRoundPlayer records for each assigned player
        const roundPlayerRepository = this.connection.getRepository(TournamentRoundPlayerEntity);
        
        // Delete existing round players for this round (in case of re-assignment)
        await roundPlayerRepository.delete({ tournamentRoundId: roundEntity.id });

        // Create new round player records
        const roundPlayers = updatedPlayers.map((player: TournamentPlayer) => {
            return roundPlayerRepository.create({
                tournamentRoundId: roundEntity.id,
                customerId: player.customerId,
                tableId: player.tableId,
                isWinner: false,
            });
        });
        await roundPlayerRepository.save(roundPlayers);

        return { assignments, round: roundEntity };
    }

    private toRoundView(player: TournamentPlayer): RoundView {
        return {
            id: player.id,
            tournamentId: player.tournamentId,
            customerId: player.customerId,
            tableId: player.tableId ?? null,
            round: player.currentRound,
            isWinner: player.isWinner,
            createdAt: player.createdAt,
            customer: player.customer,
            table: player.table || null,
        };
    }

    private shuffle(list: TournamentPlayer[]) {
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
    }

    private hasStartTimeArrived(tournament: Tournament) {
        if (!tournament.date || !tournament.startTime) {
            return true;
        }
        const isoString = `${tournament.date}T${tournament.startTime}`;
        const scheduled = new Date(isoString);
        if (Number.isNaN(scheduled.getTime())) {
            return true;
        }
        return new Date() >= scheduled;
    }
}

