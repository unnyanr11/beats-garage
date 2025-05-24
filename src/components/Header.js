import React, { useState, useEffect } from "react";  
import { useLocation, useNavigate } from "react-router-dom";  
import { auth } from "../firebase"; // Firebase authentication setup  

import { useAuthState } from "react-firebase-hooks/auth";  
import { FiShoppingCart } from "react-icons/fi"; // Import cart icon  

const Header = () => {  
  const location = useLocation(); // Get the current route location  
  const navigate = useNavigate();  
  const [user, loading] = useAuthState(auth); // Retrieve user auth state and loading status  
  const [cartCount, setCartCount] = useState(0); // Store cart count  

  const isBeatsPage = location.pathname === "/beats"; // Check if on the Beats page  

  // Logout handler  
  const handleLogout = async () => {  
    try {  
      await auth.signOut();  
      navigate("/login"); // Redirect to Login page on successful logout  
    } catch (error) {  
      console.error("Error logging out:", error);  
      alert("Failed to log out. Please try again.");  
    }  
  };  

  // Handles navigation to specific routes  
  const handleNavigation = (path) => {  
    if (location.pathname !== path) {  
      navigate(path); // Smooth client-side navigation  
    }  
  };  

  // Load cart count when the component mounts  
  useEffect(() => {  
    const loadCartCount = () => {  
      const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");  
      setCartCount(cart.length);  
    };  

    // Run on mount and whenever `location` changes (e.g., items are added/removed)  
    loadCartCount();  
  }, [location]);  

  return (  
    <header className="sticky top-0 z-50 bg-black border-b border-red-500 shadow-md">  
      <nav className="container mx-auto px-5 py-4 flex justify-between items-center">  
        {/* Logo */}  
        <button  
          onClick={() => handleNavigation("/")} // Navigate to Home  
          className="text-3xl font-bold text-white hover:text-gray-300"  
        >  
          🔥 Beats Garage  
        </button>  

        {/* Navigation Links */}  
        <div className="flex items-center space-x-6">  
          {/* Home/Beats Button */}  
          <button  
            onClick={() => handleNavigation(isBeatsPage ? "/" : "/beats")} // Navigate to Home or Beats  
            className="btn-custom"  
          >  
            {isBeatsPage ? "Home" : "Beats"}  
          </button>  

          {/* Authentication and Cart */}  
          {loading ? (  
            // Show a loading placeholder while Firebase auth is initializing  
            <div className="text-white">Loading...</div>  
          ) : !user ? (  
            <>  
              {/* Sign Up Button */}  
              <button  
                onClick={() => handleNavigation("/signup")}  
                className={`btn-custom ${  
                  location.pathname === "/signup" && "text-red-500"  
                }`}  
              >  
                Sign Up  
              </button>  

              {/* Login Button */}  
              <button  
                onClick={() => handleNavigation("/login")}  
                className={`btn-custom ${  
                  location.pathname === "/login" && "text-red-500"  
                }`}  
              >  
                Login  
              </button>  
            </>  
          ) : (  
            <>  
              {/* Logout Button */}  
              <button  
                onClick={handleLogout} // Log out and redirect to the Login page  
                className="btn-custom bg-red-500 text-white hover:bg-red-600"  
              >  
                Logout  
              </button>  

              {/* Cart Button */}  
              <button  
                onClick={() => handleNavigation("/cart")} // Navigate to Cart  
                className="relative flex items-center text-white text-2xl hover:text-gray-300"  
                title="Go to Cart"  
              >  
                <FiShoppingCart />  
                {/* Dynamic Cart Badge */}  
                {cartCount > 0 && (  
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm rounded-full px-2">  
                    {cartCount}  
                  </span>  
                )}  
              </button>  
            </>  
          )}  
        </div>  
      </nav>  
    </header>  
  );  
};  

export default Header;  