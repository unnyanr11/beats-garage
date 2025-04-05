import React, { useState, useEffect, useMemo } from "react";  
import PropTypes from "prop-types";  
import { ShoppingCart } from "lucide-react";  
import { useNavigate } from "react-router-dom";  
import Popup from "../pages/Popup"; // Use the reusable Popup component  

// Utility functions for cart management  
const getUniqueCartItems = () => {  
    const storedCart = localStorage.getItem("cartItems");  
    const parsedCart = storedCart ? JSON.parse(storedCart) : [];  
    // Remove duplicates  
    return parsedCart.reduce((acc, curr) => {  
        if (!acc.some((item) => item.id === curr.id)) acc.push(curr);  
        return acc;  
    }, []);  
};  

const saveCartItems = (cartItems) => {  
    const uniqueCart = cartItems.reduce((acc, curr) => {  
        if (!acc.some((item) => item.id === curr.id)) acc.push(curr);  
        return acc;  
    }, []);  
    localStorage.setItem("cartItems", JSON.stringify(uniqueCart));  
};  

const FeaturedBeats = ({ isLoggedIn }) => {  
    // Declare static beats array using useMemo to avoid re-instantiating every render  
    const beats = useMemo(  
        () => [  
            { id: 1, name: "Dark Vibes", genre: "trap", bpm: 120, mood: "dark", price: 25, src: "/audio/beat1.mp3" },  
            { id: 2, name: "Chill Flow", genre: "lofi", bpm: 90, mood: "chill", price: 20, src: "/audio/beat2.mp3" },  
            { id: 3, name: "Drill Dreams", genre: "drill", bpm: 140, mood: "energetic", price: 30, src: "/audio/beat3.mp3" },  
        ],  
        []  
    );  

    const [audioElements, setAudioElements] = useState({});  
    const [playingAudioId, setPlayingAudioId] = useState(null);  
    const [showPopup, setShowPopup] = useState(false);  
    const [popupMessage, setPopupMessage] = useState("");  
    const [popupButtons, setPopupButtons] = useState([]);  
    const navigate = useNavigate();  

    // Initialize audio elements for each beat  
    useEffect(() => {  
        const elements = {};  
        beats.forEach((beat) => {  
            const audio = new Audio(beat.src);  
            audio.preload = "metadata";  
            elements[beat.id] = audio;  
        });  
        setAudioElements(elements);  

        // Cleanup audio elements on unmount  
        return () => {  
            Object.values(elements).forEach((audio) => {  
                if (audio) {  
                    audio.pause();  
                    audio.removeAttribute("src");  
                }  
            });  
        };  
    }, [beats]);  

    const togglePlayPause = (beatId) => {  
        const currentAudio = audioElements[beatId];  
        if (!currentAudio) return;  

        // Pause currently playing audio if a different audio is playing  
        if (playingAudioId && playingAudioId !== beatId) {  
            const previousAudio = audioElements[playingAudioId];  
            previousAudio.pause();  
        }  

        // Toggle play/pause for the selected beat  
        if (playingAudioId === beatId) {  
            currentAudio.pause();  
            setPlayingAudioId(null);  
        } else {  
            currentAudio  
                .play()  
                .then(() => setPlayingAudioId(beatId))  
                .catch((err) => console.error(`Error playing audio: ${err}`));  
        }  
    };  

    const handleBuy = (beat) => {  
        const cart = getUniqueCartItems();  
        const beatForCart = { ...beat, title: beat.name }; // Map `name` to `title`  

        if (isLoggedIn) {  
            const isAlreadyInCart = cart.some((item) => item.id === beat.id);  

            if (isAlreadyInCart) {  
                // Show popup for "Already in Cart"  
                showPopupWithMessage("Beat is already in your cart.", [  
                    {  
                        label: "Close",  
                        onClick: closePopup,  
                        className: "bg-blue-500 hover:bg-blue-600",  
                    },  
                ]);  
            } else {  
                // Add to cart and show confirmation popup  
                const updatedCart = [...cart, beatForCart];  
                saveCartItems(updatedCart);  
                showPopupWithMessage("Beat added to your cart!", [  
                    {  
                        label: "Close",  
                        onClick: closePopup,  
                        className: "bg-blue-500 hover:bg-blue-600",  
                    },  
                ]);  
            }  
        } else {  
            // Show login/signup popup if not logged in  
            showPopupWithMessage("Please log in or sign up to purchase.", [  
                {  
                    label: "Log In",  
                    onClick: () => redirectTo("/login"),  
                    className: "bg-blue-500 hover:bg-blue-600",  
                },  
                {  
                    label: "Sign Up",  
                    onClick: () => redirectTo("/signup"),  
                    className: "bg-green-500 hover:bg-green-600",  
                },  
            ]);  
        }  
    };  

    const showPopupWithMessage = (message, buttons) => {  
        setPopupMessage(message);  
        setPopupButtons(buttons || []);  
        setShowPopup(true);  
    };  

    const closePopup = () => {  
        setShowPopup(false);  
    };  

    const redirectTo = (path) => {  
        navigate(path);  
    };  

    return (  
        <section id="featured-beats" className="py-20 container mx-auto px-5">  
            <h2 className="text-4xl font-bold mb-10 text-center text-white">Featured Beats</h2>  
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">  
                {beats.map((beat) => (  
                    <div  
                        key={beat.id}  
                        className="bg-gray-800 border border-gray-700 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 flex flex-col justify-between"  
                    >  
                        <div>  
                            <h2 className="text-xl font-bold text-white mb-3">{beat.name}</h2>  
                            <p className="text-sm text-gray-300">  
                                Genre: {beat.genre} | BPM: {beat.bpm} | Mood: {beat.mood}  
                            </p>  
                            <p className="text-md text-green-400 font-bold">${beat.price}</p>  
                        </div>  

                        <div className="flex justify-center gap-4 mt-4">  
                            <button  
                                className={`px-4 py-2 text-white font-bold rounded-lg transition-colors ${  
                                    playingAudioId === beat.id  
                                        ? "bg-red-600 hover:bg-red-700"  
                                        : "bg-red-500 hover:bg-red-600"  
                                }`}  
                                onClick={() => togglePlayPause(beat.id)}  
                            >  
                                {playingAudioId === beat.id ? "Pause" : "Play"}  
                            </button>  

                            <button  
                                className="px-4 py-2 bg-green-500 text-white font-bold flex items-center gap-2 rounded-lg hover:bg-green-600 transition"  
                                onClick={() => handleBuy(beat)}  
                                aria-label={`Buy ${beat.name}`}  
                            >  
                                <ShoppingCart size={16} />  
                                Buy  
                            </button>  
                        </div>  
                    </div>  
                ))}  
            </div>  

            {/* Popup Section */}  
            {showPopup && (  
                <Popup  
                    message={popupMessage}  
                    buttons={popupButtons}  
                />  
            )}  
        </section>  
    );  
};  

FeaturedBeats.propTypes = {  
    isLoggedIn: PropTypes.bool.isRequired,  
};  

export default FeaturedBeats;  