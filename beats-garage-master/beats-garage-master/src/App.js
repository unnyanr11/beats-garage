import React from "react";  
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";  
import PropTypes from "prop-types";  

// Firebase Authentication  
import { auth } from "./firebaseConfig";  
import { useAuthState } from "react-firebase-hooks/auth";  

// Core Components  
import Header from "./components/Header";  
import HeroSection from "./components/HeroSection";  
import FeaturedBeats from "./components/FeaturedBeats";  
import Filters from "./components/Filters";  
import Footer from "./components/Footer";  

// Pages  
import BeatsPage from "./pages/BeatsPage";  
import Signup from "./pages/Signup";  
import Login from "./pages/Login";  
import Cart from "./pages/Cart";  
import Payment from "./pages/Payment";  

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
        </div>  
    </div>  
);  

ErrorPage.propTypes = {  
    message: PropTypes.string,  
};  

// Protected Routes Wrapper  
const ProtectedRoute = ({ user, children }) => {  
    return user ? children : <Navigate to="/login" replace />;  
};  

ProtectedRoute.propTypes = {  
    user: PropTypes.object, // The user object (null if not authenticated)  
    children: PropTypes.node.isRequired, // The children to render inside the protected route  
};  

const App = () => {  
    const [user, loading, error] = useAuthState(auth); // Firebase authentication state handling  

    // Show loading spinner while user auth state is being determined  
    if (loading) {  
        return <LoadingSpinner />;  
    }  

    // Display error if auth retrieval fails  
    if (error) {  
        return <ErrorPage message={error.message} />;  
    }  

    return (  
        <Router>  
            <div className="bg-black text-white min-h-screen flex flex-col">  
                {/* Header */}  
                <Header />  

                {/* Main Content */}  
                <main className="flex-grow">  
                    <Routes>  
                        {/* Public Routes */}  
                        <Route  
                            path="/"  
                            element={  
                                <>  
                                    <HeroSection />  
                                    <FeaturedBeats />  
                                    <Filters />  
                                </>  
                            }  
                        />  
                        <Route path="/beats" element={<BeatsPage />} />  
                        <Route  
                            path="/signup"  
                            element={!user ? <Signup /> : <Navigate to="/" replace />}  
                        />  
                        <Route  
                            path="/login"  
                            element={!user ? <Login /> : <Navigate to="/" replace />}  
                        />  

                        {/* Protected Routes */}  
                        <Route  
                            path="/cart"  
                            element={  
                                <ProtectedRoute user={user}>  
                                    <Cart />  
                                </ProtectedRoute>  
                            }  
                        />  
                        <Route  
                            path="/payment"  
                            element={  
                                <ProtectedRoute user={user}>  
                                    <Payment />  
                                </ProtectedRoute>  
                            }  
                        />  

                        {/* 404 Page */}  
                        <Route  
                            path="*"  
                            element={  
                                <div className="flex items-center justify-center min-h-screen text-center">  
                                    <div>  
                                        <h1 className="text-6xl font-bold mb-4">404</h1>  
                                        <p className="text-xl">Page not found.</p>  
                                        <button  
                                            onClick={() => window.location.assign("/")}  
                                            className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"  
                                        >  
                                            Go to Home  
                                        </button>  
                                    </div>  
                                </div>  
                            }  
                        />  
                    </Routes>  
                </main>  

                {/* Footer */}  
                <Footer />  
            </div>  
        </Router>  
    );  
};  

export default App;  