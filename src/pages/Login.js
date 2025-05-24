import React, { useState } from "react";  
import { useNavigate } from "react-router-dom";  
import { auth, googleProvider } from "../firebaseConfig";  
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";  


const Login = () => {  
    const [formData, setFormData] = useState({  
        email: "",  
        password: "",  
    });  
    const [error, setError] = useState("");  
    const [loading, setLoading] = useState(false);  
    const navigate = useNavigate();  

    const handleEmailLogin = async (e) => {  
        e.preventDefault();  
        if (loading) return;  
        setLoading(true);  

        try {  
            const { email, password } = formData;  
            await signInWithEmailAndPassword(auth, email, password);  
            alert("Login successful!");  
            setFormData({ email: "", password: "" });  
            setError("");  
            navigate("/beats");  
        } catch (err) {  
            console.error(err);  
            setError(getFriendlyFirebaseError(err.message));  
        } finally {  
            setLoading(false);  
        }  
    };  

    const handleGoogleLogin = async () => {  
        if (loading) return;  
        setLoading(true);  

        try {  
            await signInWithPopup(auth, googleProvider);  
            alert("Login with Google successful!");  
            setError("");  
            navigate("/beats");  
        } catch (err) {  
            console.error(err);  
            setError(getFriendlyFirebaseError(err.message));  
        } finally {  
            setLoading(false);  
        }  
    };  

    const getFriendlyFirebaseError = (errorMessage) => {  
        if (errorMessage.includes("auth/user-not-found")) {  
            return "No user found with this email. Please check your email or sign up.";  
        } else if (errorMessage.includes("auth/wrong-password")) {  
            return "Invalid password. Please try again.";  
        } else if (errorMessage.includes("auth/network-request-failed")) {  
            return "Network error. Please check your internet connection.";  
        } else if (errorMessage.includes("auth/popup-closed-by-user")) {  
            return "Google login popup closed. Please try again.";  
        } else {  
            return "An unexpected error occurred. Please try again later.";  
        }  
    };  

    const handleChange = (e) => {  
        const { name, value } = e.target;  
        setFormData((prevData) => ({  
            ...prevData,  
            [name]: value,  
        }));  
        setError("");  
    };  

    return (  
        <div className="flex items-center justify-center min-h-screen bg-black">  
            <div className="w-full max-w-md bg-black text-white border border-red-500 rounded-lg p-8 shadow-lg">  
                <h2  
                    className="text-3xl font-bold mb-6 text-center"  
                    aria-label="Login"  
                >  
                    Login  
                </h2>  

                <form className="space-y-4" onSubmit={handleEmailLogin}>  
                    <div>  
                        <label  
                            className="block text-sm font-medium mb-1"  
                            htmlFor="email"  
                        >  
                            Email  
                        </label>  
                        <input  
                            id="email"  
                            name="email"  
                            type="email"  
                            value={formData.email}  
                            onChange={handleChange}  
                            className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:outline-none"  
                            placeholder="Enter your email"  
                            required  
                            aria-label="Email address"  
                        />  
                    </div>  

                    <div>  
                        <label  
                            className="block text-sm font-medium mb-1"  
                            htmlFor="password"  
                        >  
                            Password  
                        </label>  
                        <input  
                            id="password"  
                            name="password"  
                            type="password"  
                            value={formData.password}  
                            onChange={handleChange}  
                            className="w-full px-4 py-2 border border-gray-500 rounded-lg bg-black text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:outline-none"  
                            placeholder="Enter your password"  
                            required  
                            aria-label="Password"  
                        />  
                    </div>  

                    {error && (  
                        <p  
                            className="text-red-500 text-sm text-center"  
                            aria-live="polite"  
                        >  
                            {error}  
                        </p>  
                    )}  

                    {loading && (  
                        <div  
                            className="text-center text-sm text-gray-400"  
                            aria-live="polite"  
                        >  
                            Logging in, please wait...  
                        </div>  
                    )}  

                    <button  
                        type="submit"  
                        className={`w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}  
                        disabled={loading}  
                        aria-label="Login with email"  
                    >  
                        Login  
                    </button>  
                </form>  

                <button  
                    onClick={handleGoogleLogin}  
                    className={`w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 rounded-lg mt-4 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}  
                    disabled={loading}  
                    aria-label="Login with Google"  
                >  
                    Login with Google  
                </button>  

                <div className="mt-4 text-center text-sm">  
                    Don&apos;t have an account?{" "}  
                    <span  
                        onClick={() => navigate("/signup")}  
                        className="text-red-500 hover:underline font-bold cursor-pointer"  
                        aria-label="Navigate to sign up"  
                    >  
                        Sign Up  
                    </span>  
                </div>  
            </div>  
        </div>  
    );  
};  

export default Login;  