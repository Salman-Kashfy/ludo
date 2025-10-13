import { TableSessionStatus } from '../../database/entity/TableSession';

export interface TableSessionInput {
    id?: string
    customerId: number
    tableId: number
    startTime?: string
    endTime?: string
    totalAmount?: number
    status?: TableSessionStatus
}

export interface StartTableSessionInput {
    customerId: number
    tableId: number
}

export interface EndTableSessionInput {
    id: string
    endTime?: string
}

export interface TableSessionFilter {
    searchText?: string
    customerId?: number
    tableId?: number
    status?: TableSessionStatus
    dateFrom?: string
    dateTo?: string
}
