import { verifyAccessToken } from '../utils/jwt.js';
import { createError } from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Authenticate user by JWT token
export const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError.unauthorized('No token provided');
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    throw createError.unauthorized('Invalid or expired token');
  }
});

// Authorize by role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw createError.unauthorized('Authentication required');
    }
    
    if (!roles.includes(req.user.role)) {
      throw createError.forbidden('You do not have permission to access this resource');
    }
    
    next();
  };
};

// Check if user is customer
export const isCustomer = authorize('CUSTOMER');

// Check if user is provider
export const isProvider = authorize('PROVIDER');

// Check if user is admin
export const isAdmin = authorize('ADMIN');

// Check if user is customer or admin
export const isCustomerOrAdmin = authorize('CUSTOMER', 'ADMIN');

// Check if user is provider or admin
export const isProviderOrAdmin = authorize('PROVIDER', 'ADMIN');

export default {
  authenticate,
  authorize,
  isCustomer,
  isProvider,
  isAdmin,
  isCustomerOrAdmin,
  isProviderOrAdmin,
};
