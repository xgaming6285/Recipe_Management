// Simple test script
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/recipes';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZTVkMmI2YzE1MTlkN2ZjNmZmOGM5ZCIsImlhdCI6MTc0MzExNDk1MywiZXhwIjoxNzUwODkwOTUzfQ.LJebTrBAsg_KmNWqkO9Rqj-2jImUi8_LAmVOD3BM_g8';

const testRecipeCreation = async () => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        title: 'Test Recipe',
        description: 'This is a test recipe',
        ingredients: [
          { name: 'Ingredient 1', amount: 2, unit: 'cups' },
          { name: 'Ingredient 2', amount: 1, unit: 'tablespoon' }
        ],
        instructions: [
          { step: 1, description: 'Mix ingredients together' },
          { step: 2, description: 'Cook for 10 minutes' }
        ],
        cookingTime: 30,
        servings: 4,
        difficulty: 'Medium',
        category: 'Dinner',
        tags: ['test', 'api']
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Error testing recipe creation:', error);
  }
};

testRecipeCreation(); 