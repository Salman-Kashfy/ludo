import { Table } from '../../database/entity/Table';
import { Tournament } from '../../database/entity/Tournament';
import { TournamentPlayer } from '../../database/entity/TournamentPlayer';
import { TournamentRound as TournamentRoundEntity } from '../../database/entity/TournamentRound';

export interface TournamentRoundFilterInput {
    tournamentUuid: string;
    round?: number;
    tableId?: number;
    customerId?: number;
    winnersOnly?: boolean;
    paging?: any;
}

export enum TournamentRoundStatus {
    UPCOMING = 'UPCOMING',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface CompleteTournamentRoundInput {
    tournamentUuid: string;
    winnerCustomerUuid: string[];
}

export interface StartTournamentInput {
    tournamentUuid: string;
    randomize?: boolean;
}

export interface StartNextTournamentRoundInput {
    tournamentUuid: string;
    randomize?: boolean;
}

export interface RoundView {
    id: number;
    tournamentId: number;
    customerId: number;
    tableId?: number | null;
    round: number;
    isWinner: boolean;
    createdAt: Date;
    customer?: any;
    table?: Table | null;
}

export interface AssignmentResult {
    round: number;
    tableId: number;
    table: Table;
    playerIds: number[];
    entries: RoundView[];
}

export interface GenerateRoundAssignmentsParams {
    tournament: Tournament;
    round: number;
    players: TournamentPlayer[];
    randomize?: boolean;
}

export interface AssignmentGenerationSuccess {
    assignments: AssignmentResult[];
    round: TournamentRoundEntity;
}

export interface AssignmentGenerationError {
    error: any;
    errors: any[];
    errorMessage: string | null;
    status: boolean;
    data: null;
}

export type AssignmentGenerationResult = AssignmentGenerationSuccess | AssignmentGenerationError;