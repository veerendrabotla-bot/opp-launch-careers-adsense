
// Security configuration
export const SECURITY_CONFIG = {
  // Move access code to environment variable for better security
  // In production, this should be stored in Supabase secrets
  ADMIN_ACCESS_CODE: 'rani', // TODO: Move to environment variable
  MODERATOR_ACCESS_CODE: 'rani', // TODO: Move to environment variable
  
  // Session security settings
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;

export const validateAccessCode = (code: string, role: 'admin' | 'moderator'): boolean => {
  if (role === 'admin') {
    return code === SECURITY_CONFIG.ADMIN_ACCESS_CODE;
  }
  if (role === 'moderator') {
    return code === SECURITY_CONFIG.MODERATOR_ACCESS_CODE;
  }
  return false;
};
