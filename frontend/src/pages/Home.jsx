import React, { useState, useEffect, useCallback } from 'react';
import RecipeList from '../components/recipes/RecipeList';
import SearchFilter from '../components/SearchFilter';
import { recipeService } from '../services/recipeService';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cookingTimeFilter, setCookingTimeFilter] = useState('');

  const fetchRecipes = useCallback(async (search = searchTerm) => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (cookingTimeFilter) {
        const maxTime = cookingTimeFilter === 'quick' ? 30 : 
                       cookingTimeFilter === 'medium' ? 60 : null;
        
        if (maxTime) params.maxTime = maxTime;
        if (cookingTimeFilter === 'long') params.minTime = 60;
      }
      
      console.log('Fetching recipes with params:', params);
      const response = await recipeService.getAll(params);
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      console.log('Recipes fetched successfully:', response.data.length);
      setRecipes(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError(err.message || 'Failed to load recipes. Please try again later.');
      setRecipes([]);
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, cookingTimeFilter]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes, selectedCategory, cookingTimeFilter, searchTerm]); // Re-fetch when filters or search term change

  const handleSearch = () => {
    fetchRecipes(searchTerm);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setCookingTimeFilter('');
    fetchRecipes('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Discover Recipes</h1>
      
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cookingTimeFilter={cookingTimeFilter}
        setCookingTimeFilter={setCookingTimeFilter}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <RecipeList recipes={recipes} />
      )}
    </div>
  );
};

export default Home;
