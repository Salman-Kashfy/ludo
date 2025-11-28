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