import { Table } from '../../database/entity/Table';
import { Customer } from '../../database/entity/Customer';

export interface TournamentMatchFilterInput {
    tournamentUuid: string;
    round?: number;
    tableUuid?: string;
    tableId?: number;
}

export interface TournamentMatchPlayerView {
    customerId: number;
    customerUuid: string;
    isWinner: boolean;
    customer?: Customer;
}

export interface TournamentMatchView {
    tournamentRoundId: number;
    tournamentRoundUuid: string;
    round: number;
    tableId?: number | null;
    table?: Table | null;
    players: TournamentMatchPlayerView[];
}

