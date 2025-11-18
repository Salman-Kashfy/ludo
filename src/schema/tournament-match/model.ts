import BaseModel from '../baseModel';
import { TournamentMatch as TournamentMatchEntity } from '../../database/entity/TournamentMatch';
import Context from '../context';
import { GlobalError } from '../root/enum';
import { MatchStatus, TournamentStatus, TournamentFormat } from '../tournament/types';
import { accessRulesByRoleHierarchy } from '../../shared/lib/DataRoleUtils';
import { PlayerTournamentStatus } from '../tournament-player/playerStatus';
import { Status } from '../../database/entity/root/enums';
import { In } from 'typeorm';

export default class TournamentMatch extends BaseModel {
    repository: any;
    connection: any;
    loaders: any;

    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(TournamentMatchEntity), context);
    }

    async getByTournamentUuid(tournamentUuid: string, roundNumber?: number) {
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

            const where: any = { tournamentId: tournament.id };
            if (roundNumber) {
                where.roundNumber = roundNumber;
            }

            const matches = await this.repository.find({
                where,
                relations: ['tournament', 'round', 'table', 'winner'],
                order: { roundNumber: 'ASC', matchNumber: 'ASC' },
            });

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

    async getByUuid(matchUuid: string) {
        try {
            const match = await this.repository.findOne({
                where: { uuid: matchUuid },
                relations: ['tournament', 'round', 'table', 'winner'],
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

            return this.successResponse(match);
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }

    async startMatch(matchUuid: string) {
        try {
            const match = await this.repository.findOne({
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

            if (match.status !== MatchStatus.PENDING) {
                return this.formatErrors([GlobalError.VALIDATION_ERROR], 'Match is not in PENDING status');
            }

            match.status = MatchStatus.IN_PROGRESS;
            match.startedAt = new Date();
            await this.repository.save(match);

            const updatedMatch = await this.repository.findOne({
                where: { id: match.id },
                relations: ['tournament', 'round', 'table', 'winner'],
            });

            return this.successResponse(updatedMatch);
        } catch (error: any) {
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }

    async declareWinner(matchUuid: string, winnerCustomerUuid: string) {
        try {
            const match = await this.repository.findOne({
                where: { uuid: matchUuid },
                relations: ['tournament', 'round'],
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

            if (match.status !== MatchStatus.IN_PROGRESS) {
                return this.formatErrors([GlobalError.VALIDATION_ERROR], 'Match is not in progress');
            }

            const customer = await this.context.customer.repository.findOne({
                where: { uuid: winnerCustomerUuid },
            });

            if (!customer) {
                return this.formatErrors([GlobalError.RECORD_NOT_FOUND], 'Customer not found');
            }

            // Validate customer is in tournament
            const tournamentPlayer = await this.context.tournamentPlayer.repository.findOne({
                where: {
                    tournamentId: tournament!.id,
                    customerId: customer.id,
                },
            });

            if (!tournamentPlayer) {
                return this.formatErrors([GlobalError.VALIDATION_ERROR], 'Customer is not registered in this tournament');
            }

            // Validate customer is in this match
            const matchPlayer = await this.context.tournamentMatchPlayer.repository.findOne({
                where: {
                    matchId: match.id,
                    tournamentPlayerId: tournamentPlayer.id,
                },
            });

            if (!matchPlayer) {
                return this.formatErrors([GlobalError.VALIDATION_ERROR], 'Customer is not in this match');
            }

            // Use transaction to ensure atomicity
            const result = await this.connection.manager.transaction(async (transactionalEntityManager: any) => {
                // Update match
                match.winnerCustomerId = customer.id;
                match.status = MatchStatus.COMPLETED;
                match.completedAt = new Date();
                await transactionalEntityManager.save(match);

                // Update round completed matches count
                const round = await transactionalEntityManager.findOne(
                    this.context.tournamentRound.repository.target,
                    { where: { id: match.roundId } }
                );
                round.completedMatches = (round.completedMatches || 0) + 1;
                await transactionalEntityManager.save(round);

                // Update tournament players status
                const allMatchPlayers = await transactionalEntityManager.find(
                    this.context.tournamentMatchPlayer.repository.target,
                    { where: { matchId: match.id } }
                );

                for (const mp of allMatchPlayers) {
                    const tp = await transactionalEntityManager.findOne(
                        this.context.tournamentPlayer.repository.target,
                        { where: { id: mp.tournamentPlayerId } }
                    );

                    if (tp.customerId === customer.id) {
                        // Winner
                        tp.status = PlayerTournamentStatus.ADVANCED;
                    } else {
                        // Loser
                        tp.status = PlayerTournamentStatus.ELIMINATED;
                        tp.eliminatedInRound = match.roundNumber;
                    }
                    await transactionalEntityManager.save(tp);
                }

                // Check if round is complete
                if (round.completedMatches >= round.matchesCount) {
                    round.isCompleted = true;
                    await transactionalEntityManager.save(round);

                    // Check if tournament is complete (all rounds done)
                    const allRounds = await transactionalEntityManager.find(
                        this.context.tournamentRound.repository.target,
                        { where: { tournamentId: tournament!.id } }
                    );

                    const allRoundsComplete = allRounds.every((r: any) => r.isCompleted);
                    if (allRoundsComplete) {
                        tournament!.status = TournamentStatus.COMPLETED;
                        tournament!.winnerCustomerId = customer.id;
                        tournament!.lastUpdatedById = this.context.user.id;
                        await transactionalEntityManager.save(tournament);

                        // Update winner's final position
                        const winnerTP = await transactionalEntityManager.findOne(
                            this.context.tournamentPlayer.repository.target,
                            { where: { tournamentId: tournament!.id, customerId: customer.id } }
                        );
                        winnerTP.status = PlayerTournamentStatus.WINNER;
                        winnerTP.finalPosition = 1;
                        await transactionalEntityManager.save(winnerTP);
                    } else {
                        // Advance to next round and create matches
                        const nextRoundNumber = match.roundNumber + 1;
                        tournament!.currentRound = nextRoundNumber;
                        tournament!.lastUpdatedById = this.context.user.id;
                        await transactionalEntityManager.save(tournament);

                        // Get next round
                        const nextRound = await transactionalEntityManager.findOne(
                            this.context.tournamentRound.repository.target,
                            { where: { tournamentId: tournament!.id, roundNumber: nextRoundNumber } }
                        );

                        if (nextRound) {
                            // Get winners from completed round (matches that just completed)
                            const completedMatches = await transactionalEntityManager.find(
                                this.context.tournamentMatch.repository.target,
                                { where: { tournamentId: tournament!.id, roundNumber: match.roundNumber, status: MatchStatus.COMPLETED } }
                            );

                            const winnerCustomerIds = completedMatches
                                .map((m: any) => m.winnerCustomerId)
                                .filter((id: number) => id !== null && id !== undefined);

                            // Get tournament players for winners
                            const winners = await transactionalEntityManager.find(
                                this.context.tournamentPlayer.repository.target,
                                { where: { tournamentId: tournament!.id, customerId: In(winnerCustomerIds) } }
                            );

                            // Get available tables
                            const availableTables = await transactionalEntityManager
                                .createQueryBuilder(this.context.table.repository.target, 'table')
                                .where('table.categoryId = :categoryId', { categoryId: tournament!.categoryId })
                                .andWhere('table.status = :status', { status: Status.ACTIVE })
                                .orderBy('table.sortNo', 'ASC')
                                .getMany();

                            if (availableTables.length === 0) {
                                throw new Error('No available tables for next round');
                            }

                            // Create matches for next round
                            const playersPerMatch = 4;
                            let matchNum = 1;
                            let playerIdx = 0;

                            while (playerIdx < winners.length) {
                                const table = availableTables[(matchNum - 1) % availableTables.length];
                                const newMatch = transactionalEntityManager.create(
                                    this.context.tournamentMatch.repository.target,
                                    {
                                        tournamentId: tournament!.id,
                                        roundId: nextRound.id,
                                        roundNumber: nextRoundNumber,
                                        matchNumber: matchNum,
                                        groupNumber: tournament!.format === TournamentFormat.GROUP_STAGE ? 1 : undefined,
                                        tableId: table.id,
                                        status: MatchStatus.PENDING,
                                    }
                                );
                                const savedMatch = await transactionalEntityManager.save(newMatch);

                                // Assign winners to this match
                                const matchPlayersSlice = winners.slice(playerIdx, playerIdx + playersPerMatch);
                                for (let pos = 0; pos < matchPlayersSlice.length; pos++) {
                                    // Reset status to ACTIVE for next round
                                    const tp = matchPlayersSlice[pos];
                                    tp.status = PlayerTournamentStatus.ACTIVE;
                                    await transactionalEntityManager.save(tp);

                                    const matchPlayer = transactionalEntityManager.create(
                                        this.context.tournamentMatchPlayer.repository.target,
                                        {
                                            matchId: savedMatch.id,
                                            tournamentPlayerId: tp.id,
                                            position: pos + 1,
                                        }
                                    );
                                    await transactionalEntityManager.save(matchPlayer);
                                }

                                playerIdx += playersPerMatch;
                                matchNum++;
                            }
                        }
                    }
                }

                return match;
            });

            const updatedMatch = await this.repository.findOne({
                where: { id: match.id },
                relations: ['tournament', 'round', 'table', 'winner'],
            });

            return this.successResponse(updatedMatch);
        } catch (error: any) {
            console.error('Declare winner error:', error);
            return this.formatErrors([GlobalError.INTERNAL_SERVER_ERROR], error.message);
        }
    }
}

