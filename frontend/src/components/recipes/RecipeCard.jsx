import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RecipeCard = ({ recipe }) => {
  const { user } = useAuth();
  const placeholderImage = 'https://via.placeholder.com/300x200?text=No+Image';

  const canEdit = user && (user._id === recipe.createdBy._id || user.role === 'admin');
  const canDelete = user && (user._id === recipe.createdBy._id || ['admin', 'moderator'].includes(user.role));

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/recipes/${recipe._id}`}>
        <div className="h-48 overflow-hidden">
          <img 
            src={recipe.imageUrl || placeholderImage} 
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = placeholderImage }}
          />
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/recipes/${recipe._id}`}>
            <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 truncate">
              {recipe.title}
            </h3>
          </Link>
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
          </span>
        </div>
        
        <p className="text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{recipe.cookingTime} mins</span>
          <Link to={`/profile/${recipe.createdBy._id}`} className="hover:text-blue-600">
            by {recipe.createdBy.username}
          </Link>
        </div>

        {(canEdit || canDelete) && (
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end space-x-2">
            {canEdit && (
              <Link
                to={`/recipes/edit/${recipe._id}`}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </Link>
            )}
            {canDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm('Are you sure you want to delete this recipe?')) {
                    // Handle delete
                  }
                }}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;