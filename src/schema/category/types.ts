export interface CategoryInput {
    uuid?: string
    companyUuid: string
    name: string
    hourlyRate: number
}

export interface CategoryFilter {
    companyUuid: string
    searchText?: string
}
