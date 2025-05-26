export interface BiliAPI<T> {
  code: number;
  message?: string;
  msg?: string;
  ttl?: number;
  data?: T;
  result?: T;
}
