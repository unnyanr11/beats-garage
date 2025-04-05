import React, { useState, useEffect } from "react";  
import { useNavigate, useLocation } from "react-router-dom";  

const Cart = () => {  
    const navigate = useNavigate();  
    const location = useLocation();  

    // Retrieve cart items from localStorage or initialize as empty.  
    const [cartItems, setCartItems] = useState(() => {  
        const storedCart = localStorage.getItem("cartItems");  
        return storedCart ? JSON.parse(storedCart) : [];  
    });  

    // Force re-render when redirected with a reload state.  
    const [reloadKey, setReloadKey] = useState(0);  

    useEffect(() => {  
        if (location.state?.reload) {  
            setReloadKey((prevKey) => prevKey + 1);  
        }  
    }, [location.state]);  

    // Calculate the total price dynamically.  
    const calculateTotal = () =>  
        cartItems.reduce((total, item) => total + (item.price || 0), 0).toFixed(2);  

    // Remove a single item from the cart.  
    const removeItem = (id) => {  
        const updatedCart = cartItems.filter((item) => item.id !== id);  
        setCartItems(updatedCart); // Update the cart in state.  
        localStorage.setItem("cartItems", JSON.stringify(updatedCart)); // Sync localStorage.  
    };  

    // Navigate to the payment page.  
    const handleCheckout = () => {  
        if (cartItems.length > 0) {  
            const totalAmount = calculateTotal();  
            localStorage.setItem("totalAmount", totalAmount); // Save the total price.  
            navigate("/payment");  
        } else {  
            alert("Your cart is empty!");  
        }  
    };  

    // Navigate back to the beats page.  
    const handleBackToBeats = () => {  
        navigate("/beats");  
    };  

    return (  
        <div className="min-h-screen bg-black text-white flex flex-col items-center py-10">  
            <h1 className="text-4xl font-bold mb-8">Your Cart</h1>  

            {cartItems.length > 0 ? (  
                <div key={reloadKey} className="w-full max-w-2xl space-y-6">  
                    {/* Render each cart item */}  
                    {cartItems.map((item) => (  
                        <div  
                            key={item.id}  
                            className="flex justify-between items-center bg-gray-800 p-4 rounded-lg"  
                        >  
                            {/* Item details */}  
                            <div>  
                                <h3 className="text-lg font-bold">{item.title}</h3>  
                                <p className="text-sm text-gray-400">  
                                    Genre: {item.genre || "N/A"} | BPM: {item.bpm || "N/A"} | Mood:{" "}  
                                    {item.mood || "N/A"}  
                                </p>  
                                <p className="text-gray-300 mt-1">  
                                    Price: ${item.price ? item.price.toFixed(2) : "0.00"}  
                                </p>  
                            </div>  

                            {/* Remove button */}  
                            <button  
                                onClick={() => removeItem(item.id)}  
                                className="text-red-500 hover:text-red-600 hover:underline"  
                            >  
                                Remove  
                            </button>  
                        </div>  
                    ))}  

                    {/* Total Price */}  
                    <h2 className="text-xl font-bold text-green-400">  
                        Total: ${calculateTotal()}  
                    </h2>  

                    {/* Checkout button */}  
                    <button  
                        onClick={handleCheckout}  
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg text-lg"  
                    >  
                        Checkout  
                    </button>  
                </div>  
            ) : (  
                <div className="text-center">  
                    {/* Empty cart message */}  
                    <p className="text-gray-400 text-2xl mb-6">Your cart is empty.</p>  

                    {/* Back to Beats button */}  
                    <button  
                        onClick={handleBackToBeats}  
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg"  
                    >  
                        Back to Beats  
                    </button>  
                </div>  
            )}  
        </div>  
    );  
};  

export default Cart;  