import {Status} from "../../database/entity/root/enums";

export interface CompanyInput {
    uuid?: string
    name: string
    description?: string
    email: string
    logo?: string
    phoneCode: string
    phoneNumber: string
}
export interface CompanyFilter {
    searchText?: string
}

export interface UpdateCompanyStatusInput {
    uuid: string
    status: Status
}