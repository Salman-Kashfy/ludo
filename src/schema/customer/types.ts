export interface CustomerInput {
    uuid?: string
    firstName: string
    lastName: string
    phoneCode?: string
    phoneNumber?: string
    companyUuid: string
}

export interface CustomerFilter {
    searchText?: string
    companyUuid: string
}
