import { TableStatus } from '../../database/entity/Table';

export interface TableInput {
    uuid?: string
    name: string
    categoryUuid: string
    status?: TableStatus
    companyUuid: string
    sortNo?: number
}

export interface TableFilter {
    companyUuid: string
    searchText?: string
    categoryId?: number
    status?: TableStatus
}

export interface UpdateTableStatusInput {
    id: number
    status: TableStatus
}
