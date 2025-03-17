import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };
  
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">RecipeHub</Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-blue-200">Home</Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/recipes/create" className="hover:text-blue-200">Create Recipe</Link>
              <Link to="/profile" className="hover:text-blue-200">My Profile</Link>
              <button 
                onClick={handleLogout}
                className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">Login</Link>
              <Link 
                to="/signup"
                className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;