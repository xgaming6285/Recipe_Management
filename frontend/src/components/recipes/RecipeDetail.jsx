import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`/api/recipes/${id}`);
        setRecipe(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError('Error loading recipe. It may have been deleted or doesn\'t exist.');
        setLoading(false);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchRecipe();
    fetchUserProfile();
  }, [id]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/recipes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Recipe deleted successfully');
      navigate('/recipes');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error(error.response?.data?.message || 'Error deleting recipe');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link to="/recipes" className="text-blue-500 hover:underline">
          &larr; Back to recipes
        </Link>
      </div>
    );
  }

  if (!recipe) return null;

  const isOwner = user && recipe.createdBy && user._id === recipe.createdBy._id;
  const placeholderImage = 'https://via.placeholder.com/800x400?text=No+Image';

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Link to="/recipes" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to recipes
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Recipe Image */}
        <div className="h-64 sm:h-80 overflow-hidden">
          <img 
            src={recipe.imageUrl || placeholderImage} 
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = placeholderImage }}
          />
        </div>

        {/* Recipe Header */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{recipe.title}</h1>
            <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
              {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
            </span>
          </div>

          {/* Recipe Meta */}
          <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {recipe.cookingTime} minutes
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              By {recipe.createdBy?.username || 'Anonymous'}
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(recipe.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Recipe Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{recipe.description}</p>
          </div>

          {/* Recipe Ingredients */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          {/* Recipe Steps */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Steps</h2>
            <ol className="list-decimal pl-5 text-gray-700 space-y-3">
              {recipe.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="border-t pt-6 mt-6">
              <div className="flex flex-wrap gap-4">
                <Link 
                  to={`/recipes/edit/${recipe._id}`}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-md transition-colors duration-300"
                >
                  Edit Recipe
                </Link>
                {!deleteConfirm ? (
                  <button 
                    onClick={() => setDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-md transition-colors duration-300"
                  >
                    Delete Recipe
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-md transition-colors duration-300"
                    >
                      Confirm Delete
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-md transition-colors duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;