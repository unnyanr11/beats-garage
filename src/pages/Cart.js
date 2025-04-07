import React, { useState, useEffect } from "react";  
import { useNavigate, useLocation } from "react-router-dom";  

// Utility Functions for Local Storage Management  
const saveCartItems = (cartItems) => {  
  // Deduplicating by `id`  
  const uniqueCart = cartItems.filter(  
    (item, index, self) =>  
      index === self.findIndex((t) => t.id === item.id)  
  );  
  localStorage.setItem("cartItems", JSON.stringify(uniqueCart));  
  return uniqueCart;  
};  

const getUniqueCartItems = () => {  
  const localData = localStorage.getItem("cartItems") || "[]";  
  const parsedCart = JSON.parse(localData);  
  return saveCartItems(parsedCart); // Ensure deduplication happens here  
};  

const Cart = () => {  
  const navigate = useNavigate();  
  const location = useLocation();  

  // State for managing cart items  
  const [cartItems, setCartItems] = useState([]);  

  // Load items when the component mounts or `location.state` changes  
  useEffect(() => {  
    setCartItems(getUniqueCartItems());  
  }, [location.state]);  

  // Calculate the total price of items  
  const calculateTotal = () =>  
    cartItems.reduce((total, item) => total + (item.price || 0), 0).toFixed(2);  

  // Remove a specific item from the cart  
  const removeItem = (id) => {  
    const updatedCart = cartItems.filter((item) => item.id !== id);  
    setCartItems(updatedCart); // Update state  
    saveCartItems(updatedCart); // Sync with localStorage  
  };  

  // Handle checkout action  
  const handleCheckout = () => {  
    if (cartItems.length === 0) {  
      alert("Your cart is empty! Add some items to proceed.");  
      return;  
    }  

    // Save total to localStorage and navigate to payment page  
    const totalAmount = calculateTotal();  
    localStorage.setItem("totalAmount", totalAmount);  
    navigate("/payment");  
  };  

  // Navigate back to the beats collection page  
  const handleBackToBeats = () => {  
    navigate("/beats");  
  };  

  return (  
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10">  
      <h1 className="text-4xl font-bold mb-8">Your Cart</h1>  

      {cartItems.length > 0 ? (  
        <div className="w-full max-w-3xl space-y-6">  
          {/* Rendering Cart Items */}  
          {cartItems.map((item) => (  
            <div  
              key={item.id}  
              className="flex items-center bg-gray-800 p-4 rounded-lg shadow-md"  
            >  
              {/* Image Section */}  
              <div className="w-20 h-20 mr-4">  
                <img  
                  src={item.imageUrl || "/api/placeholder/400/400"} // Fallback for missing `imageUrl`  
                  alt={item.name || "No Image"}  
                  className="w-full h-full object-cover rounded-lg"  
                  loading="lazy"  
                />  
              </div>  

              {/* Details Section */}  
              <div className="flex-1">  
                <h3 className="text-lg font-bold">  
                  {item.name || "Untitled Beat"}  
                </h3>  
                <p className="text-sm text-gray-400">  
                  Genre: {item.genre || "N/A"} | BPM: {item.bpm || "N/A"} | Mood:{" "}  
                  {item.mood || "N/A"}  
                </p>  
                <p className="text-md text-green-400 font-semibold mt-1">  
                  Price: ${item.price ? item.price.toFixed(2) : "0.00"}  
                </p>  
              </div>  

              {/* Remove Button */}  
              <button  
                className="text-red-500 hover:text-red-600 hover:underline"  
                aria-label={`Remove ${item.name}`}  
                onClick={() => removeItem(item.id)}  
              >  
                Remove  
              </button>  
            </div>  
          ))}  

          {/* Total Price */}  
          <div className="text-right mt-8">  
            <h2 className="text-2xl font-bold text-green-400">  
              Total: ${calculateTotal()}  
            </h2>  
          </div>  

          {/* Checkout Button */}  
          <button  
            onClick={handleCheckout}  
            className="w-full bg-red-500 hover:bg-red-600 text-white text-lg font-bold py-3 rounded-lg transition-colors"  
          >  
            Checkout  
          </button>  
        </div>  
      ) : (  
        <div className="text-center">  
          {/* Empty Cart View */}  
          <p className="text-gray-400 text-2xl mb-6">  
            Your cart is empty! Explore beats and add your favorites.  
          </p>  
          <button  
            onClick={handleBackToBeats}  
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md transition ease-in-out"  
          >  
            Back to Beats  
          </button>  
        </div>  
      )}  
    </div>  
  );  
};  

export default Cart;  