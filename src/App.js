import React, { Suspense, lazy } from "react";  
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";  
import PropTypes from "prop-types";  

// Firebase Authentication  
import { auth } from "./firebaseConfig";  
import { useAuthState } from "react-firebase-hooks/auth";  

// Core Components  
import Header from "./components/Header";  
import Footer from "./components/Footer";  
import ContactForm from "./components/ContactForm";  

// Lazy Load Pages for Better Performance  
const HeroSection = lazy(() => import("./components/HeroSection"));  
const FeaturedBeats = lazy(() => import("./components/FeaturedBeats"));  
const Filters = lazy(() => import("./components/Filters"));  
const BeatsPage = lazy(() => import("./pages/BeatsPage"));  
const Signup = lazy(() => import("./pages/Signup"));  
const Login = lazy(() => import("./pages/Login"));  
const Cart = lazy(() => import("./pages/Cart"));  
const Payment = lazy(() => import("./pages/Payment"));  

// Utility Components  
const LoadingSpinner = () => (  
  <div className="flex items-center justify-center min-h-screen bg-black text-white">  
    <div className="text-2xl">Loading...</div>  
  </div>  
);  

const ErrorPage = ({ message }) => (  
  <div className="flex items-center justify-center min-h-screen bg-black text-red-500">  
    <div className="text-center">  
      <h2 className="text-4xl font-bold mb-4">Authentication Error</h2>  
      <p className="text-lg">{message || "An unexpected error occurred."}</p>  
      <button  
        onClick={() => window.location.reload()}  
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"  
      >  
        Refresh  
      </button>  
    </div>  
  </div>  
);  

ErrorPage.propTypes = {  
  message: PropTypes.string,  
};  

// Protected Route Wrapper  
const ProtectedRoute = ({ user, children }) => {  
  if (user === undefined) {  
    // Check if auth state is still loading  
    return <LoadingSpinner />;  
  }  
  return user ? children : <Navigate to="/login" replace />;  
};  

ProtectedRoute.propTypes = {  
  user: PropTypes.oneOfType([  
    PropTypes.object,  
    PropTypes.oneOf([null]),  
    PropTypes.oneOf([undefined]), // Allow undefined during loading  
  ]),  
  children: PropTypes.node.isRequired,  
};  

// 404 Not Found Component  
const NotFound = () => {  
  const navigate = useNavigate();  
  return (  
    <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height,64px)-var(--footer-height,64px))] text-center">  
      <div>  
        <h1 className="text-6xl font-bold mb-4">404</h1>  
        <p className="text-xl mb-4">Page not found.</p>  
        <button  
          onClick={() => navigate("/")}  
          className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"  
        >  
          Go to Home  
        </button>  
      </div>  
    </div>  
  );  
};  

// App Component  
const App = () => {  
  // Pass undefined as the initial value for user until loading is complete  
  const [user, loading, error] = useAuthState(auth, {  
    initialValue: undefined, // Explicitly set initial value to differentiate loading from logged out  
  });  

  // Show loading spinner ONLY if loading is true AND user is still undefined  
  if (loading && user === undefined) {  
    return <LoadingSpinner />;  
  }  

  // Display error if auth retrieval fails  
  if (error) {  
    return <ErrorPage message={error.message} />;  
  }  

  // Determine logged-in status (true if user object exists, false otherwise)  
  const isLoggedIn = !!user;  

  return (  
    <Router>  
      <div className="bg-black text-white min-h-screen flex flex-col">  
        {/* Pass isLoggedIn status to Header */}  
        <Header isLoggedIn={isLoggedIn} />  

        <main className="flex-grow">  
          <Suspense fallback={<LoadingSpinner />}>  
            <Routes>  
              {/* Public Routes */}  
              <Route  
                path="/"  
                element={  
                  <>  
                    <HeroSection />  
                    <FeaturedBeats isLoggedIn={isLoggedIn} />  
                    <Filters isLoggedIn={isLoggedIn} />  
                    {/* ContactForm is ONLY visible on the home page */}  
                    <ContactForm />  
                  </>  
                }  
              />  
              <Route path="/beats" element={<BeatsPage isLoggedIn={isLoggedIn} />} />  
              <Route  
                path="/signup"  
                element={isLoggedIn ? <Navigate to="/" replace /> : <Signup />}  
              />  
              <Route  
                path="/login"  
                element={isLoggedIn ? <Navigate to="/" replace /> : <Login />}  
              />  

              {/* Protected Routes */}  
              <Route  
                path="/cart"  
                element={  
                  <ProtectedRoute user={user}>  
                    <Cart isLoggedIn={isLoggedIn} />  
                  </ProtectedRoute>  
                }  
              />  
              <Route  
                path="/payment"  
                element={  
                  <ProtectedRoute user={user}>  
                    <Payment isLoggedIn={isLoggedIn} />  
                  </ProtectedRoute>  
                }  
              />  

              {/* 404 Page */}  
              <Route path="*" element={<NotFound />} />  
            </Routes>  
          </Suspense>  
        </main>  

        {/* Footer is present on all pages */}  
        <Footer />  
      </div>  
    </Router>  
  );  
};  

export default App;  