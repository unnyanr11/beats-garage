import { useState } from "react";  

const Filters = () => {  
    const [filters, setFilters] = useState({  
        bpm: "all",  
        genre: "all",  
        mood: "all",  
    });  

    const handleFilterChange = (e) => {  
        setFilters({ ...filters, [e.target.name]: e.target.value });  
    };  

    const applyFilters = () => {  
        console.log("Applied Filters:", filters);  
    };  

    return (  
        <div className="filters mb-10 bg-black p-5 border border-red-500 rounded">  
            <h3 className="text-2xl font-bold mb-4 text-center">Filter Beats</h3>  
            <div className="grid md:grid-cols-3 gap-5">  
                <div>  
                    <label className="block text-lg mb-2">BPM</label>  
                    <select  
                        name="bpm"  
                        onChange={handleFilterChange}  
                        className="form-input p-2 border-2 border-white bg-black text-white rounded w-full"  
                    >  
                        <option value="all">All BPMs</option>  
                        <option value="60-80">60-80</option>  
                        <option value="81-100">81-100</option>  
                        <option value="101-120">101-120</option>  
                        <option value="121-140">121-140</option>  
                        <option value="141+">141+</option>  
                    </select>  
                </div>  
                <div>  
                    <label className="block text-lg mb-2">Genre</label>  
                    <select  
                        name="genre"  
                        onChange={handleFilterChange}  
                        className="form-input p-2 border-2 border-white bg-black text-white rounded w-full"  
                    >  
                        <option value="all">All Genres</option>  
                        <option value="trap">Trap</option>  
                        <option value="drill">Drill</option>  
                        <option value="ethnic">Ethnic</option>  
                        <option value="hiphop">Hip-Hop</option>  
                        <option value="lofi">Lo-Fi</option>  
                    </select>  
                </div>  
                <div>  
                    <label className="block text-lg mb-2">Mood</label>  
                    <select  
                        name="mood"  
                        onChange={handleFilterChange}  
                        className="form-input p-2 border-2 border-white bg-black text-white rounded w-full"  
                    >  
                        <option value="all">All Moods</option>  
                        <option value="dark">Dark</option>  
                        <option value="sad">Sad</option>  
                        <option value="happy">Happy</option>  
                        <option value="energetic">Energetic</option>  
                        <option value="chill">Chill</option>  
                    </select>  
                </div>  
            </div>  
            <div className="text-center mt-6">  
                <button onClick={applyFilters} className="btn-custom">  
                    Apply Filters  
                </button>  
            </div>  
        </div>  
    );  
};  

export default Filters;  