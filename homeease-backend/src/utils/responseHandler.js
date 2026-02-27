// Standard API response format
export const sendResponse = (res, statusCode, message, data = null) => {
  const response = {
    status: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
    message,
    ...(data && { data }),
  };

  return res.status(statusCode).json(response);
};

// Success responses
export const successResponse = (res, message, data = null, statusCode = 200) => {
  return sendResponse(res, statusCode, message, data);
};

export const createdResponse = (res, message, data = null) => {
  return sendResponse(res, 201, message, data);
};

// Error responses
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    status: 'error',
    message,
    ...(errors && { errors }),
  };

  return res.status(statusCode).json(response);
};

// Paginated response
export const paginatedResponse = (res, message, data, pagination) => {
  const response = {
    status: 'success',
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  };

  return res.status(200).json(response);
};

export default {
  sendResponse,
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
};
