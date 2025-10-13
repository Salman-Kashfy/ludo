import { Status } from "../../database/entity/root/enums";

export interface ShiftInput {
    uuid?: string
    name: string
    startTime: string
    endTime: string
    days: string[]
    description?: string
    status?: Status
}

export interface ShiftFilter {
    searchText?: string
    status?: Status
}
