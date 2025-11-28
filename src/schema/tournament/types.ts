export enum TournamentStatus {
    ACTIVE = 'ACTIVE',
    UPCOMING = 'UPCOMING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface TournamentInput {
    uuid?: string;
    companyUuid: string;
    categoryUuid: string;
    name: string;
    date: string;
    startTime: string;
    entryFee?: number;
    prizePool?: number;
    currencyName?: string;
    groupSize: number;
    playerLimit: number;
    status?: TournamentStatus;
}

export interface TournamentFilter {
    companyUuid: string;
    searchText?: string;
    status?: TournamentStatus;
    dateFrom?: string;
    dateTo?: string;
}

