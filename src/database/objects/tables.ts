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
        status: TableStatus.OCCUPIED
    },
    {
        id: 4,
        name: 'Table 4',
        categoryId: input.categoryId,
        status: TableStatus.RESERVED
    },
    {
        id: 5,
        name: 'Table 5',
        categoryId: input.categoryId,
        status: TableStatus.AVAILABLE
    }
]
