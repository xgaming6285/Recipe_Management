import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipeService } from '../../services/recipeService';
import useAxiosCancellation from '../../hooks/useAxiosCancellation';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCancelToken } = useAxiosCancellation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    ingredients: [],
    instructions: [],
    cookingTime: 0,
    category: '',
    servings: 1,
    imageUrl: ''
  });

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await recipeService.getById(id, { cancelToken: getCancelToken() });
        setRecipe(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load recipe. Please try again.');
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, getCancelToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = value;
    setRecipe(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...recipe.instructions];
    newInstructions[index] = value;
    setRecipe(prev => ({
      ...prev,
      instructions: newInstructions
    }));
  };

  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const addInstruction = () => {
    setRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeIngredient = (index) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const removeInstruction = (index) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await recipeService.update(id, recipe);
      navigate(`/recipes/${id}`);
    } catch (err) {
      setError('Failed to update recipe. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Recipe</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={recipe.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={recipe.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Ingredients</label>
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Enter ingredient"
                required
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Ingredient
          </button>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Instructions</label>
          {recipe.instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <textarea
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                className="flex-1 p-2 border rounded"
                rows="2"
                placeholder="Enter instruction step"
                required
              />
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Instruction
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Cooking Time (minutes)</label>
            <input
              type="number"
              name="cookingTime"
              value={recipe.cookingTime}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Servings</label>
            <input
              type="number"
              name="servings"
              value={recipe.servings}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="1"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Category</label>
          <select
            name="category"
            value={recipe.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a category</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="dessert">Dessert</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={recipe.imageUrl}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate(`/recipes/${id}`)}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRecipe; 