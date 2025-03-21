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
   * @returns {Promise<{data: Recipe[], metadata: { count: number, success: boolean }}>}
   */
  async getAll(params = {}) {
    const response = await apiClient.get('/recipes', { params });
    return response;
  },

  /**
   * Get a recipe by ID
   * @param {string} id - Recipe ID
   * @returns {Promise<Recipe>}
   */
  async getById(id) {
    const response = await apiClient.get(`/recipes/${id}`);
    return response.data;
  },

  /**
   * Create a new recipe
   * @param {Recipe} recipe - Recipe data
   * @returns {Promise<Recipe>}
   */
  async create(recipe) {
    const response = await apiClient.post('/recipes', recipe);
    return response.data;
  },

  /**
   * Update an existing recipe
   * @param {string} id - Recipe ID
   * @param {Recipe} recipe - Updated recipe data
   * @returns {Promise<Recipe>}
   */
  async update(id, recipe) {
    const response = await apiClient.put(`/recipes/${id}`, recipe);
    return response.data;
  },

  /**
   * Delete a recipe
   * @param {string} id - Recipe ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    await apiClient.delete(`/recipes/${id}`);
  },

  /**
   * Get recipes by user
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise<{data: Recipe[], metadata: { count: number, success: boolean }}>}
   */
  async getByUser(userId, params = {}) {
    const response = await apiClient.get(`/recipes/user/${userId}`, { params });
    return response;
  },

  /**
   * Upload recipe image
   * @param {File} file - Image file
   * @returns {Promise<{imageUrl: string}>}
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiClient.post('/recipes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};