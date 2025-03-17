import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from './RecipeCard';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cookingTimeFilter, setCookingTimeFilter] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory, cookingTimeFilter]);

  const fetchRecipes = async (search = '') => {
    try {
      setLoading(true);
      
      // Build query parameters
      let queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedCategory) queryParams.append('category', selectedCategory);
      if (cookingTimeFilter) {
        const maxTime = cookingTimeFilter === 'quick' ? 30 : 
                        cookingTimeFilter === 'medium' ? 60 : null;
        
        if (maxTime) queryParams.append('maxTime', maxTime);
        if (cookingTimeFilter === 'long') queryParams.append('minTime', 60);
      }
      
      const response = await axios.get(`/api/recipes?${queryParams.toString()}`);
      setRecipes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Error loading recipes. Please try again later.');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecipes(searchTerm);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setCookingTimeFilter('');
    fetchRecipes();
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Recipes</h1>
        <Link 
          to="/recipes/create"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
        >
          Create Recipe
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recipes..."
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-md transition-colors duration-300"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div className="w-full sm:w-auto">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="dessert">Dessert</option>
              <option value="snack">Snack</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Cooking Time Filter */}
          <div className="w-full sm:w-auto">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Cooking Time
            </label>
            <select
              value={cookingTimeFilter}
              onChange={(e) => setCookingTimeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Time</option>
              <option value="quick">Quick ({'<'} 30 mins)</option>
              <option value="medium">Medium (30-60 mins)</option>
              <option value="long">Long ({'>'} 60 mins)</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="w-full sm:w-auto self-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-md transition-colors duration-300"
              disabled={!searchTerm && !selectedCategory && !cookingTimeFilter}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* No Results */}
      {!loading && recipes.length === 0 && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-500">No recipes found</h3>
          <p className="text-gray-500 mt-2">
            {searchTerm || selectedCategory || cookingTimeFilter 
              ? "Try changing your search or filters" 
              : "Be the first to create a recipe!"}
          </p>
          {(searchTerm || selectedCategory || cookingTimeFilter) && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-md transition-colors duration-300"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Recipe Grid */}
      {!loading && recipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeList;