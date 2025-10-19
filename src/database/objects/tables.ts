import { TableStatus } from "../entity/Table";

interface TableInput {
    categoryId: number
}

export const tables = (input: TableInput) => [
    {
        id: 1,
        name: 'Table 1',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 2,
        name: 'Table 2',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 3,
        name: 'Table 3',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 4,
        name: 'Table 4',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 5,
        name: 'Table 5',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 6,
        name: 'Table 6',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 7,
        name: 'Table 7',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 8,
        name: 'Table 8',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 9,
        name: 'Table 9',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 10,
        name: 'Table 10',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 11,
        name: 'Table 11',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 12,
        name: 'Table 12',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 13,
        name: 'Table 13',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 14,
        name: 'Table 14',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 15,
        name: 'Table 15',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    },
    {
        id: 16,
        name: 'Table 16',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    }
]
