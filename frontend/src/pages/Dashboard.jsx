import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {currentUser?.username || 'User'}!</h2>
        <p className="mb-4">This is your personal dashboard where you can manage your recipes and account.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2">My Recipes</h3>
            <p className="text-gray-600">View and manage your saved recipes</p>
            <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              View Recipes
            </button>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Create Recipe</h3>
            <p className="text-gray-600">Add a new recipe to your collection</p>
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Create New
            </button>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Account Settings</h3>
            <p className="text-gray-600">Update your profile and preferences</p>
            <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 