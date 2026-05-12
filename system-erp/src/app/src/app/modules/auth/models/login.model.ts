export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    company_name: string;
    bin_number: string;
  };
  expires_at: string;
}