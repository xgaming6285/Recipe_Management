import fetch from 'node-fetch';
// Alternatively if using CommonJS: 
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuration
const API_BASE_URL = 'http://127.0.0.1:5001/api';
let authToken = '';

// Test user data
const testUser = {
  username: 'testuser' + Math.floor(Math.random() * 10000),
  email: `testuser${Math.floor(Math.random() * 10000)}@example.com`,
  password: 'password123'
};

// Test recipe data
const testRecipe = {
  title: 'Test Recipe',
  description: 'This is a test recipe created via API',
  ingredients: [
    { name: 'Ingredient 1', amount: 2, unit: 'cups' },
    { name: 'Ingredient 2', amount: 1, unit: 'tablespoon' }
  ],
  instructions: [
    { step: 1, description: 'Mix ingredients' },
    { step: 2, description: 'Cook for 10 minutes' }
  ],
  cookingTime: 30,
  servings: 4,
  difficulty: 'Medium',
  category: 'Dinner',
  tags: ['test', 'api']
};

// Helper function for API requests
async function apiRequest(endpoint, method = 'GET', data = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    console.log(`Making ${method} request to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseData = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(responseData, null, 2));
    
    return { status: response.status, data: responseData };
  } catch (error) {
    console.error(`Error with ${method} ${endpoint}:`, error);
    return { status: 500, data: { error: error.message } };
  }
}

// Run tests
async function runTests() {
  console.log('Starting API tests with MongoDB...');
  
  // Test 1: Register a new user
  console.log('\n--- Test 1: User Registration ---');
  const signupResult = await apiRequest('/auth/signup', 'POST', testUser);
  
  if (signupResult.status === 201 && signupResult.data.token) {
    authToken = signupResult.data.token;
    console.log('✅ User registration successful');
  } else {
    console.log('⚠️ User registration failed or user already exists');
    
    // Try logging in if registration fails
    console.log('\n--- Test 1b: User Login ---');
    const loginResult = await apiRequest('/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password
    });
    
    if (loginResult.status === 200 && loginResult.data.token) {
      authToken = loginResult.data.token;
      console.log('✅ Login successful');
    } else {
      console.log('❌ Login failed');
    }
  }
  
  // Test 2: Public endpoint - Get all recipes
  console.log('\n--- Test 2: Public Endpoint - Get All Recipes ---');
  const recipesResult = await apiRequest('/recipes');
  
  if (recipesResult.status === 200) {
    console.log(`✅ Retrieved recipes successfully: ${recipesResult.data.count || 0} recipes`);
  } else {
    console.log('❌ Failed to retrieve recipes');
  }
  
  // Only run protected routes if we have a token
  if (authToken) {
    // Test 3: Protected endpoint - Get user recipes
    console.log('\n--- Test 3: Protected Endpoint - Get User Recipes ---');
    const userRecipesResult = await apiRequest('/recipes/user/recipes');
    
    if (userRecipesResult.status === 200) {
      console.log('✅ Retrieved user recipes successfully');
    } else {
      console.log('❌ Failed to retrieve user recipes');
    }
  } else {
    console.log('\n⚠️ Skipping protected endpoint tests due to authentication failure');
  }
  
  console.log('\nTests completed!');
}

// Run the tests
runTests().catch(err => console.error('Test execution error:', err)); 