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
import {
    AssignmentGenerationResult,
    AssignmentResult,
    CompleteTournamentRoundInput,
    GenerateRoundAssignmentsParams,
    RoundView,
    StartNextTournamentRoundInput,
    StartTournamentInput,
    TournamentRoundFilterInput,
    TournamentRoundStatus,
} from './types';
import { TableStatus } from '../table/types';
import { In } from 'typeorm';

export default class TournamentRoundModel extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TournamentRoundEntity), context);
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

            const rounds = await this.repository.find({
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

    async show(tournamentUuid: string, round: number) {
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

            const tournamentRound = await this.repository.findOne({
                where: { tournamentId: tournament.id, round },
                relations: ['tournament'],
            });

            if (!tournamentRound) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament round not found');
            }

            let roundPlayers = await this.context.tournamentRoundPlayer.repository.find({
                where: { tournamentRoundId: tournamentRound.id },
                relations: ['customer', 'table', 'tournamentRound'],
                order: { tableId: 'ASC' },
            });

            if (!roundPlayers.length) {
                const tournamentPlayers = await this.context.tournamentPlayer.repository.find({
                    where: { 
                        tournamentId: tournament.id, 
                        currentRound: round 
                    },
                    relations: ['customer'],
                });

                if (tournamentPlayers.length > 0) {
                    const roundPlayerRepository = this.connection.getRepository(TournamentRoundPlayerEntity);
                    const newRoundPlayers = tournamentPlayers.map((player: TournamentPlayer) => {
                        return roundPlayerRepository.create({
                            tournamentRoundId: tournamentRound.id,
                            customerId: player.customerId,
                            tableId: null, // TournamentPlayer doesn't have tableId - it's only in TournamentRoundPlayer
                            isWinner: false, // TournamentPlayer doesn't have isWinner - it's only in TournamentRoundPlayer
                        });
                    });
                    await roundPlayerRepository.save(newRoundPlayers);

                    roundPlayers = await this.context.tournamentRoundPlayer.repository.find({
                        where: { tournamentRoundId: tournamentRound.id },
                        relations: ['customer', 'table', 'tournamentRound'],
                        order: { tableId: 'ASC' },
                    });
                }
            }

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
            console.log(error);
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
        await tournament.save();

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

    async completeTournamentRoundValidate(input: CompleteTournamentRoundInput) {
        const { tournamentUuid, winnerCustomerUuid } = input;
        let data:any = {}, errors:any = [], errorMessage = ''

        data.tournament = await this.context.tournament.repository.findOne({
            where: { uuid: tournamentUuid, status: TournamentStatus.ACTIVE }
        });
        if (!data.tournament) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Active tournament not found');
        }

        if (!(await accessRulesByRoleHierarchy(this.context, { companyId: data.tournament.companyId }))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }

        const customers = await this.context.customer.repository.find({
            where: { uuid: In(winnerCustomerUuid) }
        });
        if (!customers.length || customers.length !== winnerCustomerUuid.length) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Invalid winner customers');
        }
        data.customerIds = customers.map((customer:any) => customer.id);

        data.tournamentRound = await this.repository.findOne({
            where: { tournamentId: data.tournament.id, round: data.tournament.currentRound },
        });
        if (!data.tournamentRound) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Round entries not found');
        }
        
        return { data, errors, errorMessage }
    }

    async completeTournamentRound(input: CompleteTournamentRoundInput) {

        try {
            const { data, errors, errorMessage } = await this.completeTournamentRoundValidate(input);
            if (errors.length > 0) {
                return this.formatErrors(errors, errorMessage);
            }
            
            const { tournament, tournamentRound, customerIds } = data;
    
            const transaction = await this.connection.manager.transaction(async (transactionalEntityManager: any) => {
                if (tournament.currentRound === tournament.totalRounds) {
                    tournament.status = TournamentStatus.COMPLETED;
                    tournament.completedAt = new Date();
                    await transactionalEntityManager.save(tournament);
                }
    
                tournamentRound.status = TournamentRoundStatus.COMPLETED;
                tournamentRound.completedAt = new Date();
    
                await transactionalEntityManager.save(tournamentRound);
                
                await this.context.tournamentRoundPlayer.repository
                    .createQueryBuilder()
                    .update(TournamentRoundPlayerEntity)
                    .set({ isWinner: true })
                    .where('tournament_round_id = :tournamentRoundId AND customer_id IN (:...customerIds)', {
                        tournamentRoundId: tournamentRound.id,
                        customerIds,
                    })
                    .execute(); 
            });
    
            if (transaction && transaction.error && transaction.error.length > 0) {
                console.log(transaction.error);
                return this.formatErrors(GlobalError.INTERNAL_SERVER_ERROR, transaction.error);
            }

            return this.successResponse({ tournament })
        } catch (error: any) {
            console.log(error);
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
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

        data.winners = await this.context.tournamentPlayer.repository.find({
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

    private async generateRoundAssignments(params: GenerateRoundAssignmentsParams): Promise<AssignmentGenerationResult> {
        const { tournament, round, players, randomize } = params;
        try {
            const groupSize = tournament.groupSize || 4;
            const expectedTables = Math.ceil(((tournament.playerLimit || players.length) || 0) / groupSize) || 1;
            
            const activeTables: Table[] = await this.context.table.repository.find({
                where: { companyId: tournament.companyId, status: TableStatus.ACTIVE },
                take: expectedTables
            });
    
            if (!activeTables.length) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'No tables available for this tournament');
            }
    
            if (activeTables.length < expectedTables) {
                return this.formatErrors(
                    [GlobalError.VALIDATION_ERROR],
                    `Not enough tables. Required ${expectedTables}, available ${activeTables.length}`,
                );
            }
    
            const shuffled = [...players];
            if (randomize) {
                this.shuffle(shuffled);
            }
    
            const assignments: AssignmentResult[] = [];
            const playerTableMap = new Map<number, number>(); // Map customerId to tableId
            const roundPlayerData: Array<{ customerId: number; tableId: number }> = [];
            
            activeTables.forEach((table, index) => {
                const start = index * groupSize;
                const group = shuffled.slice(start, start + groupSize);
                if (!group.length) {
                    return;
                }
    
                const playerRounds: RoundView[] = [];
                const playerIds: number[] = [];
    
                group.forEach((player: TournamentPlayer) => {
                    playerIds.push(player.customerId);
                    playerTableMap.set(player.customerId, table.id);
                    roundPlayerData.push({
                        customerId: player.customerId,
                        tableId: table.id
                    });
                    playerRounds.push(this.toRoundView(player, table.id, table, round, false));
                });
    
                assignments.push({
                    round,
                    tableId: table.id,
                    table,
                    playerIds,
                    entries: playerRounds,
                });
            });
    
            // Get or create TournamentRound
            let tournamentRound = await this.repository.findOne({
                where: { tournamentId: tournament.id, round }
            });
    
            if (!tournamentRound) {
                tournamentRound = this.repository.create({
                    tournamentId: tournament.id,
                    round,
                    playerCount: roundPlayerData.length,
                    tableCount: activeTables.length,
                    status: TournamentRoundStatus.ACTIVE,
                    startedAt: new Date()
                });
            } else {
                tournamentRound.playerCount = roundPlayerData.length;
                tournamentRound.tableCount = activeTables.length;
                tournamentRound.status = TournamentRoundStatus.ACTIVE;
                tournamentRound.startedAt = new Date();
            }
            await this.repository.save(tournamentRound);
    
            // Delete existing round players for this round (in case of re-assignment)
            await this.context.tournamentRoundPlayer.repository.delete({ tournamentRoundId: tournamentRound.id });
    
            // Create TournamentRoundPlayer records with table assignments
            const roundPlayers = roundPlayerData.map((data) => {
                return this.context.tournamentRoundPlayer.repository.create({
                    tournamentRoundId: tournamentRound.id,
                    customerId: data.customerId,
                    tableId: data.tableId,
                    isWinner: false,
                });
            });
            await this.context.tournamentRoundPlayer.repository.save(roundPlayers);
    
            return { assignments, round: tournamentRound };
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }

    private toRoundView(player: TournamentPlayer, tableId?: number, table?: Table, round?: number, isWinner?: boolean): RoundView {
        return {
            id: player.id,
            tournamentId: player.tournamentId,
            customerId: player.customerId,
            tableId: tableId ?? null,
            round: round ?? 0,
            isWinner: isWinner ?? false,
            createdAt: player.createdAt,
            customer: player.customer,
            table: table || null,
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

