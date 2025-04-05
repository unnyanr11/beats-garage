import React, { useState } from "react";  
import { ShoppingCart } from "lucide-react";  
import { useNavigate } from "react-router-dom";  

const FeaturedBeats = () => {  
    const beats = [  
        { id: 1, name: "Dark Vibes", genre: "trap", bpm: 120, mood: "dark", price: 25, src: "beat1.mp3" },  
        { id: 2, name: "Chill Flow", genre: "lofi", bpm: 90, mood: "chill", price: 20, src: "beat2.mp3" },  
        { id: 3, name: "Drill Dreams", genre: "drill", bpm: 140, mood: "energetic", price: 30, src: "beat3.mp3" },  
    ];  

    const [playingAudio, setPlayingAudio] = useState(null); // For current audio playback  
    const [showPopup, setShowPopup] = useState(false); // Controls popup visibility  
    const [selectedBeat, setSelectedBeat] = useState(null); // Stores the beat clicked to buy  
    const navigate = useNavigate();  

    // Mock logged-in state (replace this logic with real authentication check)  
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";  

    const togglePlayPause = (audioId, audioElement) => {  
        if (playingAudio && playingAudio !== audioElement) {  
            playingAudio.pause();  
            playingAudio.currentTime = 0; // Reset previous audio if playing a new one  
        }  

        if (audioElement.paused) {  
            audioElement.play();  
            setPlayingAudio(audioElement); // Set the currently playing audio  
        } else {  
            audioElement.pause();  
            setPlayingAudio(null); // Stop playback  
        }  
    };  

    const handleBuy = (beat) => {  
        if (isLoggedIn) {  
            // Add to cart if logged in  
            const cart = JSON.parse(localStorage.getItem("cartItems")) || [];  
            const isAlreadyInCart = cart.some((item) => item.id === beat.id);  

            if (isAlreadyInCart) {  
                alert(`${beat.name} is already in your cart!`);  
            } else {  
                localStorage.setItem("cartItems", JSON.stringify([...cart, beat])); // Add to cart in localStorage  
                alert(`${beat.name} added to your cart!`);  
            }  
        } else {  
            // Show login/signup popup if not logged in  
            setSelectedBeat(beat);  
            setShowPopup(true);  
        }  
    };  

    // Close the popup  
    const closePopup = () => {  
        setShowPopup(false);  
        setSelectedBeat(null);  
    };  

    // Redirect to login/signup page  
    const redirectTo = (path) => {  
        navigate(path, { replace: true });  
    };  

    return (  
        <section id="featured-beats" className="py-20 container mx-auto px-5">  
            <h2 className="text-4xl font-bold mb-10 text-center text-white">Featured Beats</h2>  
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">  
                {beats.map((beat) => (  
                    <div  
                        key={beat.id}  
                        className="bg-gray-800 border border-gray-700 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-2"  
                    >  
                        <h3 className="text-xl font-bold text-white mb-3">{beat.name}</h3>  
                        <p className="text-gray-400 mb-3">  
                            Genre: {beat.genre} | BPM: {beat.bpm} | Mood: {beat.mood} | Price: ${beat.price}  
                        </p>  
                        
                        {/* Audio element */}  
                        <audio id={`audio-${beat.id}`} src={beat.src}></audio>  

                        {/* Buttons */}  
                        <div className="flex justify-center gap-4 mt-4">  
                            {/* Play Button */}  
                            <button  
                                className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"  
                                onClick={() =>  
                                    togglePlayPause(beat.id, document.getElementById(`audio-${beat.id}`))  
                                }  
                            >  
                                {playingAudio?.getAttribute("id") === `audio-${beat.id}` ? "Pause" : "Play"}  
                            </button>  

                            {/* Buy Button */}  
                            <button  
                                className="px-4 py-2 bg-green-500 text-white font-bold flex items-center gap-2 rounded-lg hover:bg-green-600"  
                                onClick={() => handleBuy(beat)}  
                            >  
                                <ShoppingCart className="w-4 h-4" />  
                                Buy  
                            </button>  
                        </div>  
                    </div>  
                ))}  
            </div>  

            {/* Login/Signup Popup */}  
            {showPopup && (  
                <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">  
                    <div className="bg-gray-800 p-6 rounded-lg shadow-2xl text-center">  
                        <h3 className="text-2xl font-bold text-white">  
                            Please Log In or Sign Up to buy &quot;{selectedBeat?.name}&quot;  
                        </h3>  
                        <div className="mt-6 flex justify-center gap-4">  
                            <button  
                                onClick={() => redirectTo("/login")}  
                                className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"  
                            >  
                                Log In  
                            </button>  
                            <button  
                                onClick={() => redirectTo("/signup")}  
                                className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"  
                            >  
                                Sign Up  
                            </button>  
                        </div>  
                        <button  
                            className="mt-4 text-gray-400 hover:text-white hover:underline"  
                            onClick={closePopup}  
                        >  
                            Cancel  
                        </button>  
                    </div>  
                </div>  
            )}  
        </section>  
    );  
};  

export default FeaturedBeats;  