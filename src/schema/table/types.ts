import { TableStatus } from '../../database/entity/Table';

export interface TableInput {
    id?: number
    name: string
    categoryId: number
    status?: TableStatus
}

export interface TableFilter {
    searchText?: string
    categoryId?: number
    status?: TableStatus
}

export interface UpdateTableStatusInput {
    id: number
    status: TableStatus
}
