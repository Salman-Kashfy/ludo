import BaseModel from '../baseModel';
import { Tournament as TournamentEntity } from '../../database/entity/Tournament';
import { Company } from '../../database/entity/Company';
import { Status, Roles } from '../../database/entity/root/enums';
import { TournamentInput, TournamentFilter, TournamentFormat, TournamentStatus, MatchStatus } from './types';
import Context from '../context';
import { GlobalError } from '../root/enum';
import { isEmpty } from 'lodash';
import { accessRulesByRoleHierarchy, accessRulesByRoleHierarchyUuid } from '../../shared/lib/DataRoleUtils';
import { PagingInterface } from '../../interfaces';

export default class Tournament extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TournamentEntity), context);
    }

    async index(paging: PagingInterface, params: TournamentFilter) {

        if (!(await accessRulesByRoleHierarchyUuid(this.context, {companyUuid: params.companyUuid}))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }
        
        // Get company ID from company UUID
        const company = await this.context.company.repository.findOne({ where: { uuid: params.companyUuid } });
        if (!company) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Company not found');
        }
        
        const query = this.repository
            .createQueryBuilder('tournament')
            .leftJoinAndSelect('tournament.category', 'category')
            .andWhere('tournament.companyId = :companyId', { companyId: company.id });

        // By default only active tournaments
        if (params.status) {
            query.andWhere('tournament.status = :status', { status: params.status });
        }

        if (!isEmpty(params.searchText)) {
            query.andWhere('tournament.name ILIKE :searchText', { searchText: `%${params.searchText}%` });
        }

        if (params.dateFrom && params.dateTo) {
            query.andWhere('tournament.date BETWEEN :from AND :to', {
                from: params.dateFrom,
                to: params.dateTo,
            });
        } else if (params.dateFrom) {
            query.andWhere('tournament.date >= :from', { from: params.dateFrom });
        } else if (params.dateTo) {
            query.andWhere('tournament.date <= :to', { to: params.dateTo });
        }

        query.orderBy('tournament.date', 'DESC').addOrderBy('tournament.startTime', 'ASC');

        return this.paginator(query, paging);
    }

    async show(uuid: string) {
        try {
            const data = await this.repository.findOne({
                where: { uuid },
                relations: ['company', 'category'],
            });

            if (!data || data.status === Status.INACTIVE) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
            }

            if (!(await accessRulesByRoleHierarchy(this.context, { companyId: data.companyId }))) {
                return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
            }

            return this.successResponse(data);
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }

    async saveValidate(input: TournamentInput) {
        const errors: GlobalError[] = [];
        let errorMessage: string | null = null;
        const data: any = {};

        if (!(await accessRulesByRoleHierarchyUuid(this.context, { companyUuid: input.companyUuid }))) {
            return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
        }

        data.company = await this.context.company.repository.findOne({ where: { uuid: input.companyUuid } });
        if (!data.company) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Company not found');
        }

        data.category = await this.context.category.repository.findOne({ where: { uuid: input.categoryUuid } });
        if (!data.category) {
            return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Category not found');
        }

        if (isEmpty(input.name)) {
            errors.push(GlobalError.REQUIRED_FIELDS_MISSING);
            errorMessage = 'Tournament name is required';
        }

        if (isEmpty(input.date)) {
            errors.push(GlobalError.REQUIRED_FIELDS_MISSING);
            errorMessage = 'Tournament date is required';
        }

        if (isEmpty(input.startTime)) {
            errors.push(GlobalError.REQUIRED_FIELDS_MISSING);
            errorMessage = 'Start time is required';
        }

        if (!input.playerLimit || input.playerLimit < 2) {
            errors.push(GlobalError.INVALID_INPUT);
            errorMessage = 'Player limit must be at least 2';
        }

        if (input.uuid) {
            const existing = await this.repository.findOne({ 
                where: { uuid: input.uuid },
                relations: ['company'],
            });
            if (!existing) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
            }

            if (!(await accessRulesByRoleHierarchy(this.context, { companyId: existing.companyId }))) {
                return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
            }

            data.existing = existing;
        }

        if (errors.length > 0) {
            return { data: null, errors, errorMessage };
        }

        return { data, errors, errorMessage };
    }

    async save(input: TournamentInput) {
        const validationResult = await this.saveValidate(input);
        if ('status' in validationResult && validationResult.status === false) {
            return validationResult;
        }

        const { data, errors, errorMessage } = validationResult;
        if (!isEmpty(errors)) {
            return this.formatErrors(errors, errorMessage);
        }

        try {
            const { existing, company, category } = data;
            let tournament: TournamentEntity = existing || new TournamentEntity();

            tournament.name = input.name;
            tournament.date = input.date;
            tournament.startTime = input.startTime;
            tournament.entryFee = input.entryFee ?? 0;
            tournament.prizePool = input.prizePool ?? 0;
            tournament.currencyName = input.currencyName ?? 'PKR';
            tournament.playerLimit = input.playerLimit;
            tournament.format = input.format ?? TournamentFormat.GROUP_STAGE;
            tournament.playersPerGroup = input.playersPerGroup;
            tournament.numberOfRounds = input.numberOfRounds;
            tournament.status = input.status;
            tournament.companyId = company.id;
            tournament.categoryId = category.id;
            tournament.createdById = tournament.createdById || this.context.user.id;
            tournament.lastUpdatedById = this.context.user.id;

            const saved = await this.repository.save(tournament);
            return this.successResponse(saved);
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }

    async delete(uuid: string) {
        try {
            const tournament = await this.repository.findOne({ 
                where: { uuid },
                relations: ['company'],
            });
            if (!tournament) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
            }

            if (!(await accessRulesByRoleHierarchy(this.context, { companyId: tournament.companyId }))) {
                return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
            }

            tournament.status = Status.INACTIVE;
            tournament.lastUpdatedById = this.context.user.id;
            await this.repository.save(tournament);

            return this.successResponse(true);
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }

    async startTournament(tournamentUuid: string) {
        try {
            const tournament = await this.repository.findOne({
                where: { uuid: tournamentUuid },
                relations: ['company', 'category'],
            });

            if (!tournament) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Tournament not found');
            }

            if (!(await accessRulesByRoleHierarchy(this.context, { companyId: tournament.companyId }))) {
                return this.formatErrors([GlobalError.NOT_ALLOWED], 'Permission denied');
            }

            if (tournament.status !== TournamentStatus.UPCOMING) {
                return this.formatErrors([GlobalError.VALIDATION_ERROR], 'Tournament is not in UPCOMING status');
            }

            if (tournament.playerCount < tournament.playerLimit) {
                return this.formatErrors([GlobalError.VALIDATION_ERROR], `Tournament requires ${tournament.playerLimit} players, but only ${tournament.playerCount} are registered`);
            }

            // Get all registered players
            const tournamentPlayers = await this.context.tournamentPlayer.repository.find({
                where: { tournamentId: tournament.id },
                relations: ['customer', 'table'],
                order: { id: 'ASC' },
            });

            if (tournamentPlayers.length !== tournament.playerLimit) {
                return this.formatErrors([GlobalError.VALIDATION_ERROR], 'Player count mismatch');
            }

            // Get available tables for the tournament's category
            const availableTables = await this.context.table.repository.find({
                where: {
                    categoryId: tournament.categoryId,
                    status: Status.ACTIVE,
                },
                order: { sortNo: 'ASC' },
            });

            if (availableTables.length === 0) {
                return this.formatErrors([GlobalError.VALIDATION_ERROR], 'No available tables for this tournament category');
            }

            // Calculate rounds based on format
            let rounds: Array<{
                roundNumber: number;
                roundName: string;
                playersCount: number;
                groupsCount: number;
                matchesCount: number;
            }> = [];

            if (tournament.format === TournamentFormat.GROUP_STAGE) {
                const playersPerGroup = tournament.playersPerGroup || 4;
                const groupsCount = Math.floor(tournament.playerLimit / playersPerGroup);
                const finalRoundPlayers = groupsCount;

                // Round 1: Group Stage
                rounds.push({
                    roundNumber: 1,
                    roundName: 'Group Stage',
                    playersCount: tournament.playerLimit,
                    groupsCount: groupsCount,
                    matchesCount: groupsCount,
                });

                // Final Round
                rounds.push({
                    roundNumber: 2,
                    roundName: 'Finals',
                    playersCount: finalRoundPlayers,
                    groupsCount: 1,
                    matchesCount: 1,
                });

                tournament.numberOfRounds = 2;
            } else {
                // SINGLE_ELIMINATION
                let currentPlayers = tournament.playerLimit;
                let roundNumber = 1;
                const playersPerMatch = 4; // Ludo is typically 4 players per match

                while (currentPlayers > 1) {
                    const matchesCount = Math.ceil(currentPlayers / playersPerMatch);
                    const nextRoundPlayers = matchesCount; // Winners advance

                    rounds.push({
                        roundNumber: roundNumber,
                        roundName: roundNumber === 1 ? 'Round 1' : 
                                   matchesCount === 1 ? 'Finals' : 
                                   `Round ${roundNumber}`,
                        playersCount: currentPlayers,
                        groupsCount: 1,
                        matchesCount: matchesCount,
                    });

                    currentPlayers = nextRoundPlayers;
                    roundNumber++;
                }

                tournament.numberOfRounds = rounds.length;
            }

            // Use transaction to create all rounds, matches, and assignments
            const result = await this.connection.manager.transaction(async (transactionalEntityManager: any) => {
                // Create all rounds
                const createdRounds: any[] = [];
                for (const roundData of rounds) {
                    const round = transactionalEntityManager.create(
                        this.context.tournamentRound.repository.target,
                        {
                            tournamentId: tournament.id,
                            roundNumber: roundData.roundNumber,
                            roundName: roundData.roundName,
                            playersCount: roundData.playersCount,
                            groupsCount: roundData.groupsCount,
                            matchesCount: roundData.matchesCount,
                            completedMatches: 0,
                            isCompleted: false,
                        }
                    );
                    const savedRound = await transactionalEntityManager.save(round);
                    createdRounds.push(savedRound);
                }

                // Create matches for Round 1 only
                const round1 = createdRounds[0];
                const matches: any[] = [];
                const matchPlayers: any[] = [];

                if (tournament.format === TournamentFormat.GROUP_STAGE) {
                    // Shuffle players randomly for group stage
                    const shuffledPlayers = [...tournamentPlayers].sort(() => Math.random() - 0.5);
                    const playersPerGroup = tournament.playersPerGroup || 4;

                    for (let groupNum = 1; groupNum <= round1.groupsCount; groupNum++) {
                        const table = availableTables[(groupNum - 1) % availableTables.length];
                        const match = transactionalEntityManager.create(
                            this.context.tournamentMatch.repository.target,
                            {
                                tournamentId: tournament.id,
                                roundId: round1.id,
                                roundNumber: 1,
                                matchNumber: groupNum,
                                groupNumber: groupNum,
                                tableId: table.id,
                                status: MatchStatus.PENDING,
                            }
                        );
                        const savedMatch = await transactionalEntityManager.save(match);
                        matches.push(savedMatch);

                        // Assign players to this match/group
                        const startIdx = (groupNum - 1) * playersPerGroup;
                        const groupPlayers = shuffledPlayers.slice(startIdx, startIdx + playersPerGroup);

                        for (let pos = 0; pos < groupPlayers.length; pos++) {
                            const matchPlayer = transactionalEntityManager.create(
                                this.context.tournamentMatchPlayer.repository.target,
                                {
                                    matchId: savedMatch.id,
                                    tournamentPlayerId: groupPlayers[pos].id,
                                    position: pos + 1,
                                }
                            );
                            matchPlayers.push(matchPlayer);
                        }
                    }
                } else {
                    // SINGLE_ELIMINATION - assign players sequentially to matches
                    const playersPerMatch = 4;
                    let matchNum = 1;
                    let playerIdx = 0;

                    while (playerIdx < tournamentPlayers.length) {
                        const table = availableTables[(matchNum - 1) % availableTables.length];
                        const match = transactionalEntityManager.create(
                            this.context.tournamentMatch.repository.target,
                            {
                                tournamentId: tournament.id,
                                roundId: round1.id,
                                roundNumber: 1,
                                matchNumber: matchNum,
                                tableId: table.id,
                                status: MatchStatus.PENDING,
                            }
                        );
                        const savedMatch = await transactionalEntityManager.save(match);
                        matches.push(savedMatch);

                        // Assign players to this match
                        const matchPlayersSlice = tournamentPlayers.slice(playerIdx, playerIdx + playersPerMatch);
                        for (let pos = 0; pos < matchPlayersSlice.length; pos++) {
                            const matchPlayer = transactionalEntityManager.create(
                                this.context.tournamentMatchPlayer.repository.target,
                                {
                                    matchId: savedMatch.id,
                                    tournamentPlayerId: matchPlayersSlice[pos].id,
                                    position: pos + 1,
                                }
                            );
                            matchPlayers.push(matchPlayer);
                        }

                        playerIdx += playersPerMatch;
                        matchNum++;
                    }
                }

                // Save all match players
                await transactionalEntityManager.save(matchPlayers);

                // Update tournament
                tournament.status = TournamentStatus.RUNNING;
                tournament.currentRound = 1;
                tournament.lastUpdatedById = this.context.user.id;
                await transactionalEntityManager.save(tournament);

                return tournament;
            });

            // Fetch updated tournament with relations
            const updatedTournament = await this.repository.findOne({
                where: { id: tournament.id },
                relations: ['company', 'category', 'winner'],
            });

            return this.successResponse(updatedTournament);
        } catch (error: any) {
            console.error('Start tournament error:', error);
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }
}

