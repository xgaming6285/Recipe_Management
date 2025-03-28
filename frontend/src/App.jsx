import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/LoginPage';
import Signup from './pages/SignupPage';
import Home from './pages/Home';
import Profile from './pages/Profile';
import CreateRecipe from './pages/CreateRecipe';
import RecipeDetail from './pages/RecipeDetail';
import EditRecipe from './components/recipes/EditRecipe';
import Navbar from './components/Navbar';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
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
    </ErrorBoundary>
  );
}

export default App;