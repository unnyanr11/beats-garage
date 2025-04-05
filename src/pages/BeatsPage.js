
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

const BeatsPage = ({ isLoggedIn }) => {
    const beats = [
        { title: "Dark Vibes", genre: "trap", bpm: 120, mood: "dark", price: 25, src: "/audio/beat1.mp3" },
        { title: "Chill Flow", genre: "lofi", bpm: 90, mood: "chill", price: 20, src: "/audio/beat2.mp3" },
        { title: "Drill Dreams", genre: "drill", bpm: 140, mood: "energetic", price: 30, src: "/audio/beat3.mp3" },
        { title: "Upbeat Groove", genre: "edm", bpm: 130, mood: "upbeat",price: 15, src: "/audio/beat4.mp3"  },
        { title: "Relaxed Beats", genre: "lofi", bpm: 85, mood: "chill", price: 12, src: "/audio/beat5.mp3"  },
    ];

    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({ bpm: "all", genre: "all", mood: "all" });
    const [filteredBeats, setFilteredBeats] = useState(beats);
    const [showPopup, setShowPopup] = useState(false); // Controls Login/Signup popup
    const [existsPopup, setExistsPopup] = useState(false); // Controls "Already Exists" popup
    const [addedPopup, setAddedPopup] = useState(false); // Controls "Added to Cart" popup
    const [selectedBeat, setSelectedBeat] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const bpm = searchParams.get("bpm") || "all";
        const genre = searchParams.get("genre") || "all";
        const mood = searchParams.get("mood") || "all";
        setFilters({ bpm, genre, mood });
    }, [searchParams]);

    useEffect(() => {
        const filterBeats = () =>
            beats.filter((beat) => {
                const bpmMatch =
                    filters.bpm === "all" ||
                    (filters.bpm === "60-90" && beat.bpm >= 60 && beat.bpm <= 90) ||
                    (filters.bpm === "91-120" && beat.bpm >= 91 && beat.bpm <= 120) ||
                    (filters.bpm === "121-150" && beat.bpm >= 121 && beat.bpm <= 150) ||
                    (filters.bpm === "151+" && beat.bpm > 150);

                const genreMatch = filters.genre === "all" || filters.genre === beat.genre;
                const moodMatch = filters.mood === "all" || filters.mood === beat.mood;

                return bpmMatch && genreMatch && moodMatch;
            });

        setFilteredBeats(filterBeats());
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        setSearchParams(newFilters);
    };

    const handleAddToCart = (beat) => {
        const cart = JSON.parse(localStorage.getItem("cartItems")) || [];

        if (isLoggedIn) {
            const isAlreadyInCart = cart.some((item) => item.title === beat.title);

            if (isAlreadyInCart) {
                // Show "Already Exists" popup
                setExistsPopup(true);
            } else {
                // Add the beat to the cart and store it in localStorage
                localStorage.setItem("cartItems", JSON.stringify([...cart, beat]));
                setAddedPopup(true); // Show "Added to Cart" popup
            }
        } else {
            // Show login/signup popup if not logged in
            setSelectedBeat(beat);
            setShowPopup(true);
        }
    };

    const closePopup = (type) => {
        if (type === "exists") {
            setExistsPopup(false);
        } else if (type === "added") {
            setAddedPopup(false);
        } else {
            setShowPopup(false);
            setSelectedBeat(null);
        }
    };

    const redirectTo = (path) => {
        navigate(path, { replace: true });
    };

    return (
        <div className="bg-black text-white min-h-screen p-8 font-sans relative">
            <header className="p-4 text-center">
                <h1 className="text-4xl font-bold">Explore Our Beats</h1>
                <p className="text-gray-400 mt-2">The best beats for your tracks</p>
            </header>

            {/* Filters Section */}
            <section className="bg-gray-800 p-6 shadow-lg rounded-lg mb-8">
                <form className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="bpm" className="text-sm text-gray-300 mb-1">
                            BPM
                        </label>
                        <select
                            id="bpm"
                            name="bpm"
                            value={filters.bpm}
                            onChange={handleFilterChange}
                            className="bg-black border border-gray-600 text-white rounded-lg px-4 py-2"
                        >
                            <option value="all">All BPMs</option>
                            <option value="60-90">60-90</option>
                            <option value="91-120">91-120</option>
                            <option value="121-150">121-150</option>
                            <option value="151+">151+</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="genre" className="text-sm text-gray-300 mb-1">
                            Genre
                        </label>
                        <select
                            id="genre"
                            name="genre"
                            value={filters.genre}
                            onChange={handleFilterChange}
                            className="bg-black border border-gray-600 text-white rounded-lg px-4 py-2"
                        >
                            <option value="all">All Genres</option>
                            <option value="trap">Trap</option>
                            <option value="lofi">Lo-Fi</option>
                            <option value="drill">Drill</option>
                            <option value="edm">EDM</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="mood" className="text-sm text-gray-300 mb-1">
                            Mood
                        </label>
                        <select
                            id="mood"
                            name="mood"
                            value={filters.mood}
                            onChange={handleFilterChange}
                            className="bg-black border border-gray-600 text-white rounded-lg px-4 py-2"
                        >
                            <option value="all">All Moods</option>
                            <option value="dark">Dark</option>
                            <option value="chill">Chill</option>
                            <option value="energetic">Energetic</option>
                            <option value="upbeat">Upbeat</option>
                        </select>
                    </div>
                </form>
            </section>

            {/* Beats Section */}
            <section className="flex flex-col items-center mt-8 space-y-6">
                {existsPopup && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                            <h2 className="text-white text-xl font-bold mb-4">
                                Beat is already in your cart.
                            </h2>
                            <button
                                className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg"
                                onClick={() => closePopup("exists")}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {addedPopup && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                            <h2 className="text-white text-xl font-bold mb-4">
                                Beat successfully added to your cart!
                            </h2>
                            <button
                                className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg"
                                onClick={() => closePopup("added")}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {showPopup && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                            <h2 className="text-white text-xl font-bold mb-4">
                                Please Sign Up or Log In to buy &quot;{selectedBeat?.title}&quot;
                            </h2>
                            <div className="flex gap-4 justify-center">
                                <button
                                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                    onClick={() => redirectTo("/login")}
                                >
                                    Log In
                                </button>
                                <button
                                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                                    onClick={() => redirectTo("/signup")}
                                >
                                    Sign Up
                                </button>
                            </div>
                            <button
                                className="mt-4 text-gray-300 hover:underline"
                                onClick={() => closePopup("login")}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-10/12">
                    {filteredBeats.length > 0 ? (
                        filteredBeats.map((beat, index) => (
                            <div
                                key={index}
                                className="p-4 bg-gray-800 text-center rounded-lg shadow-lg"
                            >
                                <h2 className="font-bold text-lg mb-2">{beat.title}</h2>
                                <p className="text-sm text-gray-300">
                                    Genre: {beat.genre} | BPM: {beat.bpm} | Mood: {beat.mood}
                                </p>
                                <div className="mt-4 flex justify-center gap-2">
                                    <button
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg"
                                        onClick={() => alert(`Playing ${beat.title}`)}
                                    >
                                        Play
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg flex items-center gap-2"
                                        onClick={() => handleAddToCart(beat)}
                                    >
                                        <ShoppingCart size={20} />
                                        Buy
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-center">
                            No beats match the selected filters.
                        </p>
                    )}
                </div>
            </section>

            {/* Go Back to Home Button */}
            <div className="flex justify-center mt-12">
                <button
                    onClick={() => navigate("/")}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all duration-300"
                >
                    Go Back to Home
                </button>
            </div>

            <footer className="text-center text-gray-500 text-sm mt-12">
                © 2025 Beats Garage. All rights reserved.
            </footer>
        </div>
    );
};

// Add PropTypes validation
BeatsPage.propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,
};

export default BeatsPage;
