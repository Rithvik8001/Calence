export interface ApiResponseMeta {
  requestId: string;
  timestamp: string;
}

export class ApiResponse<T> {
  readonly success = true;
  readonly data: T;
  readonly meta: ApiResponseMeta;

  constructor(data: T, meta: ApiResponseMeta) {
    this.data = data;
    this.meta = meta;
  }
}
