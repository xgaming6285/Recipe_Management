import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Home from './components/Home';
import UserProfile from './components/UserProfile';
import CreateRecipe from './components/recipes/CreateRecipe';
import RecipeDetail from './components/recipes/RecipeDetail';
import EditRecipe from './components/recipes/EditRecipe';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/recipes/create"
            element={
              <PrivateRoute>
                <CreateRecipe />
              </PrivateRoute>
            }
          />
          <Route
            path="/recipes/edit/:id"
            element={
              <PrivateRoute>
                <EditRecipe />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;