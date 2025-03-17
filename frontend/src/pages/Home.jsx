import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecipeList from '../components/recipes/RecipeList';
import SearchFilter from '../components/SearchFilter';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cookingTimeFilter, setCookingTimeFilter] = useState('');

  const fetchRecipes = async (search = searchTerm) => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (cookingTimeFilter) {
        const maxTime = cookingTimeFilter === 'quick' ? 30 : 
                       cookingTimeFilter === 'medium' ? 60 : null;
        
        if (maxTime) params.append('maxTime', maxTime);
        if (cookingTimeFilter === 'long') params.append('minTime', 60);
      }
      
      const response = await axios.get(`/api/recipes?${params.toString()}`);
      setRecipes(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory, cookingTimeFilter]); // Re-fetch when filters change

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
