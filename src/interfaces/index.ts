export interface StatusFilterInterface {
  status: string;
}

export interface FilterInterface {
  status: string;
  type: string;
  searchText: string;
}

export interface PagingInterface {
  limit: number;
  page: number;
}

export interface QueryParamFilter {
  query: any
  params: any
}
interface Paginator {
  page: number
  limit: number
  totalPages: number
  totalResultCount: number
}

export interface PaginatorOutput {
  list:any
  paging: Paginator
}

export interface SendEmailInput {
    to: string,
    subject: string,
    template: string,
    logo: string,
    data:any
}