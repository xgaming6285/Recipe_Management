import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const RecipeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [''],
    steps: [''],
    imageUrl: '',
    cookingTime: '',
    category: 'other'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If we're in edit mode, fetch the recipe data
    if (isEditMode) {
      const fetchRecipe = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          const response = await axios.get(`/api/recipes/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          setFormData({
            title: response.data.title,
            description: response.data.description,
            ingredients: response.data.ingredients,
            steps: response.data.steps,
            imageUrl: response.data.imageUrl,
            cookingTime: response.data.cookingTime,
            category: response.data.category
          });
          setLoading(false);
        } catch (error) {
          console.error('Error fetching recipe:', error);
          setError('Error fetching recipe details. Please try again.');
          setLoading(false);
        }
      };

      fetchRecipe();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleArrayChange = (e, index, field) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = e.target.value;
    
    setFormData({
      ...formData,
      [field]: updatedArray
    });
  };

  const addArrayItem = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const removeArrayItem = (index, field) => {
    if (formData[field].length > 1) {
      const updatedArray = formData[field].filter((_, i) => i !== index);
      setFormData({
        ...formData,
        [field]: updatedArray
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Filter out empty items from arrays
      const submissionData = {
        ...formData,
        ingredients: formData.ingredients.filter(item => item.trim() !== ''),
        steps: formData.steps.filter(item => item.trim() !== '')
      };

      // Validate required fields
      if (!submissionData.title || !submissionData.description || 
          submissionData.ingredients.length === 0 || submissionData.steps.length === 0 ||
          !submissionData.cookingTime) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      if (isEditMode) {
        // Update existing recipe
        await axios.put(`/api/recipes/${id}`, submissionData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('Recipe updated successfully!');
      } else {
        // Create new recipe
        await axios.post('/api/recipes', submissionData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('Recipe created successfully!');
      }
      
      setLoading(false);
      navigate('/recipes');
    } catch (error) {
      console.error('Error submitting recipe:', error);
      setError(error.response?.data?.message || 'Error saving recipe. Please try again.');
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit Recipe' : 'Create New Recipe'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Recipe title"
            maxLength="100"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your recipe"
            rows="3"
            maxLength="500"
            required
          ></textarea>
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Ingredients <span className="text-red-500">*</span>
          </label>
          {formData.ingredients.map((ingredient, index) => (
            <div key={`ingredient-${index}`} className="flex mb-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleArrayChange(e, index, 'ingredients')}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Ingredient ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeArrayItem(index, 'ingredients')}
                className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md"
                disabled={formData.ingredients.length <= 1}
              >
                -
              </button>
              {index === formData.ingredients.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayItem('ingredients')}
                  className="ml-2 px-3 py-2 bg-green-500 text-white rounded-md"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Steps <span className="text-red-500">*</span>
          </label>
          {formData.steps.map((step, index) => (
            <div key={`step-${index}`} className="flex mb-2">
              <textarea
                value={step}
                onChange={(e) => handleArrayChange(e, index, 'steps')}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Step ${index + 1}`}
                rows="2"
              ></textarea>
              <button
                type="button"
                onClick={() => removeArrayItem(index, 'steps')}
                className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md"
                disabled={formData.steps.length <= 1}
              >
                -
              </button>
              {index === formData.steps.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayItem('steps')}
                  className="ml-2 px-3 py-2 bg-green-500 text-white rounded-md"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Image URL (optional)
          </label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="URL to recipe image"
          />
        </div>

        {/* Cooking Time */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Cooking Time (minutes) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="cookingTime"
            value={formData.cookingTime}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cooking time in minutes"
            min="1"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="dessert">Dessert</option>
            <option value="snack">Snack</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isEditMode ? 'Update Recipe' : 'Create Recipe'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;