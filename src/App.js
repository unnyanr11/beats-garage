
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
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));  

// Utility Components  
const LoadingSpinner = () => (  
  <div className="flex items-center justify-center min-h-screen bg-black text-white">  
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
      <div className="text-2xl">Loading...</div>  
    </div>
  </div>  
);  

const ErrorPage = ({ message }) => (  
  <div className="flex items-center justify-center min-h-screen bg-black text-red-500">  
    <div className="text-center">  
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-4xl font-bold mb-4">Authentication Error</h2>  
      <p className="text-lg mb-6">{message || "An unexpected error occurred."}</p>  
      <button  
        onClick={() => window.location.reload()}  
        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"  
      >  
        Refresh Page
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
    <div className="flex items-center justify-center min-h-[calc(100vh-128px)] text-center bg-black text-white">  
      <div className="max-w-md mx-auto p-8">  
        <div className="text-8xl mb-6">🎵</div>
        <h1 className="text-6xl font-bold mb-4 text-red-500">404</h1>  
        <p className="text-xl mb-4 text-gray-300">Oops! This beat does not exists.</p>  
        <p className="text-gray-400 mb-8">The page you are looking for could not be found.</p>
        <div className="space-y-4">
          <button  
            onClick={() => navigate("/")}  
            className="block w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"  
          >  
            🏠 Go to Home  
          </button>  
          <button  
            onClick={() => navigate("/beats")}  
            className="block w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"  
          >  
            🎧 Browse Beats  
          </button>  
        </div>
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
              
              {/* Payment Success Route - Updated for webhook system */}
              <Route  
                path="/payment-success"  
                element={  
                  <ProtectedRoute user={user}>  
                    <PaymentSuccess />  
                  </ProtectedRoute>  
                }  
              />
              
              {/* Legacy routes - redirect with appropriate messages */}
              <Route 
                path="/payment-success/:paymentId"
                element={
                  <div className="flex items-center justify-center min-h-screen bg-black text-white">
                    <div className="text-center max-w-md mx-auto p-8">
                      <div className="text-6xl mb-4">🔄</div>
                      <h2 className="text-2xl font-bold mb-4 text-blue-500">Redirecting...</h2>
                      <p className="text-gray-300 mb-6">
                        This URL format is no longer supported. Redirecting to the new payment success page.
                      </p>
                      <Navigate to="/payment-success" replace />
                    </div>
                  </div>
                }
              />
              
              <Route 
                path="/success" 
                element={
                  <div className="flex items-center justify-center min-h-screen bg-black text-white">
                    <div className="text-center max-w-md mx-auto p-8">
                      <div className="text-6xl mb-4">⚠️</div>
                      <h2 className="text-2xl font-bold mb-4 text-yellow-500">Invalid Access</h2>
                      <p className="text-gray-300 mb-6">
                        This page requires a valid payment confirmation. 
                        You will be redirected to the home page.
                      </p>
                      <div className="bg-gray-800 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-400">
                          If you just completed a payment, check your email for the download link or contact support.
                        </p>
                      </div>
                      <Navigate to="/" replace />
                    </div>
                  </div>
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
