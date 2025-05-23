import React, { useState } from "react";  
import { useNavigate } from "react-router-dom";  
import { auth, googleProvider } from "../firebaseConfig";  
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";  

const Signup = () => {  
    const [fullName, setFullName] = useState(""); // Full name state  
    const [email, setEmail] = useState("");  
    const [password, setPassword] = useState("");  
    const [confirmPassword, setConfirmPassword] = useState("");  
    const [error, setError] = useState("");  
    const [loading, setLoading] = useState(false); // Loading state for signup actions  
    const navigate = useNavigate(); // Navigation handler  

    // Handle Email-Password Signup  
    const handleEmailSignup = async (e) => {  
        e.preventDefault();  

        // Ensure passwords match  
        if (password !== confirmPassword) {  
            setError("Passwords do not match.");  
            return;  
        }  

        setLoading(true); // Set loading state  

        try {  
            await createUserWithEmailAndPassword(auth, email, password);  
            alert(`Signup successful! Welcome, ${fullName}.`); // Success message  
            setFullName(""); // Reset all inputs  
            setEmail("");  
            setPassword("");  
            setConfirmPassword("");  
            setError(""); // Clear errors  
            navigate("/beats"); // Redirect after signup  
        } catch (err) {  
            setError(getFriendlyFirebaseError(err.message)); // Handle errors with friendly messages  
        } finally {  
            setLoading(false); // Stop loading  
        }  
    };  

    // Handle Google Signup  
    const handleGoogleSignup = async () => {  
        setLoading(true); // Set loading state  

        try {  
            await signInWithPopup(auth, googleProvider);  
            alert("Signup with Google successful!"); // Success message  
            setError("");  
            navigate("/beats"); // Redirect after signup  
        } catch (err) {  
            setError(getFriendlyFirebaseError(err.message)); // Handle errors with friendly messages  
        } finally {  
            setLoading(false); // Stop loading  
        }  
    };  

    // Converts Firebase error messages into user-friendly error messages  
    const getFriendlyFirebaseError = (errorMessage) => {  
        if (errorMessage.includes("auth/email-already-in-use")) {  
            return "The email address is already in use by another account.";  
        } else if (errorMessage.includes("auth/weak-password")) {  
            return "Your password should be at least 6 characters long.";  
        } else if (errorMessage.includes("auth/invalid-email")) {  
            return "Please enter a valid email address.";  
        } else {  
            return "An unexpected error occurred. Please try again.";  
        }  
    };  

    // Clear error on user input  
    const handleInputChange = (setter) => (e) => {  
        setter(e.target.value);  
        setError(""); // Clear error message when user interacts with input  
    };  

    return (  
        <div className="flex items-center justify-center min-h-screen bg-black">  
            <div className="bg-black text-white border border-red-500 rounded-lg p-8 w-full max-w-md shadow-lg">  
                <h2 className="text-3xl font-bold text-center mb-6" aria-label="Sign up">  
                    Sign Up  
                </h2>  

                {/* Signup Form */}  
                <form className="space-y-6" onSubmit={handleEmailSignup}>  
                    {/* Full Name */}  
                    <div>  
                        <label className="block text-sm font-medium mb-1">Full Name</label>  
                        <input  
                            type="text"  
                            value={fullName}  
                            onChange={handleInputChange(setFullName)}  
                            className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:outline-none"  
                            placeholder="Enter your full name"  
                            required  
                            aria-label="Full name"  
                        />  
                    </div>  

                    {/* Email */}  
                    <div>  
                        <label className="block text-sm font-medium mb-1">Email</label>  
                        <input  
                            type="email"  
                            value={email}  
                            onChange={handleInputChange(setEmail)}  
                            className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:outline-none"  
                            placeholder="Enter your email"  
                            required  
                            aria-label="Email address"  
                        />  
                    </div>  

                    {/* Password */}  
                    <div>  
                        <label className="block text-sm font-medium mb-1">Password</label>  
                        <input  
                            type="password"  
                            value={password}  
                            onChange={handleInputChange(setPassword)}  
                            className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:outline-none"  
                            placeholder="Enter your password"  
                            required  
                            aria-label="Password"  
                        />  
                    </div>  

                    {/* Confirm Password */}  
                    <div>  
                        <label className="block text-sm font-medium mb-1">Confirm Password</label>  
                        <input  
                            type="password"  
                            value={confirmPassword}  
                            onChange={handleInputChange(setConfirmPassword)}  
                            className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:outline-none"  
                            placeholder="Confirm your password"  
                            required  
                            aria-label="Confirm password"  
                        />  
                    </div>  

                    {/* Display Error */}  
                    {error && (  
                        <p className="text-red-500 text-sm text-center">{error}</p>  
                    )}  

                    {/* Loading State */}  
                    {loading && (  
                        <div className="text-center text-sm text-gray-400">  
                            Signing up, please wait...  
                        </div>  
                    )}  

                    {/* Submit Signup */}  
                    <button  
                        type="submit"  
                        className={`w-full bg-red-500 text-white hover:bg-red-600 font-semibold py-2 rounded-lg transition duration-300 ${  
                            loading ? "opacity-50 cursor-not-allowed" : ""  
                        }`}  
                        disabled={loading} // Disable button during loading  
                    >  
                        Sign Up  
                    </button>  
                </form>  

                {/* Google Signup Button */}  
                <button  
                    onClick={handleGoogleSignup}  
                    disabled={loading} // Disable button during loading  
                    className={`w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 rounded-lg mt-4 transition-all duration-300 ${  
                        loading ? "opacity-50 cursor-not-allowed" : ""  
                    }`}  
                >  
                    Sign Up with Google  
                </button>  

                {/* Redirect to Login */}  
                <div className="mt-4 text-center text-sm">  
                    Already have an account?{" "}  
                    <span  
                        onClick={() => navigate("/login")}  
                        className="text-red-500 hover:underline font-bold cursor-pointer"  
                        aria-label="Navigate to login"  
                    >  
                        Login  
                    </span>  
                </div>  
            </div>  
        </div>  
    );  
};  

export default Signup;  