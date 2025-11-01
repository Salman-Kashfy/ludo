import { Status } from "../entity/root/enums";

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
        status: Status.ACTIVE,
        sortNo: 1
    },
    {
        id: 2,
        name: 'Table 2',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 2
    },
    {
        id: 3,
        name: 'Table 3',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 3
    },
    {
        id: 4,
        name: 'Table 4',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 4
    },
    {
        id: 5,
        name: 'Table 5',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 5
    },
    {
        id: 6,
        name: 'Table 6',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 6
    },
    {
        id: 7,
        name: 'Table 7',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 7
    },
    {
        id: 8,
        name: 'Table 8',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 8
    },
    {
        id: 9,
        name: 'Table 9',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 9
    },
    {
        id: 10,
        name: 'Table 10',
        categoryId: input.regularCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 10
    },
    
    // Special tables (4 tables)
    {
        id: 11,
        name: 'Table 11',
        categoryId: input.specialCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 11
    },
    {
        id: 12,
        name: 'Table 12',
        categoryId: input.specialCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 12
    },
    {
        id: 13,
        name: 'Table 13',
        categoryId: input.specialCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 13
    },
    {
        id: 14,
        name: 'Table 14',
        categoryId: input.specialCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 14
    },
    
    // Premium tables (2 tables)
    {
        id: 15,
        name: 'Table 15',
        categoryId: input.premiumCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 15
    },
    {
        id: 16,
        name: 'Table 16',
        categoryId: input.premiumCategoryId,
        companyId: input.companyId,
        status: Status.ACTIVE,
        sortNo: 16
    }
]
