import React, { useState, useEffect } from "react";  
import PropTypes from "prop-types";  
import { useNavigate, useSearchParams } from "react-router-dom";  
import { ShoppingCart } from "lucide-react";  
import Popup from "../pages/Popup"; // Import reusable Popup component  

// Utilities for Cart Management  
const getCartItems = () => {  
    const storedCart = localStorage.getItem("cartItems");  
    return storedCart ? JSON.parse(storedCart) : [];  
};  

const saveCartItems = (items) => {  
    const uniqueCart = items.reduce((acc, curr) => {  
        if (!acc.some((item) => item.title === curr.title)) acc.push(curr);  
        return acc;  
    }, []);  
    localStorage.setItem("cartItems", JSON.stringify(uniqueCart));  
    return uniqueCart;  
};  

const isBeatInCart = (beat) => {  
    const cart = getCartItems();  
    return cart.some((item) => item.title === beat.title);  
};  

// BeatsPage Component  
const BeatsPage = ({ isLoggedIn }) => {  
    const beats = [  
        { title: "Dark Vibes", genre: "trap", bpm: 120, mood: "dark", price: 25, src: "/audio/beat1.mp3" },  
        { title: "Chill Flow", genre: "lofi", bpm: 90, mood: "chill", price: 20, src: "/audio/beat2.mp3" },  
        { title: "Drill Dreams", genre: "drill", bpm: 140, mood: "energetic", price: 30, src: "/audio/beat3.mp3" },  
        { title: "Upbeat Groove", genre: "edm", bpm: 130, mood: "upbeat", price: 15, src: "/audio/beat4.mp3" },  
        { title: "Relaxed Beats", genre: "lofi", bpm: 85, mood: "chill", price: 12, src: "/audio/beat5.mp3" },  
    ];  

    const [searchParams, setSearchParams] = useSearchParams();  
    const [filters, setFilters] = useState({ bpm: "all", genre: "all", mood: "all" });  
    const [filteredBeats, setFilteredBeats] = useState(beats);  
    const [showPopup, setShowPopup] = useState(false);  
    const [popupMessage, setPopupMessage] = useState("");  
    const [popupButtons, setPopupButtons] = useState([]);  
    const navigate = useNavigate();  

    useEffect(() => {  
        const bpm = searchParams.get("bpm") || "all";  
        const genre = searchParams.get("genre") || "all";  
        const mood = searchParams.get("mood") || "all";  
        setFilters({ bpm, genre, mood });  
    }, [searchParams]);  

    useEffect(() => {  
        const filterBeats = () => {  
            return beats.filter((beat) => {  
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
        };  

        setFilteredBeats(filterBeats());  
    }, [filters]);  

    const handleFilterChange = (e) => {  
        const { name, value } = e.target;  
        const newFilters = { ...filters, [name]: value };  
        setFilters(newFilters);  
        setSearchParams(newFilters);  
    };  

    const handleAddToCart = (beat) => {  
        if (isLoggedIn) {  
            if (isBeatInCart(beat)) {  
                showPopupWithMessage("Beat is already in your cart.", [  
                    {  
                        label: "Close",  
                        className: "bg-blue-500 hover:bg-blue-600",  
                        onClick: closePopup,  
                    },  
                ]);  
            } else {  
                saveCartItems([...getCartItems(), beat]);  
                showPopupWithMessage("Beat added to your cart!", [  
                    {  
                        label: "Close",  
                        className: "bg-blue-500 hover:bg-blue-600",  
                        onClick: closePopup,  
                    },  
                ]);  
            }  
        } else {  
            showPopupWithMessage(`Please log in or sign up to buy "${beat.title}".`, [  
                {  
                    label: "Log In",  
                    className: "bg-blue-500 hover:bg-blue-600",  
                    onClick: () => redirectTo("/login"),  
                },  
                {  
                    label: "Sign Up",  
                    className: "bg-green-500 hover:bg-green-600",  
                    onClick: () => redirectTo("/signup"),  
                },  
            ]);  
        }  
    };  

    const showPopupWithMessage = (message, buttons) => {  
        setPopupMessage(message);  
        setPopupButtons(buttons);  
        setShowPopup(true);  
    };  

    const closePopup = () => {  
        setShowPopup(false);  
    };  

    const redirectTo = (path) => {  
        navigate(path, { replace: true });  
    };  

    return (  
        <div className="bg-black text-white min-h-screen p-8 font-sans">  
            <header className="p-4 text-center">  
                <h1 className="text-4xl font-bold">Explore Our Beats</h1>  
                <p className="text-gray-400 mt-2">The best beats for your tracks</p>  
            </header>  

            {/* Filters Section */}  
            <section className="bg-gray-800 p-6 shadow-lg rounded-lg mb-8">  
                <form className="flex flex-col md:flex-row items-center justify-center gap-4">  
                    {/* BPM Filter */}  
                    <div className="flex flex-col">  
                        <label htmlFor="bpm" className="text-sm text-gray-300 mb-1">BPM</label>  
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

                    {/* Genre Filter */}  
                    <div className="flex flex-col">  
                        <label htmlFor="genre" className="text-sm text-gray-300 mb-1">Genre</label>  
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

                    {/* Mood Filter */}  
                    <div className="flex flex-col">  
                        <label htmlFor="mood" className="text-sm text-gray-300 mb-1">Mood</label>  
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-10/12">  
                    {filteredBeats.length > 0 ? (  
                        filteredBeats.map((beat, index) => (  
                            <div key={index} className="p-4 bg-gray-800 text-center rounded-lg shadow-lg">  
                                <h2 className="font-bold text-lg mb-2">{beat.title}</h2>  
                                <p className="text-sm text-gray-300">  
                                    Genre: {beat.genre} | BPM: {beat.bpm} | Mood: {beat.mood}  
                                </p>  
                                <p className="text-md text-green-400 font-bold">${beat.price}</p>  
                                <div className="mt-4 flex justify-center gap-2">  
                                    <button  
                                        onClick={() => alert(`Playing ${beat.title}`)}  
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg"  
                                    >  
                                        Play  
                                    </button>  
                                    <button  
                                        onClick={() => handleAddToCart(beat)}  
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg flex items-center gap-2"  
                                    >  
                                        <ShoppingCart size={20} />  
                                        Buy  
                                    </button>  
                                </div>  
                            </div>  
                        ))  
                    ) : (  
                        <p className="text-gray-400">No beats match the selected filters.</p>  
                    )}  
                </div>  
            </section>  

            {/* Popup Component */}  
            {showPopup && (  
                <Popup  
                    message={popupMessage}  
                    buttons={popupButtons}  
                />  
            )}  

            <footer className="text-center text-xs text-gray-600 mt-12">  
                © 2025 Beats Garage. All rights reserved.  
            </footer>  
        </div>  
    );  
};  

// PropTypes validation  
BeatsPage.propTypes = {  
    isLoggedIn: PropTypes.bool.isRequired,  
};  

export default BeatsPage;  