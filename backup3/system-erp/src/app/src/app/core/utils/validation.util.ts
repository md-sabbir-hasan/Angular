export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Bangladesh mobile: 01XXXXXXXXX
  return /^01[3-9]\d{8}$/.test(phone.replace(/[-\s]/g, ''));
}

export function isValidBIN(bin: string): boolean {
  // Bangladesh BIN: 9 digits + dash + 4 digits
  return /^\d{9}-\d{4}$/.test(bin);
}

export function isValidTIN(tin: string): boolean {
  return /^\d{9,12}$/.test(tin);
}

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function isPositiveNumber(value: number): boolean {
  return !isNaN(value) && value > 0;
}

export function journalIsBalanced(
  lines: { debit: number; credit: number }[]
): boolean {
  const totalDebit  = lines.reduce((s, l) => s + (l.debit  || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
  return Math.abs(totalDebit - totalCredit) < 0.01;
}