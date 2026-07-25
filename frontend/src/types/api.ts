export interface ApiSuccess<TData> {
  statusCode: number;
  data: TData;
  message: string;
  success: true;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  success: false;
  errors: unknown[];
  data?: unknown;
}
