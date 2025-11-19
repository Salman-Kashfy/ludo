import { TournamentStatus } from "../../schema/tournament/types";
import { SEED_USERS } from "../../shared/config";

interface TournamentInput {
    companyId: number
    regularCategoryId: number
    specialCategoryId: number
    premiumCategoryId: number
}

export const tournaments = (input: TournamentInput) => [
    {
        name: 'Weekly Championship',
        date: '2024-12-15',
        startTime: '18:00:00',
        entryFee: 500,
        prizePool: 5000,
        currencyName: 'PKR',
        playerLimit: 16,
        groupSize: 4,
        totalRounds: 2,
        status: TournamentStatus.UPCOMING,
        companyId: input.companyId,
        categoryId: input.regularCategoryId,
        createdById: SEED_USERS.ADMIN.ID,
        lastUpdatedById: SEED_USERS.ADMIN.ID,
    },
    {
        name: 'Monthly Grand Tournament',
        date: '2024-12-20',
        startTime: '19:00:00',
        entryFee: 1000,
        prizePool: 15000,
        currencyName: 'PKR',
        playerLimit: 32,
        groupSize: 4,
        totalRounds: 3,
        status: TournamentStatus.UPCOMING,
        companyId: input.companyId,
        categoryId: input.specialCategoryId,
        createdById: SEED_USERS.ADMIN.ID,
        lastUpdatedById: SEED_USERS.ADMIN.ID,
    },
    {
        name: 'Holiday Special',
        date: '2024-12-25',
        startTime: '20:00:00',
        entryFee: 750,
        prizePool: 10000,
        currencyName: 'PKR',
        playerLimit: 16,
        groupSize: 2,
        totalRounds: 4,
        status: TournamentStatus.UPCOMING,
        companyId: input.companyId,
        categoryId: input.premiumCategoryId,
        createdById: SEED_USERS.ADMIN.ID,
        lastUpdatedById: SEED_USERS.ADMIN.ID,
    },
]

