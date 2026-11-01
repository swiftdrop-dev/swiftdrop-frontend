export interface User {
  id: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
