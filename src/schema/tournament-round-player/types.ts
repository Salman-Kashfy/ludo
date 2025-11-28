export interface TournamentRoundPlayerFilter {
    tournamentRoundUuid?: string;
    tournamentRoundId?: number;
    tableId?: number;
    customerId?: number;
    winnersOnly?: boolean;
}

export interface UpdateTournamentRoundWinnersInput {
    tournamentRoundUuid: string;
    winnerCustomerIds: number[];
}

