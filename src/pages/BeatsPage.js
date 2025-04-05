import React, { useState, useEffect } from "react";  
import { useNavigate, useSearchParams } from "react-router-dom";  
import { ShoppingCart } from "lucide-react";  

const BeatsPage = () => {  
    const beats = [  
        { id: 1, title: "Dark Vibes", genre: "trap", bpm: 120, mood: "dark", price: 25 },  
        { id: 2, title: "Chill Flow", genre: "lofi", bpm: 90, mood: "chill", price: 20 },  
        { id: 3, title: "Drill Dreams", genre: "drill", bpm: 140, mood: "energetic", price: 30 },  
        { id: 4, title: "Upbeat Groove", genre: "edm", bpm: 130, mood: "upbeat", price: 35 },  
        { id: 5, title: "Relaxed Beats", genre: "lofi", bpm: 85, mood: "chill", price: 15 },  
    ];  

    const [searchParams, setSearchParams] = useSearchParams();  
    const [filters, setFilters] = useState({ bpm: "all", genre: "all", mood: "all" });  
    const [filteredBeats, setFilteredBeats] = useState(beats);  
    const [showPopup, setShowPopup] = useState(false);  
    const [selectedBeat, setSelectedBeat] = useState(null);  
    const navigate = useNavigate();  

    // Example logged-in state (replace with your actual authentication logic)  
    const isLoggedIn = true;  

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

    // Add the selected beat to the cart with all its details  
    const handleAddToCart = (beat) => {  
        if (isLoggedIn) {  
            // Retrieve the current cart from localStorage or initialize it as an empty array  
            const cart = JSON.parse(localStorage.getItem("cartItems")) || [];  

            // Check if the beat already exists in the cart  
            const isBeatInCart = cart.some((item) => item.id === beat.id);  

            if (isBeatInCart) {  
                alert(`${beat.title} is already in your cart!`);  
            } else {  
                // Add the selected beat with full details to the cart  
                const updatedCart = [...cart, beat];  
                localStorage.setItem("cartItems", JSON.stringify(updatedCart)); // Save updated cart to localStorage  

                alert(`${beat.title} has been added to your cart!`);  
            }  
        } else {  
            // Show login/signup popup if the user is not logged in  
            setSelectedBeat(beat);  
            setShowPopup(true);  
        }  
    };  

    const closePopup = () => {  
        setShowPopup(false);  
        setSelectedBeat(null);  
    };  

    const redirectTo = (path) => {  
        navigate(path, { replace: true, state: { fromBeatsPage: true } });  
    };  

    return (  
        <div className="bg-black text-white min-h-screen p-8 font-sans relative">  
            <header className="p-4 text-center">  
                <h1 className="text-4xl font-bold">Explore Our Beats</h1>  
                <p className="text-gray-400 mt-2">The best beats for your tracks</p>  
            </header>  

            <section className="bg-gray-800 p-6 shadow-lg rounded-lg mb-8">  
                <form className="flex flex-col md:flex-row items-center justify-center gap-4">  
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

            <section className="flex flex-col items-center mt-8 space-y-6">  
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-10/12">  
                    {filteredBeats.length > 0 ? (  
                        filteredBeats.map((beat) => (  
                            <div  
                                key={beat.id}  
                                className="p-4 bg-gray-800 text-center rounded-lg shadow-lg"  
                            >  
                                <h2 className="font-bold text-lg mb-2">{beat.title}</h2>  
                                <p className="text-sm text-gray-300">  
                                    Genre: {beat.genre} | BPM: {beat.bpm} | Mood: {beat.mood} | Price: ${beat.price}  
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
                        <p className="text-gray-400 text-center">No beats match the selected filters.</p>  
                    )}  
                </div>  
            </section>  

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
                        <button className="mt-4 text-gray-300 hover:underline" onClick={closePopup}>  
                            Close  
                        </button>  
                    </div>  
                </div>  
            )}  

            <footer className="text-center text-gray-500 text-sm mt-12">  
                © 2025 Beats Garage. All rights reserved.  
            </footer>  
        </div>  
    );  
};  

export default BeatsPage;  