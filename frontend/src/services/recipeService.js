import apiClient from './apiClient';

/**
 * Service for handling recipe-related API calls
 */
export const recipeService = {
  /**
   * Get all recipes with optional filtering and pagination
   * @param {Object} params
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search] - Search term
   * @param {string} [params.category] - Recipe category
   * @param {Object} [params.cookingTime] - Cooking time range
   * @param {Object} [options] - Request options including cancel token
   * @returns {Promise<{data: Recipe[], metadata: { count: number, success: boolean }}>}
   */
  async getAll(params = {}, options = {}) {
    const response = await apiClient.get('/recipes', { 
      params,
      ...options
    });
    return response;
  },

  /**
   * Get a recipe by ID
   * @param {string} id - Recipe ID
   * @param {Object} [options] - Request options including cancel token
   * @returns {Promise<Recipe>}
   */
  async getById(id, options = {}) {
    const response = await apiClient.get(`/recipes/${id}`, options);
    return response.data;
  },

  /**
   * Create a new recipe
   * @param {Recipe} recipe - Recipe data
   * @param {Object} [options] - Request options including cancel token
   * @returns {Promise<Recipe>}
   */
  async create(recipe, options = {}) {
    const response = await apiClient.post('/recipes', recipe, options);
    return response.data;
  },

  /**
   * Update an existing recipe
   * @param {string} id - Recipe ID
   * @param {Recipe} recipe - Updated recipe data
   * @param {Object} [options] - Request options including cancel token
   * @returns {Promise<Recipe>}
   */
  async update(id, recipe, options = {}) {
    const response = await apiClient.put(`/recipes/${id}`, recipe, options);
    return response.data;
  },

  /**
   * Delete a recipe
   * @param {string} id - Recipe ID
   * @param {Object} [options] - Request options including cancel token
   * @returns {Promise<void>}
   */
  async delete(id, options = {}) {
    await apiClient.delete(`/recipes/${id}`, options);
  },

  /**
   * Get recipes by user
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   * @param {Object} [options] - Request options including cancel token
   * @returns {Promise<{data: Recipe[], metadata: { count: number, success: boolean }}>}
   */
  async getByUser(userId, params = {}, options = {}) {
    const response = await apiClient.get(`/recipes/user/${userId}`, { 
      params,
      ...options
    });
    return response;
  },

  /**
   * Upload recipe image
   * @param {File} file - Image file
   * @param {Object} [options] - Request options including cancel token
   * @returns {Promise<{imageUrl: string}>}
   */
  async uploadImage(file, options = {}) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiClient.post('/recipes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...options
    });
    return response.data;
  }
};