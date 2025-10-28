export interface CategoryPriceInput {
    price: number
    unit: CategoryPriceUnit
    duration: number
    currencyName?: string
}

export interface CategoryInput {
    uuid?: string
    companyUuid: string
    name: string
    hourlyRate: number
    categoryPrices?: CategoryPriceInput[]
}

export interface CategoryFilter {
    companyUuid: string
    searchText?: string
}

export enum CategoryPriceUnit {
    MINUTES = 'minutes',
    HOURLY = 'hourly',
}