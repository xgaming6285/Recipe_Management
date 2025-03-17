import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from '../components/recipes/RecipeCard';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    // Redirect if not logged in
    if (!token) {
      navigate('/login');
      return;
    }
    
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Configure headers with token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Fetch user profile
        const userRes = await axios.get('/api/users/me', config);
        setUser(userRes.data);
        
        // Fetch user recipes
        const recipesRes = await axios.get('/api/users/me/recipes', config);
        setRecipes(recipesRes.data);
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong');
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [token, navigate]);
  
  if (loading) return <div className="text-center py-10">Loading...</div>;
  
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {user && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">My Profile</h1>
          <div className="mb-4">
            <p className="text-lg"><span className="font-medium">Username:</span> {user.username}</p>
            <p className="text-lg"><span className="font-medium">Email:</span> {user.email}</p>
            <p className="text-lg"><span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-2xl font-bold mb-6">My Recipes</h2>
        {recipes.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-600">You haven't created any recipes yet.</p>
            <button 
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              onClick={() => navigate('/create-recipe')}
            >
              Create Your First Recipe
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;