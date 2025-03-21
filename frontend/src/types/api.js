/**
 * @typedef {Object} Recipe
 * @property {string} _id - Recipe ID
 * @property {string} title - Recipe title
 * @property {string} description - Recipe description
 * @property {string[]} ingredients - List of ingredients
 * @property {string[]} steps - List of preparation steps
 * @property {string} imageUrl - URL of the recipe image
 * @property {number} cookingTime - Cooking time in minutes
 * @property {string} category - Recipe category
 * @property {string} userId - ID of the user who created the recipe
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} User
 * @property {string} _id - User ID
 * @property {string} username - Username
 * @property {string} email - User email
 * @property {string} [avatar] - User avatar URL
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {any} data - Response data
 * @property {number} [count] - Total count for paginated responses
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} page - Page number (1-based)
 * @property {number} limit - Items per page
 */

/**
 * @typedef {Object} FilterParams
 * @property {string} [search] - Search term
 * @property {string} [category] - Recipe category
 * @property {Object} [cookingTime] - Cooking time range
 * @property {number} [cookingTime.min] - Minimum cooking time
 * @property {number} [cookingTime.max] - Maximum cooking time
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for errors
 * @property {string} message - Error message
 * @property {number} status - HTTP status code
 * @property {Object} [data] - Additional error data
 */