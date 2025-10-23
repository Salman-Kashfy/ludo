export interface CustomerInput {
    uuid?: string
    firstName: string
    lastName: string
    phoneCode?: string
    phoneNumber?: string
}

export interface CustomerFilter {
    searchText?: string
}
