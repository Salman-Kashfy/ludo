export enum TournamentStatus {
    UPCOMING = 'UPCOMING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    POSTPONED = 'POSTPONED',
    UNKNOWN = 'UNKNOWN',
}

export enum TournamentFormat {
    GROUP_STAGE = 'GROUP_STAGE',
    SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
}

export enum MatchStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
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
    playerLimit: number;
    format?: TournamentFormat;
    playersPerGroup?: number;
    numberOfRounds?: number;
    status?: TournamentStatus;
}

export interface TournamentFilter {
    companyUuid: string;
    searchText?: string;
    status?: TournamentStatus;
    dateFrom?: string;
    dateTo?: string;
}

