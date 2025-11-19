import { Status } from '../../database/entity/root/enums';

export interface TableInput {
    uuid?: string
    name: string
    categoryUuid: string
    status?: Status
    companyUuid: string
    sortNo?: number
}

export interface TableFilter {
    companyUuid: string
    searchText?: string
    categoryId?: number
    status?: Status
}

export enum TableStatus {
    ACTIVE = 'ACTIVE',
    BOOKED = 'BOOKED',
    OCCUPIED = 'OCCUPIED',
    INACTIVE = 'INACTIVE',
}