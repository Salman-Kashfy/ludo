import { TableStatus } from "../entity/Table";

interface TableInput {
    regularCategoryId: number
    specialCategoryId: number
    premiumCategoryId: number
    companyId: number
}

export const tables = (input: TableInput) => [
    // Regular tables (10 tables)
    {
        id: 1,
        name: 'Table 1',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 2,
        name: 'Table 2',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 3,
        name: 'Table 3',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 4,
        name: 'Table 4',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 5,
        name: 'Table 5',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 6,
        name: 'Table 6',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 7,
        name: 'Table 7',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 8,
        name: 'Table 8',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 9,
        name: 'Table 9',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 10,
        name: 'Table 10',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    
    // Special tables (4 tables)
    {
        id: 11,
        name: 'Table 11',
        categoryId: input.specialCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 12,
        name: 'Table 12',
        categoryId: input.specialCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 13,
        name: 'Table 13',
        categoryId: input.specialCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 14,
        name: 'Table 14',
        categoryId: input.specialCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    
    // Premium tables (2 tables)
    {
        id: 15,
        name: 'Table 15',
        categoryId: input.premiumCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 16,
        name: 'Table 16',
        categoryId: input.premiumCategoryId,
        companyId: input.companyId,
        status: TableStatus.AVAILABLE
    }
]
