import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeById, deleteRecipe } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';

const RecipeDetail = () => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipeById(id);
        setRecipe(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch recipe');
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(id);
        navigate('/');
      } catch (err) {
        setError(err.message || 'Failed to delete recipe');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/recipes/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Recipe not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {recipe.image && (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
            {user && user.id === recipe.userId && (
              <div className="space-x-2">
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <p className="text-gray-600">{recipe.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-gray-600">Prep Time</p>
              <p className="font-semibold">{recipe.prepTime} mins</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-gray-600">Cook Time</p>
              <p className="font-semibold">{recipe.cookTime} mins</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-gray-600">Servings</p>
              <p className="font-semibold">{recipe.servings}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Ingredients</h2>
            <ul className="list-disc list-inside space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-700">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">Instructions</h2>
            <ol className="list-decimal list-inside space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-gray-700">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
