import bcrypt from 'bcryptjs';
import config from '../config/config.js';

// Hash password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, config.bcryptSaltRounds);
};

// Compare password with hash
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Validate password strength
export const validatePasswordStrength = (password) => {
  // Minimum 8 characters, at least one letter and one number
  const minLength = 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (password.length < minLength) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!hasLetter) {
    return { valid: false, message: 'Password must contain at least one letter' };
  }
  
  if (!hasNumber) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
};

export default {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
};
