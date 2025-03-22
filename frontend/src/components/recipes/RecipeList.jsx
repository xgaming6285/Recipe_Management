import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { recipeService } from '../../services/recipeService';
import RecipeCard from './RecipeCard';
import { useAuth } from '../../context/AuthContext';
import useAxiosCancellation from '../../hooks/useAxiosCancellation';
import axios from 'axios';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cookingTimeFilter, setCookingTimeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [sortBy, setSortBy] = useState('-createdAt');
  const { user } = useAuth();
  const { getCancelToken } = useAxiosCancellation();
  
  const ITEMS_PER_PAGE = 12;

  const fetchRecipes = useCallback(async (search = searchTerm) => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = {
        search,
        category: selectedCategory,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sort: sortBy
      };

      // Handle cooking time filter
      if (cookingTimeFilter) {
        switch (cookingTimeFilter) {
          case 'quick':
            params.cookingTime = { max: 30 };
            break;
          case 'medium':
            params.cookingTime = { min: 30, max: 60 };
            break;
          case 'long':
            params.cookingTime = { min: 60 };
            break;
          default:
            break;
        }
      }

      const response = await recipeService.getAll(params, { cancelToken: getCancelToken() });
      setRecipes(response.data);
      setTotalRecipes(response.metadata.count);
      setLoading(false);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request cancelled:', err.message);
        return;
      }
      console.error('Error fetching recipes:', err);
      setError(err.message || 'Error loading recipes. Please try again later.');
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, currentPage, ITEMS_PER_PAGE, sortBy, cookingTimeFilter, getCancelToken]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchRecipes(searchTerm);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setCookingTimeFilter('');
    setSortBy('-createdAt');
    setCurrentPage(1);
    fetchRecipes('');
  };

  const totalPages = Math.ceil(totalRecipes / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recipes..."
            className="flex-1 p-2 border rounded"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Categories</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="dessert">Dessert</option>
            <option value="snack">Snack</option>
          </select>

          <select
            value={cookingTimeFilter}
            onChange={(e) => setCookingTimeFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Cooking Time</option>
            <option value="quick">Quick (&lt; 30 mins)</option>
            <option value="medium">Medium (30-60 mins)</option>
            <option value="long">Long (&gt; 60 mins)</option>
          </select>

          <select
            value={sortBy}
            onChange={handleSortChange}
            className="p-2 border rounded"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="-title">Title Z-A</option>
            <option value="cookingTime">Cooking Time (Low to High)</option>
            <option value="-cookingTime">Cooking Time (High to Low)</option>
          </select>

          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>

          {/* No Results Message */}
          {recipes.length === 0 && !loading && (
            <div className="text-center text-gray-500 mt-8">
              No recipes found. Try adjusting your filters.
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Recipe Button (for authenticated users) */}
      {user && (
        <Link
          to="/recipes/create"
          className="fixed bottom-8 right-8 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      )}
    </div>
  );
};

export default RecipeList;