import axios from './axiosConfig';

const API_URL = '/api/recipes';

// Get all recipes with optional filters
export const getAllRecipes = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get a single recipe by ID
export const getRecipeById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching recipe' };
  }
};

// Create a new recipe
export const createRecipe = async (recipeData) => {
  try {
    const response = await axios.post(API_URL, recipeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error creating recipe' };
  }
};

// Update an existing recipe
export const updateRecipe = async (id, recipeData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, recipeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating recipe' };
  }
};

// Delete a recipe
export const deleteRecipe = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting recipe' };
  }
};

// Get recipes by current user
export const getUserRecipes = async () => {
  try {
    const response = await axios.get('/api/users/me/recipes');
    return response.data;
  } catch (error) {
    throw error;
  }
};