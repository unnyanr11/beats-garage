import React, { useState } from "react";  

const Cart = () => {  
    // Example cart data (you can replace this with dynamic data from your backend or state)  
    const [cartItems, setCartItems] = useState([  
        {  
            id: 1,  
            name: "Beats Headphone",  
            price: 299.99,  
            quantity: 1,  
            image: "/placeholder/200/200", // Placeholder image  
        },  
        {  
            id: 2,  
            name: "Bluetooth Speaker",  
            price: 199.99,  
            quantity: 2,  
            image: "/placeholder/200/200", // Placeholder image  
        },  
    ]);  

    // Function to handle quantity change  
    const handleQuantityChange = (id, newQuantity) => {  
        const updatedCart = cartItems.map((item) =>  
            item.id === id ? { ...item, quantity: newQuantity } : item  
        );  
        setCartItems(updatedCart);  
    };  

    // Function to remove an item from the cart  
    const handleRemoveItem = (id) => {  
        const updatedCart = cartItems.filter((item) => item.id !== id);  
        setCartItems(updatedCart);  
    };  

    // Calculate the total price  
    const totalPrice = cartItems.reduce(  
        (total, item) => total + item.price * item.quantity,  
        0  
    );  

    return (  
        <div className="min-h-screen bg-gray-100">  
            <div className="container mx-auto px-5 py-10">  
                <h1 className="text-3xl font-bold text-gray-800 mb-6">  
                    Shopping Cart  
                </h1>  

                {/* Cart Items */}  
                {cartItems.length > 0 ? (  
                    <div className="space-y-6">  
                        {cartItems.map((item) => (  
                            <div  
                                key={item.id}  
                                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md"  
                            >  
                                {/* Item Image */}  
                                <img  
                                    src={item.image}  
                                    alt={item.name}  
                                    className="w-16 h-16 rounded-lg object-cover"  
                                />  

                                {/* Item Details */}  
                                <div className="flex-1 px-4">  
                                    <h2 className="text-lg font-bold">  
                                        {item.name}  
                                    </h2>  
                                    <p className="text-gray-600">  
                                        $ {item.price.toFixed(2)}  
                                    </p>  
                                </div>  

                                {/* Quantity Adjuster */}  
                                <div className="flex items-center">  
                                    <button  
                                        onClick={() =>  
                                            handleQuantityChange(  
                                                item.id,  
                                                Math.max(item.quantity - 1, 1)  
                                            )  
                                        }  
                                        className="px-2 py-1 bg-gray-300 rounded-lg"  
                                    >  
                                        -  
                                    </button>  
                                    <span className="px-4">{item.quantity}</span>  
                                    <button  
                                        onClick={() =>  
                                            handleQuantityChange(  
                                                item.id,  
                                                item.quantity + 1  
                                            )  
                                        }  
                                        className="px-2 py-1 bg-gray-300 rounded-lg"  
                                    >  
                                        +  
                                    </button>  
                                </div>  

                                {/* Remove Item Button */}  
                                <button  
                                    onClick={() => handleRemoveItem(item.id)}  
                                    className="text-red-500 hover:text-red-600 ml-4"  
                                >  
                                    Remove  
                                </button>  
                            </div>  
                        ))}  

                        {/* Total Price */}  
                        <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">  
                            <h2 className="text-xl font-bold">Total</h2>  
                            <p className="text-xl font-bold text-gray-800">  
                                $ {totalPrice.toFixed(2)}  
                            </p>  
                        </div>  

                        {/* Checkout Button */}  
                        <button  
                            className="w-full bg-red-500 text-white hover:bg-red-600 font-bold py-2 rounded-lg"  
                            onClick={() => alert("Proceeding to checkout...")}  
                        >  
                            Checkout  
                        </button>  
                    </div>  
                ) : (  
                    // Empty Cart Message  
                    <p className="text-gray-600 text-center">  
                        Your cart is empty. Go add some items!  
                    </p>  
                )}  
            </div>  
        </div>  
    );  
};  

export default Cart;  