import React from 'react';
import { Link } from 'react-router-dom';

const RecipeCard = ({ recipe }) => {
  const placeholderImage = 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 overflow-hidden">
        <img 
          src={recipe.imageUrl || placeholderImage} 
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = placeholderImage }}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800 truncate">{recipe.title}</h3>
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
          </span>
        </div>
        <p className="text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {recipe.cookingTime} min
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {recipe.createdBy?.username || 'Anonymous'}
          </div>
        </div>
        <Link 
          to={`/recipes/${recipe._id}`}
          className="block w-full mt-4 text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
        >
          View Recipe
        </Link>
      </div>
    </div>
  );
};

export default RecipeCard;