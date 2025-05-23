import React, { useState } from "react";  
import PropTypes from "prop-types";  
import { useNavigate } from "react-router-dom";  

/**  
 * Filters Component - Allows users to select filters (BPM, Genre, Mood)   
 * and navigate to the BeatsPage with query parameters.  
 */  
const Filters = ({ onChangeFilters }) => {  
  // Filter states: BPM, Genre, and Mood  
  const [bpm, setBpm] = useState("all");  
  const [genre, setGenre] = useState("all");  
  const [mood, setMood] = useState("all");  

  const navigate = useNavigate();  

  // Update filter values and navigate to Beats Page  
  const handleApplyFilters = (e) => {  
    e.preventDefault();  

    // Combine selected filters  
    const filters = { bpm, genre, mood };  

    // Optional callback for parent components to use filters  
    if (onChangeFilters) {  
      onChangeFilters(filters);  
    }  

    // Convert filters to query parameters and navigate to `/beats`  
    const queryString = new URLSearchParams(filters).toString();  
    navigate(`/beats?${queryString}`);  
  };  

  return (  
    <section id="beats" className="py-20 container mx-auto px-5">  
      <h2 className="text-4xl font-bold mb-10 text-center text-white">  
        🎵 Browse Beats  
      </h2>  

      <div className="filters mb-10 bg-black p-5 border border-red-500 rounded shadow-lg">  
        <h3 className="text-2xl font-bold mb-4 text-center text-red-500">  
          Filter Beats  
        </h3>  

        {/* Filters Form */}  
        <form onSubmit={handleApplyFilters}>  
          <div className="grid md:grid-cols-3 gap-5">  
            {/* BPM Filter */}  
            <div>  
              <label  
                htmlFor="bpm"  
                className="block text-lg font-semibold mb-2 text-gray-300"  
              >  
                BPM  
              </label>  
              <select  
                id="bpm"  
                name="bpm"  
                value={bpm}  
                onChange={(e) => setBpm(e.target.value)}  
                className="form-select w-full p-2 border-2 border-white bg-black text-white rounded focus:ring focus:ring-red-500"  
              >  
                <option value="all">All BPMs</option>  
                <option value="60-90">60-90</option>  
                <option value="91-120">91-120</option>  
                <option value="121-150">121-150</option>  
                <option value="151+">151+</option>  
              </select>  
            </div>  

            {/* Genre Filter */}  
            <div>  
              <label  
                htmlFor="genre"  
                className="block text-lg font-semibold mb-2 text-gray-300"  
              >  
                Genre  
              </label>  
              <select  
                id="genre"  
                name="genre"  
                value={genre}  
                onChange={(e) => setGenre(e.target.value)}  
                className="form-select w-full p-2 border-2 border-white bg-black text-white rounded focus:ring focus:ring-red-500"  
              >  
                <option value="all">All Genres</option>  
                <option value="Trap">Trap</option>  
                <option value="Lofi">Lo-Fi</option>  
                <option value="Drill">Drill</option>  
                <option value="Hip-Hop">Hip-hop</option>  
                <option value="R&B">R&B</option> 
                <option value="Latin">Latin</option>
              </select>  
            </div>  

            {/* Mood Filter */}  
            <div>  
              <label  
                htmlFor="mood"  
                className="block text-lg font-semibold mb-2 text-gray-300"  
              >  
                Mood  
              </label>  
              <select  
                id="mood"  
                name="mood"  
                value={mood}  
                onChange={(e) => setMood(e.target.value)}  
                className="form-select w-full p-2 border-2 border-white bg-black text-white rounded focus:ring focus:ring-red-500"  
              >  
                <option value="all">All Moods</option>  
                <option value="Dark">Dark</option>  
                <option value="hill">Chill</option>  
                <option value="Energetic">Energetic</option>  
                <option value="Westcoast">WestCoast</option>  
                <option value="Wthnic">Ethnic</option>
                <option value="Happy">Happy</option>
                <option value="Sad">Sad</option>
              </select>  
            </div>  
          </div>  

          {/* Apply Filters Button */}  
          <div className="text-center mt-6">  
            <button  
              type="submit"  
              className="text-lg px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"  
            >  
              Apply Filters  
            </button>  
          </div>  
        </form>  
      </div>  
    </section>  
  );  
};  

// PropTypes for Filters component  
Filters.propTypes = {  
  /** Callback function to update filters in parent components (optional) */  
  onChangeFilters: PropTypes.func,  
};  

export default Filters;  