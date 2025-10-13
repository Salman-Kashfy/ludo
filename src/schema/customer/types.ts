export interface CustomerInput {
    id?: number
    firstName: string
    lastName: string
    phoneCode?: string
    phoneNumber?: string
}

export interface CustomerFilter {
    searchText?: string
}
