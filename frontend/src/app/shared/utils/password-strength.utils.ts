export interface PasswordStrength {
  level: number;
  label: string;
  color: string;
}

export function computeStrength(pwd: string): PasswordStrength {
  if (!pwd) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)    score++;
  if (/[A-Z]/.test(pwd))  score++;
  if (/[0-9]/.test(pwd))  score++;
  if (pwd.length >= 12)   score++;
  if (score <= 1) return { level: 1, label: 'Débil',   color: '#96382e' };
  if (score === 2) return { level: 2, label: 'Regular', color: '#8a6018' };
  if (score === 3) return { level: 3, label: 'Buena',   color: '#3a5c74' };
  return                  { level: 4, label: 'Fuerte',  color: '#2f6b43' };
}
