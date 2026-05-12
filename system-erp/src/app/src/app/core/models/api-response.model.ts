export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  statusCode: number;
  timestamp?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  success: boolean;
}