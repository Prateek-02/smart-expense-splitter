/**
 * Standardized response handler for API responses
 */
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Success response
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data);
};

/**
 * Error response
 */
const sendError = (res, message, statusCode = 400, data = null) => {
  return sendResponse(res, statusCode, false, message, data);
};

/**
 * Server error response
 */
const sendServerError = (res, message = 'Internal server error', error = null) => {
  console.error('Server Error:', error);
  return sendResponse(res, 500, false, message, process.env.NODE_ENV === 'development' ? error?.message : null);
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError,
  sendServerError,
};
