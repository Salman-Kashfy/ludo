export interface CustomerInput {
    uuid?: string
    firstName: string
    lastName: string
    phoneCode?: string
    phoneNumber?: string
    companyUuid: string
    dob?: string | null
}

export interface CustomerFilter {
    searchText?: string
    companyUuid: string
}
