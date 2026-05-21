export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PagedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  limit: 10,
  sortOrder: 'desc'
};