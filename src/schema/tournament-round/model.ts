import BaseModel from '../baseModel';
import Context from '../context';
import { GlobalError } from '../root/enum';
import { accessRulesByRoleHierarchy } from '../../shared/lib/DataRoleUtils';
import { Tournament } from '../../database/entity/Tournament';
import { Table } from '../../database/entity/Table';
import { TournamentPlayer } from '../../database/entity/TournamentPlayer';
import { TournamentStatus } from '../tournament/types';

type TournamentRoundFilterInput = {
    tournamentUuid: string;
    round?: number;
    tableId?: number;
    customerId?: number;
    winnersOnly?: boolean;
    paging?: any;
};

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
      }
    | ReturnType<TournamentRoundModel['formatErrors']>;

export default class TournamentRoundModel extends BaseModel {
    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TournamentPlayer), context);
    }

    private async resolveTournament(tournamentUuid: string): Promise<Tournament | null> {
        if (!tournamentUuid) {
            return null;
        }
        return this.context.tournament.repository.findOne({
            where: { uuid: tournamentUuid },
            relations: ['company'],
        });
    }

    async list(params: TournamentRoundFilterInput) {
        const { tournamentUuid, round, tableId, customerId, winnersOnly, paging } = params;
        const tournament = await this.resolveTournament(tournamentUuid);
        if (!tournament) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
        }

        const hasAccess = await accessRulesByRoleHierarchy(this.context, { companyId: tournament.companyId });
        if (!hasAccess) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }

        const query = this.repository
            .createQueryBuilder('players')
            .where('players.tournament_id = :tournamentId', { tournamentId: tournament.id })
            .leftJoinAndSelect('players.customer', 'customer')
            .leftJoinAndSelect('players.table', 'table')
            .orderBy('players.current_round', 'ASC')
            .addOrderBy('players.table_id', 'ASC')
            .addOrderBy('players.id', 'ASC');

        if (typeof round === 'number') {
            query.andWhere('players.current_round = :round', { round });
        }
        if (typeof tableId === 'number') {
            query.andWhere('players.table_id = :tableId', { tableId });
        }
        if (typeof customerId === 'number') {
            query.andWhere('players.customer_id = :customerId', { customerId });
        }
        if (winnersOnly) {
            query.andWhere('players.is_winner = true');
        }

        const { list, paging: pagingMeta } = await this.paginator(query, paging);
        return {
            status: true,
            list: list.map((player: TournamentPlayer) => this.toRoundView(player)),
            paging: pagingMeta,
            errors: null,
            errorMessage: null,
        };
    }

    async startTournament(input: StartTournamentInput) {
        const { tournamentUuid, randomize } = input;
        const validationResult = await this.validateTournamentStart(tournamentUuid);
        if ('status' in validationResult && validationResult.status === false) {
            return validationResult;
        }

        const { tournament } = validationResult as { tournament: Tournament };

        const players = await this.fetchTournamentPlayers(tournament.id);
        if (!players.length) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'No registered players for this tournament');
        }

        players.forEach((player) => {
            player.currentRound = 0;
            player.isWinner = false;
            player.tableId = undefined;
            player.table = undefined;
        });
        await this.repository.save(players);

        const assignmentResult = await this.generateRoundAssignments({
            tournament,
            round: 1,
            players,
            randomize,
        });
        if ('errors' in assignmentResult) {
            return assignmentResult;
        }

        tournament.status = TournamentStatus.ACTIVE;
        tournament.currentRound = 1;
        tournament.startedAt = new Date();
        await this.context.tournament.repository.save(tournament);

        return {
            status: true,
            assignments: assignmentResult.assignments,
            tournament,
            errors: null,
            errorMessage: null,
        };
    }

    private async validateTournamentStart(tournamentUuid: string) {
        const tournament = await this.resolveTournament(tournamentUuid);
        if (!tournament) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
        }

        if (tournament.status !== TournamentStatus.BOOKED) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'Tournament already started');
        }

        if (!this.hasStartTimeArrived(tournament)) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'Tournament start time not reached yet');
        }

        const hasAccess = await accessRulesByRoleHierarchy(this.context, { companyId: tournament.companyId });
        if (!hasAccess) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }

        return { tournament };
    }

    async completeTournamentRound(input: CompleteTournamentRoundInput) {
        const { tournamentUuid, round, winnerCustomerIds } = input;
        const tournament = await this.resolveTournament(tournamentUuid);
        if (!tournament) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
        }

        if (tournament.status !== TournamentStatus.RUNNING) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'Tournament is not running');
        }

        const hasAccess = await accessRulesByRoleHierarchy(this.context, { companyId: tournament.companyId });
        if (!hasAccess) {
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

        return {
            status: true,
            winners: winnerViews,
            tournament,
            errors: null,
            errorMessage: null,
        };
    }

    async startNextTournamentRound(input: StartNextTournamentRoundInput) {
        const { tournamentUuid, randomize } = input;
        const tournament = await this.resolveTournament(tournamentUuid);
        if (!tournament) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
        }

        if (tournament.status !== TournamentStatus.RUNNING) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'Tournament is not running');
        }

        const hasAccess = await accessRulesByRoleHierarchy(this.context, { companyId: tournament.companyId });
        if (!hasAccess) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }

        if (!tournament.currentRound) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'Tournament has not started');
        }

        if (tournament.currentRound >= tournament.totalRounds) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'All rounds have already been generated');
        }

        const winners = await this.repository.find({
            where: { tournamentId: tournament.id, currentRound: tournament.currentRound, isWinner: true },
            relations: ['customer'],
        });

        if (!winners.length) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Set winners before starting next round');
        }

        const nextRound = tournament.currentRound + 1;
        const assignmentResult = await this.generateRoundAssignments({
            tournament,
            round: nextRound,
            players: winners,
            randomize,
        });
        if ('errors' in assignmentResult) {
            return assignmentResult;
        }

        tournament.currentRound = nextRound;
        await this.context.tournament.repository.save(tournament);

        return {
            status: true,
            assignments: assignmentResult.assignments,
            tournament,
            errors: null,
            errorMessage: null,
        };
    }

    private async fetchTournamentPlayers(tournamentId: number): Promise<TournamentPlayer[]> {
        return this.context.tournamentPlayer.repository.find({
            where: { tournamentId },
            relations: ['customer'],
            order: { id: 'ASC' },
        });
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
        if (!players.length) {
            return this.formatErrors([GlobalError.INVALID_INPUT], 'No players available for this round');
        }

        const tables: Table[] = await this.context.table.repository.find({
            where: { companyId: tournament.companyId },
            order: { sortNo: 'ASC', id: 'ASC' },
        });

        if (!tables.length) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'No tables available for this tournament');
        }

        const groupSize = tournament.groupSize || 4;
        const requiredTables = Math.ceil(players.length / groupSize);
        if (tables.length < requiredTables) {
            return this.formatErrors(
                [GlobalError.VALIDATION_ERROR],
                `Not enough tables. Required ${requiredTables}, available ${tables.length}`,
            );
        }

        const shuffled = [...players];
        if (randomize) {
            this.shuffle(shuffled);
        }

        const activeTables = tables.slice(0, requiredTables);
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

        return { assignments };
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

