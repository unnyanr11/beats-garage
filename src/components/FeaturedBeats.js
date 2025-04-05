
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ShoppingCart } from "lucide-react"; // Play/Pause icons removed as text is used now
import { useNavigate } from "react-router-dom";

const FeaturedBeats = ({ isLoggedIn }) => {
    const beats = [
        // Ensure the paths in 'src' are correct relative to your public folder
        { id: 1, name: "Dark Vibes", genre: "trap", bpm: 120, mood: "dark", price: 25, src: "/audio/beat1.mp3" },
        { id: 2, name: "Chill Flow", genre: "lofi", bpm: 90, mood: "chill", price: 20, src: "/audio/beat2.mp3" },
        { id: 3, name: "Drill Dreams", genre: "drill", bpm: 140, mood: "energetic", price: 30, src: "/audio/beat3.mp3" },
    ];

    const [audioElements, setAudioElements] = useState({});
    const [playingAudioId, setPlayingAudioId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedBeat, setSelectedBeat] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const elements = {};
        beats.forEach(beat => {
            const audio = new Audio(beat.src);
            audio.preload = 'metadata';
            const handleEnd = () => setPlayingAudioId(null);
            audio.addEventListener('ended', handleEnd);
            const handleError = (e) => console.error(`Error loading audio ${beat.id}:`, e);
            audio.addEventListener('error', handleError);
            elements[beat.id] = { audio, handleEnd, handleError };
        });
        setAudioElements(elements);

        return () => {
            Object.values(elements).forEach(({ audio, handleEnd, handleError }) => {
                 if (audio) {
                     audio.removeEventListener('ended', handleEnd);
                     audio.removeEventListener('error', handleError);
                     audio.pause();
                     audio.src = '';
                 }
            });
        };
    }, []);

    const togglePlayPause = (beatId) => {
        const currentAudioData = audioElements[beatId];
        if (!currentAudioData || !currentAudioData.audio) return;

        const currentAudio = currentAudioData.audio;

        if (playingAudioId && playingAudioId !== beatId) {
            const otherAudioData = audioElements[playingAudioId];
            if (otherAudioData && otherAudioData.audio) {
                otherAudioData.audio.pause();
            }
        }

        if (playingAudioId === beatId) {
            currentAudio.pause();
            setPlayingAudioId(null);
        } else {
            currentAudio.play().then(() => {
                setPlayingAudioId(beatId);
            }).catch(error => {
                console.error("Audio play failed for beat ID", beatId, ":", error);
                setPlayingAudioId(null);
            });
        }
    };


    const handleBuy = (beat) => {
        if (isLoggedIn) {
            const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
            const isAlreadyInCart = cart.some((item) => item.id === beat.id);

            if (isAlreadyInCart) {
                alert(`${beat.name} is already in your cart!`);
            } else {
                localStorage.setItem("cartItems", JSON.stringify([...cart, beat]));
                alert(`${beat.name} added to your cart!`);
            }
        } else {
            if (playingAudioId) {
                 const audioToPauseData = audioElements[playingAudioId];
                 if (audioToPauseData && audioToPauseData.audio) {
                    audioToPauseData.audio.pause();
                    setPlayingAudioId(null);
                 }
            }
            setSelectedBeat(beat);
            setShowPopup(true);
        }
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedBeat(null);
    };

    const redirectTo = (path) => {
        navigate(path, { replace: true });
    };

    return (
        <section id="featured-beats" className="py-20 container mx-auto px-5 relative">
            <h2 className="text-4xl font-bold mb-10 text-center text-white">Featured Beats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {beats.map((beat) => (
                    <div
                        key={beat.id}
                        className="bg-gray-800 border border-gray-700 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 flex flex-col justify-between"
                    >
                       <div className="flex-grow">
                           <h3 className="text-xl font-bold text-white mb-3">{beat.name}</h3>
                           <p className="text-gray-400 mb-3 text-sm">
                               {beat.genre} | {beat.bpm} BPM | {beat.mood}
                           </p>
                            <p className="text-lg font-semibold text-green-400 mb-4">
                                ${beat.price}
                            </p>
                       </div>

                        {/* --- BUTTON STYLING UPDATED HERE --- */}
                        <div className="flex justify-center gap-4 mt-4">
                             {/* Play/Pause Button */}
                             <button
                                className={`px-4 py-2 w-24 text-white font-bold rounded-lg transition-colors duration-200 ease-in-out ${playingAudioId === beat.id ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'}`}
                                onClick={() => togglePlayPause(beat.id)}
                                aria-label={playingAudioId === beat.id ? `Pause ${beat.name}` : `Play ${beat.name}`}
                            >
                                {playingAudioId === beat.id ? "Pause" : "Play"} {/* Display text */}
                            </button>

                            {/* Buy Button */}
                            <button
                                className="px-4 py-2 w-24 bg-green-500 text-white font-bold flex items-center justify-center gap-2 rounded-lg hover:bg-green-600 transition-colors duration-200 ease-in-out"
                                onClick={() => handleBuy(beat)}
                                aria-label={`Buy ${beat.name}`}
                            >
                                <ShoppingCart size={16} />
                                Buy
                            </button>
                        </div>
                         {/* --- END OF BUTTON STYLING UPDATE --- */}
                    </div>
                ))}
            </div>

            {/* Login/Signup Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-2xl text-center max-w-md w-full mx-auto">
                        <h3 className="text-xl font-semibold text-white mb-4">
                            Log In or Sign Up to Buy
                        </h3>
                        <p className="text-gray-300 mb-6">You need an account to purchase &quot;{selectedBeat?.name}&quot;.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={() => redirectTo("/login")}
                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => redirectTo("/signup")}
                                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                                Sign Up
                            </button>
                        </div>
                        <button
                            className="mt-6 text-sm text-gray-400 hover:text-gray-200 hover:underline"
                            onClick={closePopup}
                            aria-label="Close login prompt"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

FeaturedBeats.propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
};

export default FeaturedBeats;