import React from 'react';

const SearchFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory,
  cookingTimeFilter,
  setCookingTimeFilter,
  onSearch,
  onClearFilters 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-gray-700 text-sm font-bold mb-2">
            Search Recipes
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or ingredients..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
              Category
            </label>
            <select
              id="category"
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
          <div>
            <label htmlFor="cookingTime" className="block text-gray-700 text-sm font-bold mb-2">
              Cooking Time
            </label>
            <select
              id="cookingTime"
              value={cookingTimeFilter}
              onChange={(e) => setCookingTimeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Time</option>
              <option value="quick">Quick (&lt; 30 mins)</option>
              <option value="medium">Medium (30-60 mins)</option>
              <option value="long">Long (&gt; 60 mins)</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClearFilters}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchFilter;
