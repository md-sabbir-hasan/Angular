export interface RegisterRequest {
  company_name: string;
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  bin_number: string;
  agree_terms: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user_id: string;
}

export interface PasswordStrength {
  score: number;
  label: 'weak' | 'fair' | 'good' | 'strong';
  color: string;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels: PasswordStrength[] = [
    { score: 1, label: 'weak',   color: '#991b1b' },
    { score: 2, label: 'fair',   color: '#e8a020' },
    { score: 3, label: 'good',   color: '#075985' },
    { score: 4, label: 'strong', color: '#166534' }
  ];

  return levels[score - 1] || levels[0];
}