import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';

// Create Recipe Context
const RecipeContext = createContext();

// Initial state
const initialState = {
  recipes: [],
  recipe: null,
  loading: false,
  error: null
};

// Recipe reducer
const recipeReducer = (state, action) => {
  switch (action.type) {
    case 'GET_RECIPES_REQUEST':
    case 'GET_RECIPE_REQUEST':
    case 'CREATE_RECIPE_REQUEST':
    case 'UPDATE_RECIPE_REQUEST':
    case 'DELETE_RECIPE_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'GET_RECIPES_SUCCESS':
      return {
        ...state,
        recipes: action.payload,
        loading: false
      };
    case 'GET_RECIPE_SUCCESS':
      return {
        ...state,
        recipe: action.payload,
        loading: false
      };
    case 'CREATE_RECIPE_SUCCESS':
      return {
        ...state,
        recipes: [action.payload, ...state.recipes],
        loading: false
      };
    case 'UPDATE_RECIPE_SUCCESS':
      return {
        ...state,
        recipes: state.recipes.map(recipe => 
          recipe._id === action.payload._id ? action.payload : recipe
        ),
        recipe: action.payload,
        loading: false
      };
    case 'DELETE_RECIPE_SUCCESS':
      return {
        ...state,
        recipes: state.recipes.filter(recipe => recipe._id !== action.payload),
        loading: false
      };
    case 'RECIPE_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_RECIPE':
      return {
        ...state,
        recipe: null
      };
    default:
      return state;
  }
};

// Recipe Provider Component
export const RecipeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(recipeReducer, initialState);

  // Get all recipes
  const getRecipes = async (params = {}) => {
    dispatch({ type: 'GET_RECIPES_REQUEST' });
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`/api/recipes${queryString ? `?${queryString}` : ''}`);
      dispatch({ 
        type: 'GET_RECIPES_SUCCESS', 
        payload: response.data 
      });
      return response.data;
    } catch (error) {
      dispatch({ 
        type: 'RECIPE_ERROR', 
        payload: error.response?.data?.message || 'Error fetching recipes' 
      });
      throw error;
    }
  };

  // Get single recipe
  const getRecipe = async (id) => {
    dispatch({ type: 'GET_RECIPE_REQUEST' });
    try {
      const response = await axios.get(`/api/recipes/${id}`);
      dispatch({ 
        type: 'GET_RECIPE_SUCCESS', 
        payload: response.data 
      });
      return response.data;
    } catch (error) {
      dispatch({ 
        type: 'RECIPE_ERROR', 
        payload: error.response?.data?.message || 'Error fetching recipe' 
      });
      throw error;
    }
  };

  // Create recipe
  const createRecipe = async (recipeData) => {
    dispatch({ type: 'CREATE_RECIPE_REQUEST' });
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.post('/api/recipes', recipeData, config);
      dispatch({ 
        type: 'CREATE_RECIPE_SUCCESS', 
        payload: response.data 
      });
      return response.data;
    } catch (error) {
      dispatch({ 
        type: 'RECIPE_ERROR', 
        payload: error.response?.data?.message || 'Error creating recipe'
      });
      throw error;
    }
  };

  // Update recipe
  const updateRecipe = async (id, recipeData) => {
    dispatch({ type: 'UPDATE_RECIPE_REQUEST' });
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const response = await axios.put(`/api/recipes/${id}`, recipeData, config);
      dispatch({ 
        type: 'UPDATE_RECIPE_SUCCESS', 
        payload: response.data 
      });
      return response.data;
    } catch (error) {
      dispatch({ 
        type: 'RECIPE_ERROR', 
        payload: error.response?.data?.message || 'Error updating recipe' 
      });
      throw error;
    }
  };

  // Delete recipe
  const deleteRecipe = async (id) => {
    dispatch({ type: 'DELETE_RECIPE_REQUEST' });
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      await axios.delete(`/api/recipes/${id}`, config);
      dispatch({ 
        type: 'DELETE_RECIPE_SUCCESS', 
        payload: id 
      });
      return id;
    } catch (error) {
      dispatch({ 
        type: 'RECIPE_ERROR', 
        payload: error.response?.data?.message || 'Error deleting recipe' 
      });
      throw error;
    }
  };

  // Clear current recipe
  const clearRecipe = () => {
    dispatch({ type: 'CLEAR_RECIPE' });
  };

  return (
    <RecipeContext.Provider
      value={{
        recipes: state.recipes,
        recipe: state.recipe,
        loading: state.loading,
        error: state.error,
        getRecipes,
        getRecipe,
        createRecipe,
        updateRecipe,
        deleteRecipe,
        clearRecipe
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};

// Custom hook to use recipe context
export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};